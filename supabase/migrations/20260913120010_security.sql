-- ============================================================================
-- Flat Portal — functions, triggers, Row-Level Security, realtime & storage
-- Security model:
--   * Every table has RLS enabled; nothing is readable/writable by default.
--   * SECURITY DEFINER helpers (is_admin, is_conversation_member, …) are used
--     inside policies to avoid RLS recursion.
--   * DB triggers enforce the two-admin cap, column protection, task rules,
--     notifications and the audit trail — defense in depth behind the API.
-- ============================================================================

-- ── Helper predicates (definer → bypass RLS, no recursion in policies) ───────
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin' and account_status = 'active'
  );
$$;

create or replace function public.is_active_member(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = uid and account_status = 'active'
  );
$$;

create or replace function public.is_conversation_member(conv uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv and user_id = uid
  );
$$;

create or replace function public.is_task_assignee(task uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.task_assignments where task_id = task and assignee_id = uid
  );
$$;

-- ── updated_at maintenance ───────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── New auth user → profile (role/status from allow-list & invites) ──────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_email  text := lower(new.email);
  v_role   text := 'member';
  v_status account_status := 'pending';
  v_name   text;
  v_avatar text;
begin
  v_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(v_email, '@', 1)
  );
  v_avatar := coalesce(
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'picture'
  );

  if exists (select 1 from public.admin_allowlist a where a.email = v_email) then
    v_role := 'admin';
    v_status := 'active';
  elsif exists (select 1 from public.member_invites m where m.email = v_email) then
    v_role := 'member';
    v_status := 'active';
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, role, account_status, last_login_at)
  values (new.id, v_email, v_name, v_avatar, v_role, v_status, now())
  on conflict (id) do update set last_login_at = now();

  delete from public.member_invites where email = v_email;
  return new;
end;
$$;

-- ── Profile guard rails: column protection + two-admin cap ───────────────────
create or replace function public.enforce_profile_rules()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_admin_count int;
  v_is_service boolean := coalesce(auth.role() = 'service_role', false);
  v_is_admin boolean := public.is_admin(auth.uid());
begin
  if tg_op = 'UPDATE' then
    if not v_is_service and not v_is_admin then
      if new.role is distinct from old.role
         or new.account_status is distinct from old.account_status
         or lower(new.email) is distinct from lower(old.email) then
        raise exception 'Not authorized to change role, status or email';
      end if;
    end if;
  end if;

  if new.role = 'admin' then
    if not exists (select 1 from public.admin_allowlist a where a.email = lower(new.email)) then
      raise exception 'Email % is not authorized to be an administrator', new.email;
    end if;
    select count(*) into v_admin_count
      from public.profiles where role = 'admin' and id <> new.id;
    if v_admin_count >= 2 then
      raise exception 'At most two administrators are allowed';
    end if;
  end if;

  return new;
end;
$$;

-- ── Keep the flat-wide group chat membership in sync with active status ──────
create or replace function public.sync_group_membership()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_group uuid;
begin
  select id into v_group from public.conversations where is_primary limit 1;
  if v_group is null then
    return new;
  end if;

  if new.account_status = 'active' then
    insert into public.conversation_members (conversation_id, user_id)
    values (v_group, new.id)
    on conflict (conversation_id, user_id) do nothing;
  else
    delete from public.conversation_members
    where conversation_id = v_group and user_id = new.id;
  end if;
  return new;
end;
$$;

-- ── Task timestamps & member column/transition protection ────────────────────
create or replace function public.set_task_timestamps()
returns trigger language plpgsql as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at := now();
  elsif new.status <> 'completed' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create or replace function public.protect_task_columns()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_is_service boolean := coalesce(auth.role() = 'service_role', false);
  v_is_admin boolean := public.is_admin(auth.uid());
