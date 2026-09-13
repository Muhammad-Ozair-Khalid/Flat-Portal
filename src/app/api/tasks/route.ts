import { requireApiAdmin, badRequest, json, serverError } from "@/lib/api/guard";
import { taskCreateSchema } from "@/lib/validation";

/** Admin: create a task and assign it (assignment trigger notifies the assignee). */
export async function POST(req: Request) {
  const { response, profile, supabase } = await requireApiAdmin();
  if (response) return response;

  const body = await req.json().catch(() => null);
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid task.");
  const d = parsed.data;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title: d.title,
      description: d.description || null,
      created_by: profile!.id,
      priority: d.priority,
      start_at: d.start_at || null,
      deadline: d.deadline || null,
      notes: d.notes || null,
    })
    .select("id")
    .single();
  if (error || !task) return serverError();

  const { error: assignError } = await supabase
    .from("task_assignments")
    .insert({ task_id: task.id, assignee_id: d.assignee_id });
  if (assignError) return serverError();

  return json({ ok: true, id: task.id });
}
