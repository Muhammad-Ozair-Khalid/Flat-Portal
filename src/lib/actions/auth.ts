"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { landingPathFor } from "@/lib/auth-routing";

/** Sign the current user out and return to the login screen. */
export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Local development sign-in with email + password. Hard-disabled in production
 * so it can never become an alternate auth path in a real deployment.
 */
export async function devSignIn(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  if (process.env.NODE_ENV === "production") {
    return { error: "Developer sign-in is disabled in production." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter an email and password." };
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let role: string | null = null;
  let status: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
    status = profile?.account_status ?? null;
  }

  redirect(landingPathFor(role, status));
}
