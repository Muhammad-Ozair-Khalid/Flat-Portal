import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Read the current user + their profile (no redirects). */
export async function getAuthContext() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null as Profile | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile: (profile ?? null) as Profile | null };
}

/** Require an authenticated, active user. Redirects otherwise. */
export async function requireProfile() {
  const { supabase, user, profile } = await getAuthContext();
  if (!user || !profile) redirect("/login");
  if (profile.account_status === "pending") redirect("/pending");
  if (profile.account_status === "inactive") redirect("/suspended");
  return { supabase, user, profile };
}

/** Require an active administrator. Members are bounced to their home. */
export async function requireAdmin() {
  const ctx = await requireProfile();
  if (ctx.profile.role !== "admin") redirect("/home");
  return ctx;
}

/** Any active user (admin or member) may access the member area. */
export async function requireMember() {
  return requireProfile();
}
