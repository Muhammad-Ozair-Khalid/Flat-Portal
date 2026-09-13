import { requireAdmin } from "@/lib/auth";
import { TasksManager } from "./tasks-manager";
import type { TaskPriority, TaskStatus } from "@/lib/types";

type Member = { id: string; full_name: string | null; email: string; avatar_url: string | null };
type RawRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start_at: string | null;
  deadline: string | null;
  completion_note: string | null;
  notes: string | null;
  created_at: string;
  task_assignments: { assignee: Member | null }[];
};

export default async function AdminTasksPage() {
  const { supabase } = await requireAdmin();

  const { data: taskData } = await supabase
    .from("tasks")
    .select(
      "id,title,description,status,priority,start_at,deadline,completion_note,notes,created_at, task_assignments(assignee:profiles!task_assignments_assignee_id_fkey(id,full_name,avatar_url,email))",
    )
    .order("created_at", { ascending: false });

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("account_status", "active")
    .order("full_name", { ascending: true });

  const tasks = ((taskData ?? []) as unknown as RawRow[]).map(({ task_assignments, ...rest }) => ({
    ...rest,
    assignee: task_assignments?.[0]?.assignee ?? null,
  }));

  return <TasksManager tasks={tasks} members={(members ?? []) as Member[]} />;
}
