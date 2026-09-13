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
        className={cn("fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden", mobileOpen ? "block" : "hidden")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-border bg-surface/90 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
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
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/12 text-primary elevate-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3">
          <div className="rounded-xl border border-border/70 bg-card/70 p-3">
            <p className="text-xs font-semibold text-foreground">
              {role === "admin" ? "Administrator" : "Flat member"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {role === "admin" ? "Full access to the flat" : "Your shared home, in sync"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
