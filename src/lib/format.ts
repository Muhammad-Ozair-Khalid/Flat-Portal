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

/** Format a rupee amount, e.g. 1250 → "Rs 1,250", -42.5 → "−Rs 42.50". */
export function fmtMoney(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const abs = Math.abs(rounded);
  const str = abs.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${rounded < 0 ? "−" : ""}Rs ${str}`;
}
