import type { LucideIcon } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function StatusScreen({
  icon: Icon,
  tone = "primary",
  title,
  message,
}: {
  icon: LucideIcon;
  tone?: "primary" | "warning" | "danger";
  title: string;
  message: string;
}) {
  const toneClass = {
    primary: "bg-primary/12 text-primary",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/12 text-danger",
  }[tone];

  return (
    <div className="ambient flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div className="glass max-w-md rounded-2xl border border-border/70 p-8 elevate-lg">
        <div className={cn("mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full", toneClass)}>
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-muted"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
