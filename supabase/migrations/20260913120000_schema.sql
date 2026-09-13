-- ============================================================================
-- Flat Portal — core schema
-- Normalized tables for users, roles, tasks, messaging, notifications,
-- announcements, locations and audit logs. Row-Level Security is added in a
-- later migration (…_security.sql). Nothing here trusts the client.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── Enumerated types ────────────────────────────────────────────────────────
create type account_status as enum ('pending', 'active', 'inactive');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type task_status as enum ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');
create type conversation_type as enum ('group', 'direct');
create type notification_type as enum (
  'task_assigned', 'task_completed', 'task_overdue', 'task_updated',
  'new_message', 'announcement', 'member_added', 'member_removed',
  'member_deactivated', 'system'
);

-- ── Role lookup (normalized role system) ────────────────────────────────────
create table public.roles (
  name        text primary key,
  label       text not null,
  description text
);

-- ── Allow-list of the (exactly two) authorized administrators ────────────────
-- Seeded from ADMIN_EMAILS. A DB trigger refuses to grant the admin role to any
-- email not present here, and caps the number of admins at two.
create table public.admin_allowlist (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- ── Pending member invitations (admin "adds" a member by email) ─────────────
create table public.member_invites (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  invited_by uuid,
  created_at timestamptz not null default now()
);

-- ── Profiles (one row per authenticated user) ───────────────────────────────
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text not null unique,
  full_name      text,
  avatar_url     text,
  role           text not null default 'member' references public.roles (name),
  account_status account_status not null default 'pending',
  created_at     timestamptz not null default now(),
  last_login_at  timestamptz,
  updated_at     timestamptz not null default now()
);

alter table public.member_invites
  add constraint member_invites_invited_by_fkey
  foreign key (invited_by) references public.profiles (id) on delete set null;

create index profiles_role_idx on public.profiles (role);
create index profiles_status_idx on public.profiles (account_status);
create unique index profiles_email_lower_idx on public.profiles (lower(email));

-- ── Tasks ───────────────────────────────────────────────────────────────────
create table public.tasks (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 1 and 200),
  description     text check (description is null or char_length(description) <= 4000),
  created_by      uuid not null references public.profiles (id) on delete cascade,
  priority        task_priority not null default 'medium',
  status          task_status not null default 'pending',
  start_at        timestamptz,
  deadline        timestamptz,
  completion_note text check (completion_note is null or char_length(completion_note) <= 2000),
  attachment_url  text,
  notes           text check (notes is null or char_length(notes) <= 2000),
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index tasks_status_idx on public.tasks (status);
create index tasks_deadline_idx on public.tasks (deadline);
create index tasks_created_by_idx on public.tasks (created_by);

-- ── Task assignments (a task may be assigned to one or more members) ─────────
create table public.task_assignments (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks (id) on delete cascade,
  assignee_id uuid not null references public.profiles (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (task_id, assignee_id)
);

create index task_assignments_assignee_idx on public.task_assignments (assignee_id);
create index task_assignments_task_idx on public.task_assignments (task_id);

-- ── Conversations & membership ──────────────────────────────────────────────
create table public.conversations (
  id         uuid primary key default gen_random_uuid(),
  type       conversation_type not null,
  title      text,
  is_primary boolean not null default false, -- the single flat-wide group chat
  dm_key     text unique,                    -- sorted "<uid>:<uid>" for direct chats
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Only one primary group conversation may exist.
create unique index conversations_single_primary_idx
  on public.conversations (is_primary)
  where is_primary;

create table public.conversation_members (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  last_read_at    timestamptz not null default now(),
  joined_at       timestamptz not null default now(),
  unique (conversation_id, user_id)
);

create index conversation_members_user_idx on public.conversation_members (user_id);
create index conversation_members_conv_idx on public.conversation_members (conversation_id);

-- ── Messages ────────────────────────────────────────────────────────────────
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 4000),
  created_at      timestamptz not null default now(),
  edited_at       timestamptz
);

create index messages_conv_created_idx on public.messages (conversation_id, created_at desc);

-- ── Notifications ───────────────────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       notification_type not null,
  title      text not null,
  body       text,
  data       jsonb not null default '{}'::jsonb,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

-- ── Announcements ───────────────────────────────────────────────────────────
create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles (id) on delete set null,
  title      text not null check (char_length(title) between 1 and 200),
  body       text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index announcements_created_idx on public.announcements (created_at desc);

-- ── Locations (current position only — minimal retention) ───────────────────
create table public.locations (
  user_id         uuid primary key references public.profiles (id) on delete cascade,
  sharing_enabled boolean not null default false,
  latitude        double precision,
  longitude       double precision,
  accuracy        double precision,
  updated_at      timestamptz not null default now()
);

-- ── Audit log (immutable record of important actions) ───────────────────────
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id);

-- Replica identity FULL so realtime UPDATE/DELETE events carry old values.
alter table public.messages replica identity full;
alter table public.notifications replica identity full;
alter table public.tasks replica identity full;
alter table public.task_assignments replica identity full;
alter table public.locations replica identity full;
alter table public.conversation_members replica identity full;
