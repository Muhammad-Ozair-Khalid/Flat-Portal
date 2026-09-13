-- ============================================================================
-- Flat Portal — seed data (applied by `supabase db reset`)
-- ============================================================================

-- Role lookup
insert into public.roles (name, label, description) values
  ('admin',  'Administrator', 'Full administrative access to the flat.'),
  ('member', 'Flat member',   'Standard flat-member access.')
on conflict (name) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- The two authorized administrators. EXACTLY TWO, lowercase Gmail addresses.
-- Replace the placeholders below with the same values you put in ADMIN_EMAILS.
-- The first time each of these signs in with Google they become an active admin;
-- no "create admin" button exists anywhere in the app.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.admin_allowlist (email) values
  ('admin.one@gmail.com'),
  ('admin.two@gmail.com')
on conflict (email) do nothing;

-- The single flat-wide group conversation (both admins + all active members).
insert into public.conversations (id, type, title, is_primary)
values ('00000000-0000-0000-0000-000000000001', 'group', 'Flat Group', true)
on conflict (id) do nothing;
