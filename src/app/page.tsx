import Link from "next/link";
import { ArrowRight, Bell, ListChecks, MapPin, MessagesSquare, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { IsometricFlat } from "@/components/brand/isometric-flat";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: ListChecks,
    title: "Chores that don't slip",
    body: "Admins assign tasks with deadlines and priorities. Members mark them done. Everyone sees where things stand.",
    tint: "var(--primary)",
  },
  {
    icon: MessagesSquare,
    title: "One place to talk",
    body: "A flat-wide group chat plus private conversations, updating live as messages arrive.",
    tint: "var(--info)",
  },
  {
    icon: Bell,
    title: "Told the moment it matters",
    body: "Real-time alerts for new tasks, completions, and deadlines you've missed — not a day later.",
    tint: "var(--accent)",
  },
  {
    icon: MapPin,
    title: "Location, kept private",
    body: "Share your location if you choose. Only flat admins can see it — never other members.",
    tint: "var(--success)",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div className="ambient pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-20">
        <div className="glass border-b border-border/70">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Logo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/login"
                className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-12 pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:pt-20">
          <div style={{ animation: "flat-rise 0.6s ease both" }}>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-sm text-muted-foreground elevate-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Private by design — admins oversee, members stay in control
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
              Keep the flat
              <br />
              <span className="text-gradient">running, together.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Flat Portal gathers the chores, the chat, the reminders and the
              who&rsquo;s-home into a single home for your shared home — so the
              sticky notes on the fridge can finally come down.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground elevate raise hover:bg-primary-hover"
              >
                Continue with Google
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card/60 px-5 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                How it works
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              New members join once an admin adds them to the flat.
            </p>
          </div>

          {/* The one bold element: an isometric 3D floor plan */}
          <div className="relative" style={{ animation: "flat-rise 0.7s ease 0.1s both" }}>
            <div className="glass rounded-2xl border border-border/70 p-5 elevate-lg">
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="font-display text-sm font-semibold text-foreground">
                  Flat 3B — Elm Court
                </span>
                <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-medium text-primary">
                  3 home now
                </span>
              </div>
              <IsometricFlat className="mx-auto max-w-[440px]" />
              <div className="mt-1 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" /> 6 spaces
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent" /> 4 flatmates
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="how" className="relative border-t border-border/70 bg-surface/60">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-foreground">
              Built for the four things flatmates actually argue about.
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="raise flex gap-4 rounded-xl border border-border/70 bg-card/70 p-5 elevate"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white elevate-sm"
                    style={{ background: `linear-gradient(140deg, ${f.tint}, color-mix(in oklab, ${f.tint} 62%, #000))` }}
                  >
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo showWordmark markClassName="h-7 w-7" className="[&_span]:text-base" />
          <p>Sign in with the Google account your flat admin added.</p>
        </div>
      </footer>
    </div>
  );
}
