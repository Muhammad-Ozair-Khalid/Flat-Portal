import { z } from "zod";
import { requireApiUser, badRequest, json, serverError } from "@/lib/api/guard";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({ user_id: z.string().uuid() });

/** Get-or-create a 1:1 direct conversation between the caller and another member. */
export async function POST(req: Request) {
  const { response, profile } = await requireApiUser();
  if (response) return response;
  const me = profile!.id;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid user.");
  const other = parsed.data.user_id;
  if (other === me) return badRequest("You can't message yourself.");

  const admin = createSupabaseAdmin();
  const { data: otherProfile } = await admin
    .from("profiles")
    .select("id, account_status")
    .eq("id", other)
    .maybeSingle();
  if (!otherProfile || otherProfile.account_status !== "active") return badRequest("That member isn't available.");

  const dmKey = [me, other].sort().join(":");
  const { data: existing } = await admin.from("conversations").select("id").eq("dm_key", dmKey).maybeSingle();
  if (existing) return json({ id: existing.id });

  const { data: conv, error } = await admin
    .from("conversations")
    .insert({ type: "direct", dm_key: dmKey, created_by: me })
    .select("id")
    .single();
  if (error || !conv) return serverError();

  const { error: mErr } = await admin.from("conversation_members").insert([
    { conversation_id: conv.id, user_id: me },
    { conversation_id: conv.id, user_id: other },
  ]);
  if (mErr) return serverError();

  return json({ id: conv.id });
}
