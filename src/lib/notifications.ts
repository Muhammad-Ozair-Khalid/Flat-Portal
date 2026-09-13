import type { LucideIcon } from "lucide-react";
import {
  ListChecks,
  CheckCircle2,
  AlertTriangle,
  MessageSquareText,
  Megaphone,
  UserPlus,
  UserMinus,
  Bell,
} from "lucide-react";

export type NotifTone = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

export function notifMeta(type: string): { icon: LucideIcon; tone: NotifTone } {
  switch (type) {
    case "task_assigned":
      return { icon: ListChecks, tone: "info" };
    case "task_completed":
      return { icon: CheckCircle2, tone: "success" };
    case "task_overdue":
      return { icon: AlertTriangle, tone: "danger" };
    case "task_updated":
      return { icon: ListChecks, tone: "neutral" };
    case "new_message":
      return { icon: MessageSquareText, tone: "primary" };
    case "announcement":
      return { icon: Megaphone, tone: "warning" };
    case "member_added":
      return { icon: UserPlus, tone: "success" };
    case "member_removed":
    case "member_deactivated":
      return { icon: UserMinus, tone: "neutral" };
    default:
      return { icon: Bell, tone: "neutral" };
  }
}

export function notifHref(
  type: string,
  data: Record<string, unknown> | null,
  isAdmin: boolean,
  groupConvId: string | null,
): string {
  const d = data ?? {};
  const conv = typeof d.conversation_id === "string" ? d.conversation_id : null;
  switch (type) {
    case "task_assigned":
    case "task_completed":
    case "task_overdue":
    case "task_updated":
      return isAdmin ? "/admin/tasks" : "/tasks";
    case "new_message":
      return conv ? (conv === groupConvId ? "/chat" : `/messages/${conv}`) : "/messages";
    case "announcement":
      return isAdmin ? "/admin/announcements" : "/home";
    case "member_added":
    case "member_removed":
    case "member_deactivated":
      return "/admin/users";
    default:
      return "/notifications";
  }
}

export const notifToneChip: Record<NotifTone, string> = {
  primary: "bg-primary/12 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/12 text-danger",
  info: "bg-info/12 text-info",
  neutral: "bg-muted text-muted-foreground",
};
