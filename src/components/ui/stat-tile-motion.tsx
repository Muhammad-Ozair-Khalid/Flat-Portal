"use client";

import Link from "next/link";
import { TiltCard } from "@/components/motion/tilt-card";

/**
 * Client shell for <StatTile>: gives the (server-rendered) tile body a gentle
 * spring tilt, a hover lift and a cursor glare via <TiltCard>, and links
 * through when `href` is set. Reduced-motion falls back to a static card.
 */
export function StatTileMotion({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  const card = (
    <TiltCard glare intensity={7} scale={1.035} className="h-full rounded-2xl">
      <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card p-5 elevate">
        {children}
      </div>
    </TiltCard>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full outline-none">
        {card}
      </Link>
    );
  }
  return <div className="h-full">{card}</div>;
}
