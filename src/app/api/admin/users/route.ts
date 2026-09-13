import { requireApiAdmin, badRequest, json, serverError } from "@/lib/api/guard";
import { writeAudit } from "@/lib/api/audit";
import { inviteSchema } from "@/lib/validation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/** Add a flat member by email — activates an existing profile, or creates an invite. */
export async function POST(req: Request) {
  const { response, profile, supabase } = await requireApiAdmin();
  if (response) return response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid email.");
  const email = parsed.data.email;

  const admin = createSupabaseAdmin();
  const { data: existing } = await admin
    .from("profiles")
    .select("id, role, account_status")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    if (existing.role === "admin") return badRequest("That account is an administrator.");
    if (existing.account_status === "active") return json({ ok: true, message: "That member is already active." });

    const { error } = await supabase!
      .from("profiles")
      .update({ account_status: "active" })
      .eq("id", existing.id);
    if (error) return serverError();

    await writeAudit({
      actorId: profile!.id,
      action: "user.activated",
      targetType: "user",
      targetId: existing.id,
      metadata: { email },
    });
    return json({ ok: true, message: "Member activated." });
  }

  const { error } = await admin
    .from("member_invites")
    .upsert({ email, invited_by: profile!.id }, { onConflict: "email" });
  if (error) return serverError();

  await writeAudit({
    actorId: profile!.id,
    action: "user.invited",
    targetType: "invite",
    targetId: email,
    metadata: { email },
  });
  return json({ ok: true, message: "Invite added — they'll join when they sign in with Google." });
}
