import { requireMember } from "@/lib/auth";
import { MemberTaskList } from "./task-list";
import type { Task } from "@/lib/types";

export default async function TasksPage() {
  const { profile, supabase } = await requireMember();

  const { data } = await supabase
    .from("task_assignments")
    .select(
      "tasks(id,title,description,status,priority,start_at,deadline,completion_note,notes,created_at,completed_at,created_by,updated_at)",
    )
    .eq("assignee_id", profile.id);

  const tasks = ((data ?? []) as unknown as { tasks: Task | null }[])
    .map((r) => r.tasks)
    .filter((t): t is Task => !!t)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const creatorIds = [...new Set(tasks.map((t) => t.created_by).filter(Boolean))] as string[];
  const { data: creators } = creatorIds.length
    ? await supabase.from("public_profiles").select("id, full_name").in("id", creatorIds)
    : { data: [] };
  const creatorNames = Object.fromEntries((creators ?? []).map((c) => [c.id, c.full_name])) as Record<
    string,
    string | null
  >;

  return <MemberTaskList tasks={tasks} creatorNames={creatorNames} />;
}
