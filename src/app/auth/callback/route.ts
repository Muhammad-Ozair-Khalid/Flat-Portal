import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { landingPathFor, isSafeNext } from "@/lib/auth-routing";

/** Google OAuth redirect target: exchanges the code for a session, records the
 *  login, and routes the user by role + account status. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");

  // Respect the deployment's public origin when behind a proxy.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const base = forwardedHost ? `${proto}://${forwardedHost}` : url.origin;

  if (!code) {
    return NextResponse.redirect(`${base}/auth/auth-error`);
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${base}/auth/auth-error`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  let status: string | null = null;
  if (user) {
    await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
    status = profile?.account_status ?? null;
  }

  const fallback = isSafeNext(nextParam) ? nextParam : "/home";
  return NextResponse.redirect(`${base}${landingPathFor(role, status, fallback)}`);
}
