import Link from "next/link";
import {
  ArrowRight,
  Home as HomeIcon,
  ListChecks,
  MessagesSquare,
  Mail,
  Bell,
  MapPin,
  MessageCircleHeart,
  UtensilsCrossed,
  MoonStar,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SiteHeader } from "@/components/experience/site-header";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { Tilt3D } from "@/components/ui/tilt";
import { DoorHero } from "@/components/experience/door-hero";
import { DoorCard } from "@/components/experience/door-card";
import { RoomScene } from "@/components/experience/room-scene";

const rooms = [
  {
    variant: "living" as const,
    icon: MessageCircleHeart,
    kicker: "The living room",
    title: "Where the flat comes together.",
    body: "A flat-wide chat and pinned announcements keep everyone on the same page — plans, deliveries, the good gossip. It all updates live, so nobody's left out of the loop.",
  },
  {
    variant: "kitchen" as const,
    icon: UtensilsCrossed,
    kicker: "The kitchen",
    title: "Whose turn for the bins?",
    body: "Assign chores with deadlines and priorities, tick them off, and watch the sticky-note chaos disappear. Everyone can see exactly what's done and what's still waiting.",
  },
  {
    variant: "bedroom" as const,
    icon: MoonStar,
    kicker: "The bedrooms",
    title: "Home safe, and only who's home knows.",
    body: "Share your location if you choose — only flat admins can ever see it, never other members. Get a nudge the moment something needs you, day or night.",
  },
];

const doors = [
  { href: "/login?next=/home", label: "Home", blurb: "Your day at a glance", icon: HomeIcon },
  { href: "/login?next=/tasks", label: "Tasks", blurb: "Chores, deadlines, done", icon: ListChecks },
  { href: "/login?next=/chat", label: "Group chat", blurb: "The whole flat, talking", icon: MessagesSquare },
  { href: "/login?next=/messages", label: "Messages", blurb: "Quiet one-to-one word", icon: Mail },
  { href: "/login?next=/notifications", label: "Alerts", blurb: "The moment it matters", icon: Bell },
  { href: "/login?next=/location", label: "Location", blurb: "Admin-only, private", icon: MapPin },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* 1 — The front door opens as you scroll */}
        <DoorHero />

        {/* Transition from interior dark into the daylight of the app */}
        <div className="h-24 bg-[linear-gradient(to_bottom,#20140a,var(--background))]" aria-hidden="true" />

        {/* 2 — Big room scenes: a walk through the flat */}
        <section id="rooms" className="mx-auto w-full max-w-6xl px-6 pb-8 pt-4">
          <Reveal variant="up">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-sm text-muted-foreground elevate-sm">
              A quick tour of Flat 3B
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Room by room, everything a shared home needs.
            </h2>
          </Reveal>

          <div className="mt-14 space-y-24 sm:space-y-32">
            {rooms.map((room, i) => {
              const flip = i % 2 === 1;
              return (
                <div key={room.variant} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <Reveal variant={flip ? "right" : "left"} className={flip ? "lg:order-2" : ""}>
                    <Parallax speed={0.08}>
                      <Tilt3D max={5} className="overflow-hidden rounded-3xl border border-[#e6c88f]/25 elevate-lg">
                        <RoomScene variant={room.variant} className="block aspect-[16/10] w-full" />
                      </Tilt3D>
                    </Parallax>
                  </Reveal>

                  <Reveal variant={flip ? "left" : "right"} className={flip ? "lg:order-1" : ""}>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                      <room.icon className="h-4 w-4" /> {room.kicker}
                    </span>
                    <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      {room.title}
                    </h3>
                    <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">{room.body}</p>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3 — Every room has a door: open one into the app */}
        <section className="border-y border-border/60 bg-surface/60">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <Reveal variant="up">
              <h2 className="max-w-2xl font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Every room has a door.
              </h2>
              <p className="mt-3 max-w-md text-lg text-muted-foreground">
                Hover to open one — then step through into that corner of your flat.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doors.map((d, i) => (
                <Reveal key={d.href} variant="up" delay={i * 70}>
                  <DoorCard href={d.href} label={d.label} blurb={d.blurb} icon={d.icon} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4 — CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <Reveal variant="zoom">
            <div className="ambient shine relative overflow-hidden rounded-3xl border border-[#e6c88f]/25 bg-card/80 px-8 py-16 text-center elevate-lg">
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                The door&rsquo;s open. Come in.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
                Sign in with the Google account your flat admin added, and pick up right where the
                sticky notes left off.
              </p>
              <Link
                href="/login"
                className="press mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground elevate raise hover:bg-primary-hover"
              >
                Continue with Google <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo showWordmark markClassName="h-7 w-7" className="[&_span]:text-base" />
          <p>Flat 3B, Elm Court · Home, in sync.</p>
        </div>
      </footer>
    </div>
  );
}
