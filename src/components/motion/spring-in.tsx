"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * Spring-based, staggered entrance for a group of items. Richer than the CSS
 * `Reveal`: children cascade in on a spring with a soft blur-to-focus as the
 * group scrolls into view. Wrap the group in <SpringStagger> and each cell in
 * <StaggerItem>. Reduced-motion renders everything plainly, in place.
 */

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.085, delayChildren: 0.04 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.94, filter: "blur(7px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 190, damping: 22, mass: 0.7 },
  },
};

export function SpringStagger({
  children,
  className,
  amount = 0.2,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** portion of the group that must be visible before it fires */
  amount?: number;
  as?: "div" | "ul";
}) {
  const reduce = useReducedMotion();
  const Comp = as === "ul" ? motion.ul : motion.div;

  if (reduce) {
    return as === "ul" ? (
      <ul className={className}>{children}</ul>
    ) : (
      <div className={className}>{children}</div>
    );
  }

  return (
    <Comp
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const Comp = as === "li" ? motion.li : motion.div;

  if (reduce) {
    return as === "li" ? (
      <li className={className}>{children}</li>
    ) : (
      <div className={className}>{children}</div>
    );
  }

  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}
