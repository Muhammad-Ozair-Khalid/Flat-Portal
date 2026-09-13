"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/lib/actions/auth";
import type { ShellProfile } from "./types";

export function UserMenu({ profile }: { profile: ShellProfile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-muted"
      >
        <Avatar name={profile.full_name} email={profile.email} src={profile.avatar_url} size={28} />
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-2 elevate-lg"
        >
          <div className="flex items-center gap-3 p-2">
            <Avatar name={profile.full_name} email={profile.email} src={profile.avatar_url} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {profile.full_name ?? profile.email}
              </p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <div className="px-2 pb-2">
            <Badge tone={profile.role === "admin" ? "primary" : "neutral"}>
              {profile.role === "admin" ? "Administrator" : "Flat member"}
            </Badge>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            role="menuitem"
          >
            <UserIcon className="h-4 w-4" /> My profile
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
