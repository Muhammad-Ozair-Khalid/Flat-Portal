"use client";

import { createContext, useContext, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A pointer-driven 3D tilt card with real spring physics, a cursor-tracking
 * glare, and layered parallax depth — the richer successor to the flat
 * `Tilt3D`. Wrap content in <TiltCard> and lift individual pieces toward or
 * away from the viewer with <TiltLayer depth>. Everything settles on a spring;
 * reduced-motion renders a plain, static box.
 */

type TiltCtx = {
  /** normalised pointer position across the card, spring-smoothed, -0.5..0.5 */
  px: MotionValue<number>;
  py: MotionValue<number>;
};

const Ctx = createContext<TiltCtx | null>(null);

export function TiltCard({
  children,
  className,
  intensity = 12,
  glare = false,
  scale = 1.02,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  /** peak rotation in degrees at the card's edges */
  intensity?: number;
  glare?: boolean;
  /** hover scale; set to 1 to disable the lift */
  scale?: number;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const pxRaw = useMotionValue(0);
  const pyRaw = useMotionValue(0);
  const actRaw = useMotionValue(0);

  const soft = { stiffness: 210, damping: 22, mass: 0.6 };
  const px = useSpring(pxRaw, soft);
  const py = useSpring(pyRaw, soft);
  const active = useSpring(actRaw, { stiffness: 160, damping: 26 });

  const rotateY = useTransform(px, [-0.5, 0.5], [-intensity, intensity]);
  const rotateX = useTransform(py, [-0.5, 0.5], [intensity, -intensity]);

  const glareX = useTransform(px, [-0.5, 0.5], ["18%", "82%"]);
  const glareY = useTransform(py, [-0.5, 0.5], ["12%", "88%"]);
  const glareOpacity = useTransform(active, [0, 1], [0, 0.55]);
  const glareBg = useMotionTemplate`radial-gradient(60% 60% at ${glareX} ${glareY}, rgba(255,255,255,0.6), transparent 55%)`;

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  function onMove(e: React.PointerEvent) {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    pxRaw.set((e.clientX - r.left) / r.width - 0.5);
    pyRaw.set((e.clientY - r.top) / r.height - 0.5);
    actRaw.set(1);
  }
  function reset() {
    pxRaw.set(0);
    pyRaw.set(0);
    actRaw.set(0);
  }

  return (
    <div
      ref={ref}
      className={cn("[perspective:1100px]", className)}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <motion.div
        className="relative h-full rounded-[inherit] [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
        whileHover={{ scale }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Ctx.Provider value={{ px, py }}>
          {children}
          {glare && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] mix-blend-soft-light"
              style={{ opacity: glareOpacity, background: glareBg, translateZ: 60 }}
            />
          )}
        </Ctx.Provider>
      </motion.div>
    </div>
  );
}

/**
 * A child of <TiltCard> that floats at a given depth. Positive depth pops
 * toward the viewer (and parallaxes with the cursor); negative depth sinks
 * back. Works via translateZ where the 3D chain is intact, plus a pointer-
 * linked shift so the separation reads even inside clipped/flattened parents.
 */
export function TiltLayer({
  children,
  depth = 24,
  className,
  style,
}: {
  children: React.ReactNode;
  depth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ctx = useContext(Ctx);
  const fallback = useMotionValue(0);
  const px = ctx?.px ?? fallback;
  const py = ctx?.py ?? fallback;

  const k = 0.5;
  const x = useTransform(px, [-0.5, 0.5], [-depth * k, depth * k]);
  const y = useTransform(py, [-0.5, 0.5], [-depth * k, depth * k]);

  if (!ctx) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("[transform-style:preserve-3d]", className)}
      style={{ x, y, translateZ: depth, ...style }}
    >
      {children}
    </motion.div>
  );
}
