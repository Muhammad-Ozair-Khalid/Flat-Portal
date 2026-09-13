"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { ShellProfile } from "./types";

export function AppShell({
  profile,
  unreadCount,
  children,
}: {
  profile: ShellProfile;
  unreadCount: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      <div className="ambient pointer-events-none fixed inset-0 -z-10 opacity-40" aria-hidden="true" />
      <Sidebar role={profile.role} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-[17rem]">
        <Topbar profile={profile} unreadCount={unreadCount} onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
