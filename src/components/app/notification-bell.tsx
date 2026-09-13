"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell({ count }: { count: number }) {
  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