begin
  if v_is_service or v_is_admin then
    return new;
  end if;

  if not public.is_task_assignee(new.id, auth.uid()) then
    raise exception 'Not authorized to modify this task';
  end if;

  if new.title is distinct from old.title
     or new.description is distinct from old.description
     or new.priority is distinct from old.priority
     or new.deadline is distinct from old.deadline
     or new.start_at is distinct from old.start_at
     or new.created_by is distinct from old.created_by
     or new.attachment_url is distinct from old.attachment_url
     or new.notes is distinct from old.notes then
    raise exception 'Members may only update status and completion note';
  end if;

  if new.status is distinct from old.status
     and new.status not in ('in_progress', 'completed') then
    raise exception 'Members may only set status to in progress or completed';
  end if;

  return new;
end;
$$;

-- ── Notifications (definer → may write rows for other users) ─────────────────
create or replace function public.notify_on_assignment()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_title text;
begin
  select title into v_title from public.tasks where id = new.task_id;
  insert into public.notifications (user_id, type, title, body, data)
  values (new.assignee_id, 'task_assigned', 'New task assigned',
          coalesce(v_title, 'A task') || ' was assigned to you',
          jsonb_build_object('task_id', new.task_id));
  return new;
end;
$$;

create or replace function public.notify_on_task_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'completed' then
    insert into public.notifications (user_id, type, title, body, data)
    select id, 'task_completed', 'Task completed',
           new.title || ' was marked complete', jsonb_build_object('task_id', new.id)
    from public.profiles where role = 'admin' and account_status = 'active';
  elsif new.status = 'overdue' then
    insert into public.notifications (user_id, type, title, body, data)
    select id, 'task_overdue', 'Task overdue',
           new.title || ' passed its deadline', jsonb_build_object('task_id', new.id)
    from public.profiles where role = 'admin' and account_status = 'active';
    insert into public.notifications (user_id, type, title, body, data)
    select ta.assignee_id, 'task_overdue', 'Task overdue',
           new.title || ' is overdue', jsonb_build_object('task_id', new.id)
    from public.task_assignments ta where ta.task_id = new.id;
  end if;
  return new;
end;
$$;

create or replace function public.notify_on_announcement()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, title, body, data)
  select p.id, 'announcement', new.title, new.body,
         jsonb_build_object('announcement_id', new.id)
  from public.profiles p where p.account_status = 'active';
  return new;
end;
$$;

create or replace function public.notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_sender text;
  v_conv record;
  v_title text;
begin
  select full_name into v_sender from public.profiles where id = new.sender_id;
  select type, title from public.conversations where id = new.conversation_id into v_conv;

  v_title := coalesce(v_sender, 'Someone');
  if v_conv.type = 'group' then
    v_title := v_title || ' in ' || coalesce(v_conv.title, 'the group');
  end if;

  insert into public.notifications (user_id, type, title, body, data)
  select cm.user_id, 'new_message', v_title, left(new.body, 140),
         jsonb_build_object('conversation_id', new.conversation_id, 'message_id', new.id)
  from public.conversation_members cm
  where cm.conversation_id = new.conversation_id and cm.user_id <> new.sender_id;
  return new;
end;
$$;

-- ── Audit trail for tasks (user-management audit is written by the API) ──────
create or replace function public.audit_tasks()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_actor uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (v_actor, 'task.created', 'task', new.id::text, jsonb_build_object('title', new.title));
  elsif tg_op = 'UPDATE' then
    if new.status is distinct from old.status and new.status = 'completed' then
      insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
      values (v_actor, 'task.completed', 'task', new.id::text, jsonb_build_object('title', new.title));
    else
      insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
      values (v_actor, 'task.updated', 'task', new.id::text,
              jsonb_build_object('title', new.title, 'status', new.status));
    end if;
  elsif tg_op = 'DELETE' then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (v_actor, 'task.deleted', 'task', old.id::text, jsonb_build_object('title', old.title));
    return old;
  end if;
  return new;
end;
$$;

-- ── Scheduled overdue sweep (called by the cron endpoint / service role) ─────
create or replace function public.mark_overdue_tasks()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  with updated as (
    update public.tasks set status = 'overdue'
     where status in ('pending', 'in_progress')
       and deadline is not null and deadline < now()
     returning id
  )
  select count(*) into v_count from updated;
  return v_count;
