import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function AuthErrorPage() {
  return (
    <div className="ambient flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div className="glass max-w-md rounded-2xl border border-border/70 p-8 elevate-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/12 text-danger">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          We couldn&rsquo;t sign you in
        </h1>
        <p className="mt-2 text-muted-foreground">
          The sign-in link expired or was cancelled. Please try again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground elevate raise hover:bg-primary-hover"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
