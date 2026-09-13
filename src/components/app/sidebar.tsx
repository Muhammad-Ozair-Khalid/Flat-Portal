"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { navFor, type NavItem } from "./nav";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  mobileOpen,
  onClose,
}: {
  role: string;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = navFor(role);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-border bg-surface/85 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="truncate">{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">
            {role === "admin" ? "Administrator workspace" : "Flat member"}
          </p>
        </div>
      </aside>
    </>
  );
}
