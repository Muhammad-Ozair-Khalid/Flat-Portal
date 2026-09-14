"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Wraps a CTA so it leans toward the cursor while hovered and springs back on
 * leave, with a subtle press on tap. Purely presentational — the child (a Link
 * or button) still handles the click. Reduced-motion renders a static wrapper.
 */
export function Magnetic({
  children,
  className,
  strength = 0.4,
}: {
  children: React.ReactNode;
  className?: string;
  /** how far the element follows the cursor, 0..1 of the offset */
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 260, damping: 18, mass: 0.5 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  if (reduce) {
    return <div className={cn("inline-block", className)}>{children}</div>;
  }

  function onMove(e: React.PointerEvent) {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
