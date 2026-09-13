-- Supabase's default privileges grant EXECUTE on new functions directly to
-- anon/authenticated, so revoking from PUBLIC alone is insufficient. Explicitly
-- remove it so only the service role (the scheduled cron) can run the sweep.
revoke execute on function public.mark_overdue_tasks() from anon, authenticated;
grant execute on function public.mark_overdue_tasks() to service_role;
