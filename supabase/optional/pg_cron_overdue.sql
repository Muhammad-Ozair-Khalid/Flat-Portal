-- ============================================================================
-- OPTIONAL: run the overdue sweep entirely inside Postgres with pg_cron,
-- instead of (or in addition to) the Vercel Cron endpoint.
--
-- This is the most robust "server-side scheduled job" option because it doesn't
-- depend on any external scheduler or the app being deployed.
--
-- In Supabase: Dashboard > Database > Extensions > enable `pg_cron`, then run
-- this in the SQL editor.
-- ============================================================================

create extension if not exists pg_cron;

-- Every 15 minutes, mark past-deadline tasks overdue (fires notification triggers).
select cron.schedule(
  'flat-portal-overdue-sweep',
  '*/15 * * * *',
  $$ select public.mark_overdue_tasks(); $$
);

-- To remove it later:
--   select cron.unschedule('flat-portal-overdue-sweep');
