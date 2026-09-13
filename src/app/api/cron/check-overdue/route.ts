import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Scheduled overdue-task sweep. Marks past-deadline tasks as overdue (which fires
 * the notification triggers). Protected by CRON_SECRET so it can't be triggered
 * by the public. Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>`
 * when the CRON_SECRET env var is set.
 */
function authorized(req: Request): boolean {
  const secret = serverEnv.cronSecret;
  if (!secret) return false;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return new URL(req.url).searchParams.get("secret") === secret;
}

async function handle(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.rpc("mark_overdue_tasks");
  if (error) {
    return NextResponse.json({ error: "Sweep failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, marked_overdue: data ?? 0, ran_at: new Date().toISOString() });
}

export const GET = handle;
export const POST = handle;
