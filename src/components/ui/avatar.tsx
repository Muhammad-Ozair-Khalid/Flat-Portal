"use client";

import { useState } from "react";
import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  email,
  src,
  size = 40,
  className,
}: {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const label = name || email || "?";
  const dim = { width: size, height: size };

  if (src && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setErrored(true)}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={dim}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary",
        className,
      )}
      style={{ ...dim, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {initials(label)}
    </span>
  );
}
