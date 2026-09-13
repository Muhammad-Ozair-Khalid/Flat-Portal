import "server-only";

/**
 * Server-side environment access. Values are read lazily so that `next build`
 * succeeds even before secrets are configured; a clear error is thrown the first
 * time a missing variable is actually needed at request time.
 *
 * NEXT_PUBLIC_* values are referenced statically in client code (so Next can
 * inline them) — do not read those through here on the client.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const serverEnv = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get serviceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  },
  get cronSecret() {
    return required("CRON_SECRET");
  },
  get adminEmails() {
    return (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  },
};
