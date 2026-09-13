import { format, formatDistanceToNow, isPast } from "date-fns";

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return format(new Date(d), "d MMM yyyy");
}

export function fmtDateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return format(new Date(d), "d MMM yyyy, HH:mm");
}

export function fmtTime(d: string | Date | null | undefined): string {
  if (!d) return "";
  return format(new Date(d), "HH:mm");
}

export function fromNow(d: string | Date | null | undefined): string {
  if (!d) return "";
  return formatDistanceToNow(new Date(d), { addSuffix: true });
}

export function isOverdue(deadline: string | Date | null | undefined): boolean {
  if (!deadline) return false;
  return isPast(new Date(deadline));
}
