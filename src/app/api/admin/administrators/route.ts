import { z } from "zod";
import { requireApiAdmin, badRequest, json, serverError } from "@/lib/api/guard";
import { writeAudit } from "@/lib/api/audit";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const bodySchema = z
  .object({
    user_id: z.string().uuid().optional(),
    email: z.email().transform((e) => e.trim().toLowerCase()).optional(),
  })
  .refine((v) => v.user_id || v.email, { message: "Choose a member or enter an email." });

const MAX_ADMINS = 2;

/** Add an administrator: fill a free allow-list slot and promote (or reserve) the account. */
export async function POST(req: Request) {
  const { response, profile } = await requireApiAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid request.");

  const admin = createSupabaseAdmin();

  const { data: allowlist } = await admin.from("admin_allowlist").select("email");
  if ((allowlist?.length ?? 0) >= MAX_ADMINS) {
    return badRequest("Both admin slots are taken. Remove one first.");
  }

  // Resolve the target email + optional existing profile.
  let email = parsed.data.email ?? null;
  let target: { id: string; role: string; account_status: string } | null = null;
  if (parsed.data.user_id) {
    const { data } = await admin
      .from("profiles")
      .select("id, email, role, account_status")
      .eq("id", parsed.data.user_id)
      .maybeSingle();
    if (!data) return badRequest("Member not found.");
    email = data.email;
    target = { id: data.id, role: data.role, account_status: data.account_status };
  } else if (email) {
    const { data } = await admin
      .from("profiles")
      .select("id, email, role, account_status")
      .eq("email", email)
      .maybeSingle();
    if (data) target = { id: data.id, role: data.role, account_status: data.account_status };
  }
  if (!email) return badRequest("Invalid email.");

  if (target?.role === "admin") return badRequest("That account is already an administrator.");
  if ((allowlist ?? []).some((a) => a.email === email)) return badRequest("That email already has an admin slot.");

  // Reserve the slot.
  const { error: alErr } = await admin.from("admin_allowlist").insert({ email });
  if (alErr) return serverError();

  // Promote now if they already have an active profile (the DB trigger still enforces the cap).
  if (target && target.account_status === "active") {
    const { error } = await admin.from("profiles").update({ role: "admin" }).eq("id", target.id);
    if (error) {
      // roll back the reservation so slots stay accurate
      await admin.from("admin_allowlist").delete().eq("email", email);
      return badRequest(error.message);
    }
  }

  await writeAudit({
    actorId: profile!.id,
    action: "user.role_changed",
    targetType: "user",
    targetId: target?.id ?? email,
    metadata: { email, to: "admin", reserved: !target },
  });

  return json({
    ok: true,
    message: target ? "Administrator added." : "Admin slot reserved — they become admin on first sign-in.",
  });
}

/** Remove an administrator: free their allow-list slot and demote them to member. */
export async function DELETE(req: Request) {
  const { response, profile } = await requireApiAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid request.");

  const admin = createSupabaseAdmin();

  let email = parsed.data.email ?? null;
  let targetId: string | null = parsed.data.user_id ?? null;
  if (parsed.data.user_id) {
    const { data } = await admin.from("profiles").select("id, email").eq("id", parsed.data.user_id).maybeSingle();
    if (!data) return badRequest("Account not found.");
    email = data.email;
    targetId = data.id;
  }
  if (!email) return badRequest("Invalid email.");

  if (email === profile!.email.toLowerCase()) {
    return badRequest("You can't remove your own admin access. Ask the other admin.");
  }

  await admin.from("admin_allowlist").delete().eq("email", email);

  // Demote the account if it currently exists as an admin.
  const { data: existing } = await admin.from("profiles").select("id, role").eq("email", email).maybeSingle();
  if (existing?.role === "admin") {
    const { error } = await admin.from("profiles").update({ role: "member" }).eq("id", existing.id);
    if (error) return serverError();
    targetId = existing.id;
  }

  await writeAudit({
    actorId: profile!.id,
    action: "user.role_changed",
    targetType: "user",
    targetId: targetId ?? email,
    metadata: { email, to: "member" },
  });

  return json({ ok: true, message: "Administrator removed." });
}
