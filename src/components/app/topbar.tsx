"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { navFor } from "./nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import type { ShellProfile } from "./types";

export function Topbar({
  profile,
  unreadCount,
  onMenu,
}: {
  profile: ShellProfile;
  unreadCount: number;
  onMenu: () => void;
}) {
  const pathname = usePathname();
  const items = navFor(profile.role);
  const current = items.find((i) =>
    i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + "/"),
  );

  return (
    <header className="glass sticky top-0 z-30 border-b border-border/70">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="font-display text-base font-semibold text-foreground">
          {current?.label ?? "Flat Portal"}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <NotificationBell count={unreadCount} />
          <ThemeToggle />
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
