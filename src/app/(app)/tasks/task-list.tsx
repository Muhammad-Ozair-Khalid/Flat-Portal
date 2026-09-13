"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Play, Loader2, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { fmtDate, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

const TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "overdue", label: "Overdue" },
] as const;

export function MemberTaskList({
  tasks,
  creatorNames,
}: {
  tasks: Task[];
  creatorNames: Record<string, string | null>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [completing, setCompleting] = useState<Task | null>(null);
  const [note, setNote] = useState("");

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (tab === "all") return true;
        if (tab === "open") return t.status === "pending";
        return t.status === tab;
      }),
    [tasks, tab],
  );

  async function update(task: Task, body: Record<string, unknown>, msg: string) {
    setBusyId(task.id);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      toast.success(msg);
      router.refresh();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function confirmComplete() {
    if (!completing) return;
    const ok = await update(completing, { status: "completed", completion_note: note }, "Nice — task completed!");
    if (ok) {
      setCompleting(null);
      setNote("");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">My tasks</h1>
        <p className="mt-1 text-muted-foreground">Everything assigned to you.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={ClipboardList} title="Nothing here" description="No tasks in this view." />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const overdue = isOverdue(t.deadline) && t.status !== "completed" && t.status !== "cancelled";
            return (
              <Card key={t.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{t.title}</p>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    {t.description && <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className={overdue ? "font-medium text-danger" : ""}>
                        {t.deadline ? `Due ${fmtDate(t.deadline)}` : "No deadline"}
                      </span>
                      <span>Assigned by {creatorNames[t.created_by] ?? "Admin"}</span>
                    </div>
                    {t.completion_note && t.status === "completed" && (
                      <p className="mt-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-foreground">
                        <span className="font-medium">Your note:</span> {t.completion_note}
                      </p>
                    )}
                  </div>

                  {t.status !== "completed" && t.status !== "cancelled" && (
                    <div className="flex shrink-0 items-center gap-2">
                      {t.status === "pending" && (
                        <Button variant="outline" size="sm" disabled={busyId === t.id} onClick={() => update(t, { status: "in_progress" }, "Marked as in progress.")}>
                          <Play className="h-3.5 w-3.5" /> Start
                        </Button>
                      )}
                      <Button size="sm" disabled={busyId === t.id} onClick={() => setCompleting(t)}>
                        {busyId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Complete
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!completing}
        onClose={() => setCompleting(null)}
        title="Mark task complete"
        description={completing?.title}
      >
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">Add a note (optional)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="input" placeholder="e.g. Done — bins are out front." />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCompleting(null)} disabled={busyId !== null}>Cancel</Button>
            <Button onClick={confirmComplete} disabled={busyId !== null}>
              {busyId !== null && <Loader2 className="h-4 w-4 animate-spin" />} Mark complete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
