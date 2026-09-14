import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { rimStyle } from "@/lib/flat";

type DoorCardProps = {
  href: string;
  label: string;
  blurb: string;
  icon: LucideIcon;
  /** css var name (without --) for the room's neon hue, e.g. "room-2" */
  hue?: string;
};

/**
 * A miniature 3D door. It sits closed until hovered or keyboard-focused, then
 * swings open on its hinge (pure CSS, group-driven) to reveal the neon room
 * behind it. Activating the link walks you through into that page. `hue` tints
 * the whole door and its glow.
 */
export function DoorCard({ href, label, blurb, icon: Icon, hue = "room-1" }: DoorCardProps) {
  return (
    <Link
      href={href}
      style={rimStyle(hue)}
      className="group scene-3d relative block h-72 rounded-2xl outline-none"
      aria-label={`Open ${label}`}
    >
      <div className="flat-3d relative h-full w-full">
        {/* Room revealed behind the door */}
        <div className="interior-glow absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_40%,transparent,rgba(6,4,24,0.6))]" />
          <div className="relative flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/30 text-white ring-1 ring-white/25 backdrop-blur">
              <Icon className="h-7 w-7" />
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
              Step in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* The door itself, hinged on the left */}
        <div className="absolute inset-0 [perspective:1200px]">
          <div className="door-slab flat-3d backface-hidden absolute inset-0 origin-left rounded-2xl p-4 transition-transform duration-[600ms] ease-[cubic-bezier(0.34,1,0.42,1)] group-hover:[transform:rotateY(-72deg)] group-focus-visible:[transform:rotateY(-72deg)]">
            <div className="flex h-full flex-col">
              <div className="nameplate mb-3 flex h-8 items-center justify-center rounded-md px-3">
                <span className="font-display text-sm font-bold tracking-wide text-[#eae8ff]">{label}</span>
              </div>
              <div className="door-panel grow" />
              <p className="mt-3 text-xs leading-snug text-[#c9c2ff]/85">{blurb}</p>
              <div className="brass absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
