import * as React from "react";
import { cn } from "@/lib/utils";
import type { TaskStatus, TaskPriority } from "@/lib/types";

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/12 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/12 text-danger",
  info: "bg-info/12 text-info",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const STATUS: Record<TaskStatus, { tone: Tone; label: string }> = {
  pending: { tone: "neutral", label: "Pending" },
  in_progress: { tone: "info", label: "In progress" },
  completed: { tone: "success", label: "Completed" },
  overdue: { tone: "danger", label: "Overdue" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

const PRIORITY: Record<TaskPriority, { tone: Tone; label: string }> = {
  low: { tone: "neutral", label: "Low" },
  medium: { tone: "info", label: "Medium" },
  high: { tone: "warning", label: "High" },
  urgent: { tone: "danger", label: "Urgent" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const s = STATUS[status];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const p = PRIORITY[priority];
  return <Badge tone={p.tone}>{p.label}</Badge>;
}