end;
$$;

-- ── Attach triggers ──────────────────────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger t10_enforce_profile_rules
  before insert or update on public.profiles
  for each row execute function public.enforce_profile_rules();

create trigger t20_touch_profiles
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger t30_sync_group_membership
  after insert or update of account_status on public.profiles
  for each row execute function public.sync_group_membership();

create trigger t10_protect_task_columns
  before update on public.tasks
  for each row execute function public.protect_task_columns();

create trigger t20_set_task_timestamps
  before update on public.tasks
  for each row execute function public.set_task_timestamps();

create trigger t30_touch_tasks
  before update on public.tasks
  for each row execute function public.touch_updated_at();

create trigger t40_notify_task_status
  after update on public.tasks
  for each row execute function public.notify_on_task_status();

create trigger t50_audit_tasks
  after insert or update or delete on public.tasks
  for each row execute function public.audit_tasks();

create trigger t10_notify_assignment
  after insert on public.task_assignments
  for each row execute function public.notify_on_assignment();

create trigger t10_notify_message
  after insert on public.messages
  for each row execute function public.notify_on_message();

create trigger t10_notify_announcement
  after insert on public.announcements
  for each row execute function public.notify_on_announcement();

-- ── Safe, read-only view of other members (no email / last_login exposed) ────
create view public.public_profiles as
  select id, full_name, avatar_url, role, account_status
  from public.profiles
  where account_status = 'active';

-- Runs with the view owner's privileges so members can read other members'
-- *safe* columns only. The base profiles table stays locked down by RLS.
alter view public.public_profiles set (security_invoker = false);

-- ── Enable Row-Level Security on every table ────────────────────────────────
alter table public.roles                 enable row level security;
alter table public.admin_allowlist       enable row level security;
alter table public.member_invites        enable row level security;
alter table public.profiles              enable row level security;
alter table public.tasks                 enable row level security;
alter table public.task_assignments      enable row level security;
alter table public.conversations         enable row level security;
alter table public.conversation_members  enable row level security;
alter table public.messages              enable row level security;
alter table public.notifications         enable row level security;
alter table public.announcements         enable row level security;
alter table public.locations             enable row level security;
alter table public.audit_logs            enable row level security;

-- ── Policies ─────────────────────────────────────────────────────────────────
-- roles: readable lookup
create policy roles_select on public.roles for select to authenticated using (true);

-- admin_allowlist / member_invites: admins only
create policy allowlist_select on public.admin_allowlist for select to authenticated using (public.is_admin(auth.uid()));
create policy invites_select on public.member_invites for select to authenticated using (public.is_admin(auth.uid()));
create policy invites_insert on public.member_invites for insert to authenticated with check (public.is_admin(auth.uid()));
create policy invites_delete on public.member_invites for delete to authenticated using (public.is_admin(auth.uid()));

-- profiles: self or admin (email/last_login never leak to other members)
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()))
  with check (id = auth.uid() or public.is_admin(auth.uid()));
create policy profiles_delete on public.profiles for delete to authenticated
  using (public.is_admin(auth.uid()));

-- tasks: admin, creator, or assignee
create policy tasks_select on public.tasks for select to authenticated
  using (public.is_admin(auth.uid()) or created_by = auth.uid() or public.is_task_assignee(id, auth.uid()));
create policy tasks_insert on public.tasks for insert to authenticated
  with check (public.is_admin(auth.uid()));
create policy tasks_update on public.tasks for update to authenticated
  using (public.is_admin(auth.uid()) or public.is_task_assignee(id, auth.uid()))
  with check (public.is_admin(auth.uid()) or public.is_task_assignee(id, auth.uid()));
create policy tasks_delete on public.tasks for delete to authenticated
  using (public.is_admin(auth.uid()));

-- task_assignments: admin manages; assignee can read own
create policy ta_select on public.task_assignments for select to authenticated
  using (public.is_admin(auth.uid()) or assignee_id = auth.uid());
