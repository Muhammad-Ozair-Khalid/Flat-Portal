import { requireApiUser, requireApiAdmin, badRequest, json, serverError } from "@/lib/api/guard";
import { taskUpdateSchema, memberTaskUpdateSchema } from "@/lib/validation";

/** Update a task. Admins may change anything; members (assignees) may only
 *  move status to in_progress/completed and add a completion note.
 *  RLS + DB triggers enforce this again at the database level. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response, profile, supabase } = await requireApiUser();
  if (response) return response;
  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (profile!.role === "admin") {
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid update.");
    const { assignee_id, ...fields } = parsed.data;

    if (Object.keys(fields).length > 0) {
      const { error } = await supabase.from("tasks").update(fields).eq("id", id);
      if (error) return serverError();
    }
    if (assignee_id) {
      await supabase.from("task_assignments").delete().eq("task_id", id);
      const { error } = await supabase.from("task_assignments").insert({ task_id: id, assignee_id });
      if (error) return serverError();
    }
    return json({ ok: true });
  }

  // Member path
  const parsed = memberTaskUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid update.");
  const { error } = await supabase
    .from("tasks")
    .update({
      status: parsed.data.status,
      completion_note: parsed.data.completion_note || null,
    })
    .eq("id", id);
  if (error) return badRequest("You can only update tasks assigned to you.");
  return json({ ok: true });
}

/** Admin: delete a task (cascades assignments; audit trigger records it). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response, supabase } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return serverError();
  return json({ ok: true });
}
