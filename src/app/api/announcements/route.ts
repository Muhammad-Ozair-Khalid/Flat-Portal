import { requireApiAdmin, badRequest, json, serverError } from "@/lib/api/guard";
import { writeAudit } from "@/lib/api/audit";
import { announcementSchema } from "@/lib/validation";

/** Admin: post an announcement (trigger fans it out to every active member). */
export async function POST(req: Request) {
  const { response, profile, supabase } = await requireApiAdmin();
  if (response) return response;

  const body = await req.json().catch(() => null);
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid announcement.");

  const { data, error } = await supabase
    .from("announcements")
    .insert({ title: parsed.data.title, body: parsed.data.body, created_by: profile!.id })
    .select("id")
    .single();
  if (error || !data) return serverError();

  await writeAudit({
    actorId: profile!.id,
    action: "announcement.created",
    targetType: "announcement",
    targetId: data.id,
    metadata: { title: parsed.data.title },
  });
  return json({ ok: true });
}
