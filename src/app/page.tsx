import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ListChecks,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  Megaphone,
  ScrollText,
  UserPlus,
  LogIn,
  Home,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { IsometricFlat } from "@/components/brand/isometric-flat";
import { ApartmentBuilding } from "@/components/brand/apartment-building";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tilt3D } from "@/components/ui/tilt";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { CountUp } from "@/components/motion/count-up";

const features = [
  { icon: ListChecks, title: "Chores that don't slip", body: "Assign tasks with deadlines and priorities. Members mark them done — everyone sees where things stand.", tint: "var(--primary)" },
  { icon: MessagesSquare, title: "One place to talk", body: "A flat-wide group chat plus private conversations, updating live as messages arrive.", tint: "var(--info)" },
  { icon: Bell, title: "Told the moment it matters", body: "Realtime alerts for new tasks, completions and deadlines you've missed — not a day later.", tint: "var(--accent)" },
  { icon: MapPin, title: "Location, kept private", body: "Share your location if you choose. Only flat admins can see it — never other members.", tint: "var(--success)" },
];

const capabilities = [
  { icon: ListChecks, label: "Assign & track chores" },
  { icon: MessagesSquare, label: "Group + private chat" },
  { icon: Bell, label: "Realtime notifications" },
  { icon: MapPin, label: "Admin-only live location" },
  { icon: Megaphone, label: "Flat announcements" },
  { icon: ScrollText, label: "Full audit trail" },
];

const steps = [
  { icon: UserPlus, title: "An admin adds you", body: "Your flat admin drops your Gmail into the members list." },
  { icon: LogIn, title: "Sign in with Google", body: "One tap. No new password to remember." },
  { icon: Home, title: "Run the flat together", body: "Chores, chat, reminders and more — all in sync." },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-background">
      <div className="ambient pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px] opacity-80" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="glass border-b border-border/60">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Logo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login" className="press rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-24 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:pt-20">
          <Reveal variant="left">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-sm text-muted-foreground elevate-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Private by design — admins oversee, members stay in control
            </p>
            <h1 className="font-display text-5xl font-extrabold leading-[1.01] tracking-tight text-foreground sm:text-6xl">
              Your whole flat,
              <br />
              <span className="text-gradient gradient-move">under one roof.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Flat Portal gathers the chores, the chat, the reminders and the who&rsquo;s-home
              into one warm little home for your shared home — so the sticky notes on the fridge
              can finally come down.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/login" className="group press inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground elevate raise hover:bg-primary-hover">
                Continue with Google
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="#features" className="press inline-flex items-center justify-center rounded-full border border-border bg-card/70 px-5 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted">
                Take a look
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">New members join once an admin adds them to the flat.</p>
          </Reveal>

          {/* Layered 3D hero art */}
          <div className="relative mx-auto min-h-[420px] w-full max-w-[460px] lg:min-h-[540px]">
            <Parallax speed={0.06}>
              <ApartmentBuilding className="mx-auto max-w-[380px] drop-shadow-xl" />
            </Parallax>
            <Parallax speed={0.24} className="absolute -bottom-2 left-0 w-[70%] max-w-[300px] md:-left-6">
              <Tilt3D className="glass rounded-2xl border border-border/70 p-3 elevate-lg">
                <IsometricFlat />
                <p className="pb-1 text-center text-[11px] font-medium text-muted-foreground">Flat 3B — live floor plan</p>
              </Tilt3D>
            </Parallax>
            <Parallax speed={0.34} className="absolute right-0 top-6 hidden sm:block">
              <div className="glass flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-sm elevate">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium text-foreground">Bins due tonight</span>
              </div>
            </Parallax>
          </div>
        </section>

        {/* Stats band */}
        <section className="border-y border-border/60 bg-surface/60">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
            {[
              { n: 6, suffix: "", label: "rooms mapped" },
              { n: 4, suffix: "", label: "flatmates in sync" },
              { n: 0, suffix: "", label: "sticky notes" },
              { n: 24, suffix: "/7", label: "realtime updates" },
            ].map((s, i) => (
              <Reveal key={s.label} variant="up" delay={i * 80} className="text-center">
                <div className="font-display text-4xl font-extrabold tracking-tight text-foreground">
                  <CountUp value={s.n} />
                  {s.suffix}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl px-6 py-20">
          <Reveal variant="up">
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              <Sparkles className="h-4 w-4" /> Everything a shared home needs
            </p>
            <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for the four things flatmates actually argue about.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.title} variant="up" delay={i * 90}>
                <Tilt3D className="raise flex h-full gap-4 rounded-2xl border border-border/70 bg-card/80 p-6 elevate">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white elevate-sm" style={{ background: `linear-gradient(140deg, ${f.tint}, color-mix(in oklab, ${f.tint} 58%, #000))` }}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Showcase */}
        <section className="border-y border-border/60 bg-surface/60">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
            <Reveal variant="left">
              <Tilt3D className="glass rounded-3xl border border-border/70 p-6 elevate-lg">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="font-display text-sm font-semibold text-foreground">Flat 3B — Elm Court</span>
                  <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-medium text-primary">3 home now</span>
                </div>
                <IsometricFlat className="mx-auto max-w-[440px]" />
              </Tilt3D>
            </Reveal>
            <Reveal variant="right">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                One tidy home for the whole household.
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                No more scattered group chats and forgotten chores. Everything your flat needs,
                in one calm place — with the right privacy for members and the right oversight for admins.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {capabilities.map((c) => (
                  <div key={c.label} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                      <c.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{c.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <Reveal variant="up">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Up and running in three steps.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} variant="up" delay={i * 110}>
                <div className="raise relative h-full rounded-2xl border border-border/70 bg-card/80 p-6 elevate">
                  <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-primary/10">{i + 1}</span>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <Reveal variant="zoom">
            <div className="ambient shine relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 px-8 py-14 text-center elevate-lg">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Bring your flat together.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Sign in with the Google account your flat admin added and pick up where the sticky notes left off.
              </p>
              <Link href="/login" className="press mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground elevate raise hover:bg-primary-hover">
                Continue with Google <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo showWordmark markClassName="h-7 w-7" className="[&_span]:text-base" />
          <p>Sign in with the Google account your flat admin added.</p>
        </div>
      </footer>
    </div>
  );
}
