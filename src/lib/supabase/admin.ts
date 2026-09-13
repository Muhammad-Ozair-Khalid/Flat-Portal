import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { serverEnv } from "@/lib/env";

/**
 * Service-role Supabase client. BYPASSES Row-Level Security — server only.
 * Use exclusively after verifying the caller's authorization, for operations
 * that legitimately need elevated access (e.g. deleting an auth user, writing
 * notifications for other users, the scheduled overdue sweep).
 */
export function createSupabaseAdmin() {
  return createClient<Database>(serverEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
