import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BedDouble, Tv, UtensilsCrossed, DoorOpen, ArrowRight } from "lucide-react";
import { ROOMS, MEMBER_COUNT, membersByRoom, rimStyle, type RoomKind } from "@/lib/flat";
import { TiltCard, TiltLayer } from "@/components/motion/tilt-card";
import { SpringStagger, StaggerItem } from "@/components/motion/spring-in";

const KIND_ICON: Record<RoomKind, LucideIcon> = {
  bedroom: BedDouble,
  lounge: Tv,
  kitchen: UtensilsCrossed,
};

/**
 * A compact, neon teaser of Flat 408 for the dashboards — six mini room tiles
 * that link through to the full interactive 3D floor. `href` points at the
 * member (`/rooms`) or admin (`/admin/rooms`) floor.
 */
export function FlatGlance({ href }: { href: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 elevate">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <DoorOpen className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Your flat at a glance</h2>
            <p className="text-xs text-muted-foreground">4 bedrooms · TV lounge · kitchen · {MEMBER_COUNT} members</p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Open <span className="hidden sm:inline">Flat 408</span> <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <SpringStagger className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ROOMS.map((room) => {
          const Icon = KIND_ICON[room.kind];
          const beds = room.kind === "bedroom" ? membersByRoom(room.id).length : 0;
          return (
            <StaggerItem key={room.id} className="h-full">
              <Link
                href={href}
                style={rimStyle(room.hue)}
                className="block h-full outline-none"
              >
                <TiltCard intensity={9} scale={1.05} className="h-full rounded-2xl">
                  <div className="glass-panel neon-edge group flex h-full flex-col gap-1.5 rounded-2xl p-3 [transform-style:preserve-3d]">
                    <TiltLayer depth={18}>
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#eae8ff]"
                        style={{ backgroundColor: "color-mix(in oklab, var(--rim) 30%, transparent)" }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    </TiltLayer>
                    <span className="mt-1 text-sm font-semibold text-[#eae8ff]">{room.label}</span>
                    <span className="text-[11px] text-[#b9b3e8]">
                      {room.kind === "bedroom"
                        ? `${beds} bed${beds > 1 ? "s" : ""} · washroom`
                        : room.kind === "kitchen"
                          ? "Fridge · shared"
                          : "Shared"}
                    </span>
                  </div>
                </TiltCard>
              </Link>
            </StaggerItem>
          );
        })}
      </SpringStagger>
    </div>
  );
}
