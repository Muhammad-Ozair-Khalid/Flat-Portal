import { requireApiAdmin, badRequest, json, serverError } from "@/lib/api/guard";
import { writeAudit } from "@/lib/api/audit";
import { inviteSchema } from "@/lib/validation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/** Revoke a pending invite (before the person has signed in). */
export async function DELETE(req: Request) {
  const { response, profile } = await requireApiAdmin();
  if (response) return response;

  const body = await req.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid email.");

  const admin = createSupabaseAdmin();
  const { error } = await admin.from("member_invites").delete().eq("email", parsed.data.email);
  if (error) return serverError();

  await writeAudit({
    actorId: profile!.id,
    action: "user.invite_revoked",
    targetType: "invite",
    targetId: parsed.data.email,
    metadata: { email: parsed.data.email },
  });
  return json({ ok: true });
}
