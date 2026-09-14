import Link from "next/link";
import {
  ArrowRight,
  Home as HomeIcon,
  ListChecks,
  MessagesSquare,
  Wallet,
  DoorOpen,
  MapPin,
  BedDouble,
  Tv,
  UtensilsCrossed,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SiteHeader } from "@/components/experience/site-header";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { TiltCard } from "@/components/motion/tilt-card";
import { SpringStagger, StaggerItem } from "@/components/motion/spring-in";
import { Magnetic } from "@/components/motion/magnetic";
import { DoorHero } from "@/components/experience/door-hero";
import { DoorCard } from "@/components/experience/door-card";
import { RoomScene } from "@/components/experience/room-scene";
import { FLAT } from "@/lib/flat";

const tour = [
  {
    variant: "bedroom" as const,
    accent: "var(--room-1)",
    icon: BedDouble,
    kicker: "Four rooms, nine of you",
    title: "Everyone's got a room — and a roommate.",
    body: "Four bedrooms, each with its own attached washroom: two of you in three of them, three in the fourth. See who's where at a glance, and whose turn it is for what.",
  },
  {
    variant: "lounge" as const,
    accent: "var(--room-lounge)",
    icon: Tv,
    kicker: "The TV lounge",
    title: "Where the whole flat comes together.",
    body: "A flat-wide chat and pinned announcements keep all nine of you on the same page — plans, deliveries, the good gossip — updating live so nobody's left out.",
  },
  {
    variant: "kitchen" as const,
    accent: "var(--room-kitchen)",
    icon: UtensilsCrossed,
    kicker: "The kitchen",
    title: "One fridge, one ledger, zero mystery bills.",
    body: "Split groceries and bills in the shared ledger, assign the bins and the dishes, and settle up without the awkward group-chat maths.",
  },
];

const doors = [
  { href: "/login?next=/home", label: "Home", blurb: "Your day at a glance", icon: HomeIcon, hue: "room-1" },
  { href: "/login?next=/rooms", label: "Flat 408", blurb: "Step through every room", icon: DoorOpen, hue: "room-3" },
  { href: "/login?next=/tasks", label: "Tasks", blurb: "Chores, deadlines, done", icon: ListChecks, hue: "room-4" },
  { href: "/login?next=/chat", label: "Group chat", blurb: "The whole flat, talking", icon: MessagesSquare, hue: "room-2" },
  { href: "/login?next=/ledger", label: "Ledger", blurb: "Who paid, who owes", icon: Wallet, hue: "room-lounge" },
  { href: "/login?next=/location", label: "Location", blurb: "Admin-only, private", icon: MapPin, hue: "room-kitchen" },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* 1 — The front door of Flat 408 opens as you scroll */}
        <DoorHero />

        {/* Transition from the dark hallway into the app */}
        <div className="h-24 bg-[linear-gradient(to_bottom,#0b0722,var(--background))]" aria-hidden="true" />

        {/* 2 — Big room scenes: a walk through the flat */}
        <section id="rooms" className="mx-auto w-full max-w-6xl px-6 pb-8 pt-4">
          <Reveal variant="up">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-sm text-muted-foreground elevate-sm">
              A quick tour of {FLAT.name}
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Room by room, everything a shared home needs.
            </h2>
          </Reveal>

          <div className="mt-14 space-y-24 sm:space-y-32">
            {tour.map((room, i) => {
              const flip = i % 2 === 1;
              return (
                <div key={room.variant} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <Reveal variant={flip ? "right" : "left"} className={flip ? "lg:order-2" : ""}>
                    <Parallax speed={0.08}>
                      <TiltCard glare intensity={9} scale={1.02} className="overflow-hidden rounded-3xl border border-primary/20 elevate-lg">
                        <RoomScene variant={room.variant} accent={room.accent} className="block aspect-[16/10] w-full" />
                      </TiltCard>
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
            <SpringStagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doors.map((d) => (
                <StaggerItem key={d.href} className="h-full">
                  <DoorCard href={d.href} label={d.label} blurb={d.blurb} icon={d.icon} hue={d.hue} />
                </StaggerItem>
              ))}
            </SpringStagger>
          </div>
        </section>

        {/* 4 — CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <Reveal variant="zoom">
            <div className="ambient shine isolate relative overflow-hidden rounded-3xl border border-primary/20 bg-card/80 px-8 py-16 text-center elevate-lg">
              <div className="aurora-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                The door&rsquo;s open. Come in.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
                Sign in with the Google account your flat admin added, and pick up right where the
                sticky notes left off.
              </p>
              <Magnetic className="mt-9" strength={0.5}>
                <Link
                  href="/login"
                  className="press inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground elevate hover:bg-primary-hover"
                >
                  Continue with Google <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo showWordmark markClassName="h-7 w-7" className="[&_span]:text-base" />
          <p>{FLAT.name} · Home, in sync.</p>
        </div>
      </footer>
    </div>
  );
}
