/**
 * Task + notification pipeline tests against LOCAL Supabase.
 * Run: node --env-file=.env.local scripts/test-tasks.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!/127\.0\.0\.1|localhost/.test(url ?? "")) process.exit(1);

const svc = createClient(url, service, { auth: { persistSession: false } });
let pass = 0, fail = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "✓ PASS" : "✗ FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  ok ? pass++ : fail++;
};
async function signedIn(email) {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: "password123" });
  if (error) throw new Error(`${email}: ${error.message}`);
  return c;
}

const { data: profs } = await svc.from("profiles").select("id, email");
const id = Object.fromEntries(profs.map((p) => [p.email, p.id]));
const admin1 = id["admin.one@gmail.com"];
const alex = id["alex@flat.test"];
const mia = id["mia@flat.test"];

const adminC = await signedIn("admin.one@gmail.com");

// 1. Create + assign
const { data: task, error: tErr } = await adminC
  .from("tasks")
  .insert({ title: "Wash the dishes", created_by: admin1, priority: "high" })
  .select("id")
  .single();
check("admin creates a task", !tErr && !!task?.id, tErr?.message);

const { error: aErr } = await adminC.from("task_assignments").insert({ task_id: task.id, assignee_id: alex });
check("admin assigns the task", !aErr, aErr?.message ?? "");

const { data: assignNotif } = await svc
  .from("notifications")
  .select("id")
  .eq("user_id", alex)
  .eq("type", "task_assigned")
  .contains("data", { task_id: task.id });
check("assignee received task_assigned notification", (assignNotif?.length ?? 0) >= 1);

// 2. Member completes
const alexC = await signedIn("alex@flat.test");
const { error: cErr } = await alexC
  .from("tasks")
  .update({ status: "completed", completion_note: "All done!" })
  .eq("id", task.id);
check("member completes their own task", !cErr, cErr?.message ?? "");

const { data: taskAfter } = await svc.from("tasks").select("status, completed_at").eq("id", task.id).single();
check("completed_at was set", taskAfter?.status === "completed" && !!taskAfter?.completed_at);

const { data: doneNotif } = await svc
  .from("notifications")
  .select("id")
  .eq("user_id", admin1)
  .eq("type", "task_completed")
  .contains("data", { task_id: task.id });
check("admins received task_completed notification", (doneNotif?.length ?? 0) >= 1);

const { data: audit } = await svc
  .from("audit_logs")
  .select("id")
  .eq("action", "task.completed")
  .eq("target_id", task.id);
check("audit recorded task.completed", (audit?.length ?? 0) >= 1);

// 3. Member cannot tamper with protected fields
const { error: tamper } = await alexC.from("tasks").update({ title: "hacked" }).eq("id", task.id);
check("member cannot change task title", !!tamper, tamper?.message ?? "no error!");

// 4. Overdue sweep
const past = new Date(Date.now() - 3600_000).toISOString();
const { data: otask } = await adminC
  .from("tasks")
  .insert({ title: "Overdue chore", created_by: admin1, priority: "medium", deadline: past })
  .select("id")
  .single();
await adminC.from("task_assignments").insert({ task_id: otask.id, assignee_id: mia });

const { error: sweepErr } = await svc.rpc("mark_overdue_tasks");
check("service role can run overdue sweep", !sweepErr, sweepErr?.message ?? "");

const { data: otaskAfter } = await svc.from("tasks").select("status").eq("id", otask.id).single();
check("past-deadline task became overdue", otaskAfter?.status === "overdue");

const { data: overdueNotif } = await svc
  .from("notifications")
  .select("id")
  .eq("type", "task_overdue")
  .contains("data", { task_id: otask.id });
check("overdue notifications generated", (overdueNotif?.length ?? 0) >= 1);

const { error: rpcErr } = await alexC.rpc("mark_overdue_tasks");
check("member cannot run overdue sweep", !!rpcErr, rpcErr?.message ?? "no error!");

// cleanup
await svc.from("tasks").delete().in("id", [task.id, otask.id]);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