create policy ta_insert on public.task_assignments for insert to authenticated
  with check (public.is_admin(auth.uid()));
create policy ta_delete on public.task_assignments for delete to authenticated
  using (public.is_admin(auth.uid()));

-- conversations
create policy conv_select on public.conversations for select to authenticated
  using (public.is_conversation_member(id, auth.uid()) or (type = 'group' and public.is_admin(auth.uid())));
create policy conv_insert on public.conversations for insert to authenticated
  with check (
    (type = 'direct' and created_by = auth.uid() and public.is_active_member(auth.uid()))
    or (type = 'group' and public.is_admin(auth.uid()))
  );
create policy conv_update on public.conversations for update to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy conv_delete on public.conversations for delete to authenticated
  using (public.is_admin(auth.uid()));

-- conversation_members: read co-members; update own read cursor
create policy cm_select on public.conversation_members for select to authenticated
  using (user_id = auth.uid() or public.is_conversation_member(conversation_id, auth.uid()) or public.is_admin(auth.uid()));
create policy cm_update on public.conversation_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- messages: members of the conversation only (active users)
create policy msg_select on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()) and public.is_active_member(auth.uid()));
create policy msg_insert on public.messages for insert to authenticated
  with check (sender_id = auth.uid()
    and public.is_conversation_member(conversation_id, auth.uid())
    and public.is_active_member(auth.uid()));
create policy msg_update on public.messages for update to authenticated
  using (sender_id = auth.uid()) with check (sender_id = auth.uid());
create policy msg_delete on public.messages for delete to authenticated
  using (sender_id = auth.uid() or public.is_admin(auth.uid()));

-- notifications: recipient only
create policy notif_select on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notif_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notif_delete on public.notifications for delete to authenticated using (user_id = auth.uid());

-- announcements: all active users read; admins write
create policy ann_select on public.announcements for select to authenticated using (public.is_active_member(auth.uid()));
create policy ann_insert on public.announcements for insert to authenticated with check (public.is_admin(auth.uid()));
create policy ann_update on public.announcements for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy ann_delete on public.announcements for delete to authenticated using (public.is_admin(auth.uid()));

-- locations: OWN row, or admin. This is the core location-privacy control.
create policy loc_select on public.locations for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy loc_insert on public.locations for insert to authenticated
  with check (user_id = auth.uid());
create policy loc_update on public.locations for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy loc_delete on public.locations for delete to authenticated
  using (user_id = auth.uid());

-- audit_logs: admins read; immutable (writes via triggers / service role)
create policy audit_select on public.audit_logs for select to authenticated using (public.is_admin(auth.uid()));

-- ── Grants (RLS still governs row access) ────────────────────────────────────
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all privileges on all tables in schema public to service_role;
grant select on public.public_profiles to authenticated;

-- Only the service role may run the overdue sweep.
revoke execute on function public.mark_overdue_tasks() from public;
grant execute on function public.mark_overdue_tasks() to service_role;

-- ── Realtime publication (RLS is still applied to realtime reads) ───────────-
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      public.messages, public.notifications, public.tasks, public.task_assignments,
      public.locations, public.conversations, public.conversation_members, public.announcements;
  end if;
end $$;

-- ── Storage bucket for avatars (public read, owner-only write) ───────────────
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('avatars', 'avatars', true)
    on conflict (id) do nothing;
  end if;

  if to_regclass('storage.objects') is not null then
    drop policy if exists "avatars_public_read" on storage.objects;
    create policy "avatars_public_read" on storage.objects
      for select using (bucket_id = 'avatars');

    drop policy if exists "avatars_owner_write" on storage.objects;
    create policy "avatars_owner_write" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

    drop policy if exists "avatars_owner_update" on storage.objects;
    create policy "avatars_owner_update" on storage.objects
      for update to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

    drop policy if exists "avatars_owner_delete" on storage.objects;
    create policy "avatars_owner_delete" on storage.objects
      for delete to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
