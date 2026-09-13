import { requireApiAdmin, badRequest, json, serverError } from "@/lib/api/guard";
import { writeAudit } from "@/lib/api/audit";
import { userStatusSchema } from "@/lib/validation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/** Activate / deactivate a member. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response, profile, supabase } = await requireApiAdmin();
  if (response) return response;

  const { id } = await params;
  if (id === profile!.id) return badRequest("You can't change your own status.");

  const body = await req.json().catch(() => null);
  const parsed = userStatusSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid status.");

  const admin = createSupabaseAdmin();
  const { data: target } = await admin
    .from("profiles")
    .select("id, role, email")
    .eq("id", id)
    .maybeSingle();
  if (!target) return badRequest("User not found.");
  if (target.role === "admin") return badRequest("Administrators can't be deactivated.");

  const { error } = await supabase!
    .from("profiles")
    .update({ account_status: parsed.data.account_status })
    .eq("id", id);
  if (error) return serverError();

  await writeAudit({
    actorId: profile!.id,
    action: parsed.data.account_status === "active" ? "user.activated" : "user.deactivated",
    targetType: "user",
    targetId: id,
    metadata: { email: target.email },
  });
  return json({ ok: true });
}

/** Remove a member entirely (deletes the auth user; cascades their data). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response, profile } = await requireApiAdmin();
  if (response) return response;

  const { id } = await params;
  if (id === profile!.id) return badRequest("You can't remove yourself.");

  const admin = createSupabaseAdmin();
  const { data: target } = await admin
    .from("profiles")
    .select("id, role, email")
    .eq("id", id)
    .maybeSingle();
  if (!target) return badRequest("User not found.");
  if (target.role === "admin") return badRequest("Administrators can't be removed.");

  // Record the audit entry before the row disappears.
  await writeAudit({
    actorId: profile!.id,
    action: "user.removed",
    targetType: "user",
    targetId: id,
    metadata: { email: target.email },
  });

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return serverError();
  return json({ ok: true });
}
