import { requireApiAdmin, json, serverError } from "@/lib/api/guard";

/** Admin: delete an announcement. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response, supabase } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return serverError();
  return json({ ok: true });
}
