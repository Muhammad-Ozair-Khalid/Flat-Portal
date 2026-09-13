"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Loader2, ListChecks, XCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { fmtDate, isOverdue } from "@/lib/format";
import type { TaskPriority, TaskStatus } from "@/lib/types";

type Member = { id: string; full_name: string | null; email: string; avatar_url: string | null };
type AdminTask = {
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
  assignee: Member | null;
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : "");

const emptyForm = {
  title: "",
  description: "",
  assignee_id: "",
  priority: "medium" as TaskPriority,
  start_at: "",
  deadline: "",
  notes: "",
};

export function TasksManager({ tasks, members }: { tasks: AdminTask[]; members: Member[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [priorityF, setPriorityF] = useState("all");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AdminTask | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<AdminTask | null>(null);

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (q && !`${t.title} ${t.assignee?.full_name ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (statusF !== "all" && t.status !== statusF) return false;
        if (priorityF !== "all" && t.priority !== priorityF) return false;
        return true;
      }),
    [tasks, q, statusF, priorityF],
  );

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, assignee_id: members[0]?.id ?? "" });
    setFormOpen(true);
  }
  function openEdit(t: AdminTask) {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description ?? "",
      assignee_id: t.assignee?.id ?? "",
      priority: t.priority,
      start_at: toLocalInput(t.start_at),
      deadline: toLocalInput(t.deadline),
      notes: t.notes ?? "",
    });
    setFormOpen(true);
  }

  async function call(url: string, options: RequestInit, okMsg: string) {
    setBusy(true);
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      toast.success(okMsg);
      router.refresh();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.assignee_id) {
      toast.error("Choose who to assign this to.");
      return;
    }
    const payload = {
      title: form.title,
      description: form.description || "",
      assignee_id: form.assignee_id,
      priority: form.priority,
      start_at: fromLocalInput(form.start_at),
      deadline: fromLocalInput(form.deadline),
      notes: form.notes || "",
    };
    const ok = editing
      ? await call(`/api/tasks/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) }, "Task updated.")
      : await call("/api/tasks", { method: "POST", body: JSON.stringify(payload) }, "Task created and assigned.");
    if (ok) setFormOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Tasks</h1>
          <p className="mt-1 text-muted-foreground">{tasks.length} total · assign and track chores.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New task
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks or assignees"
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-ring"
          />
        </div>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-ring">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={priorityF} onChange={(e) => setPriorityF(e.target.value)} className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-ring">
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={ListChecks} title="No tasks" description="Create a task and assign it to a flatmate." />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Card key={t.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">{t.title}</p>
                  <PriorityBadge priority={t.priority} />
                </div>
                {t.description && <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{t.description}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className={isOverdue(t.deadline) && t.status !== "completed" ? "text-danger" : ""}>
                    {t.deadline ? `Due ${fmtDate(t.deadline)}` : "No deadline"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:w-48">
                {t.assignee ? (
                  <>
                    <Avatar name={t.assignee.full_name} email={t.assignee.email} src={t.assignee.avatar_url} size={28} />
                    <span className="truncate text-sm text-foreground">{t.assignee.full_name ?? t.assignee.email}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>
              <StatusBadge status={t.status} />
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(t)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted" aria-label="Edit task">
                  <Pencil className="h-4 w-4" />
                </button>
                {t.status !== "cancelled" && t.status !== "completed" && (
                  <button
                    onClick={() => call(`/api/tasks/${t.id}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) }, "Task cancelled.")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
                    aria-label="Cancel task"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setConfirmDelete(t)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-danger hover:bg-danger/10" aria-label="Delete task">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit task" : "New task"} className="max-w-lg">
        <form onSubmit={submitForm} className="space-y-3">
          <Field label="Title">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="e.g. Take out the recycling" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input" placeholder="Optional details" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Assign to">
              <select required value={form.assignee_id} onChange={(e) => setForm({ ...form, assignee_id: e.target.value })} className="input">
                <option value="">Choose…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name ?? m.email}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} className="input" />
            </Field>
            <Field label="Deadline">
              <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && call(`/api/tasks/${confirmDelete.id}`, { method: "DELETE" }, "Task deleted.").then((ok) => ok && setConfirmDelete(null))}
        title="Delete this task?"
        description="This permanently removes the task and its assignment."
        confirmLabel="Delete task"
        loading={busy}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
