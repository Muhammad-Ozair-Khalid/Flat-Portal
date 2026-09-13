import "server-only";

import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
export const unauthorized = () => json({ error: "You must be signed in." }, 401);
export const forbidden = () => json({ error: "You don't have permission to do that." }, 403);
export const badRequest = (message: string) => json({ error: message }, 400);
export const serverError = () => json({ error: "Something went wrong. Please try again." }, 500);

async function context(): Promise<{ supabase: Client; user: { id: string } | null; profile: Profile | null }> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { supabase, user, profile: (profile ?? null) as Profile | null };
}

/** Resolve the caller; returns a `response` to short-circuit if unauthenticated/inactive. */
export async function requireApiUser() {
  const ctx = await context();
  if (!ctx.user || !ctx.profile) return { ...ctx, response: unauthorized() as NextResponse | null };
  if (ctx.profile.account_status !== "active")
    return { ...ctx, response: forbidden() as NextResponse | null };
  return { ...ctx, user: ctx.user, profile: ctx.profile, response: null as NextResponse | null };
}

/** Resolve the caller and require the admin role. */
export async function requireApiAdmin() {
  const ctx = await requireApiUser();
  if (ctx.response) return ctx;
  if (ctx.profile!.role !== "admin") return { ...ctx, response: forbidden() as NextResponse | null };
  return ctx;
}
