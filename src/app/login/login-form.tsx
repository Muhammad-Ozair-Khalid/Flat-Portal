"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { devSignIn } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z" />
    </svg>
  );
}

export function LoginForm({ next, showDev }: { next: string; showDev: boolean }) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [devState, devAction, devPending] = useActionState(devSignIn, null);

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setGoogleLoading(false);
      toast.error(error.message);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5 text-base font-semibold text-foreground elevate raise disabled:cursor-not-allowed disabled:opacity-70"
      >
        {googleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <GoogleIcon className="h-5 w-5" />
        )}
        Continue with Google
      </button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Only Google accounts your flat admin has added can sign in.
      </p>

      {showDev && (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-surface/60 p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Local development sign-in (disabled in production)
          </p>
          <form action={devAction} className="space-y-2.5">
            <input
              name="email"
              type="email"
              autoComplete="username"
              defaultValue="admin.one@gmail.com"
              placeholder="email"
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            />
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue="password123"
              placeholder="password"
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            />
            <button
              type="submit"
              disabled={devPending}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-opacity",
                devPending && "opacity-70",
              )}
            >
              {devPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in (dev)
            </button>
          </form>
          {devState?.error && (
            <p className="mt-2 text-sm text-danger">{devState.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
