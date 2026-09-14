"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Landing header. Transparent (light text) while it floats over the dark door
 * hero; frosts into the usual glass bar once you scroll down into the flat.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div
        className={`transition-colors duration-500 ${
          scrolled ? "glass border-b border-border/60" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <Logo className={scrolled ? "" : "[&_span]:text-[#eae8ff]"} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className={`press rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                scrolled
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : "bg-[#6d5efc] text-white shadow-[0_0_20px_-4px_rgba(109,94,252,0.7)] hover:bg-[#8b7bff]"
              }`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
