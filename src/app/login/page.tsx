import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthContext } from "@/lib/auth";
import { landingPathFor, isSafeNext } from "@/lib/auth-routing";
import { Logo } from "@/components/brand/logo";
import { IsometricFlat } from "@/components/brand/isometric-flat";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { user, profile } = await getAuthContext();
  const sp = await searchParams;
  const next = isSafeNext(sp.next) ? sp.next : "/home";

  if (user && profile) {
    redirect(landingPathFor(profile.role, profile.account_status, next));
  }

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="ambient relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <Logo />
        <div className="mx-auto w-full max-w-md">
          <div className="glass rounded-2xl border border-border/70 p-6 elevate-lg">
            <IsometricFlat />
          </div>
          <h1 className="mt-8 font-display text-4xl font-bold leading-tight tracking-tight text-foreground">
            Welcome home.
          </h1>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Sign in to see your chores, catch up on the group chat, and keep the
            flat running smoothly.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Private by design — only your flat admins can see location data.
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col bg-background">
        <div className="ambient pointer-events-none absolute inset-0 -z-10 opacity-40 lg:hidden" />
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <span className="lg:hidden">
            <Logo />
          </span>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Sign in to Flat Portal
            </h2>
            <p className="mt-2 mb-8 text-muted-foreground">
              Use the Google account your flat admin added for you.
            </p>
            <LoginForm next={next} showDev={process.env.NODE_ENV !== "production"} />
          </div>
        </div>
      </div>
    </div>
  );
}
