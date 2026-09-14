"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, KeyRound } from "lucide-react";

/**
 * The front door of Flat 408. As the wrapper scrolls past, the glass-and-metal
 * door swings open on its hinge (rotateY), the whole scene dollies forward
 * (translateZ + scale) so the camera walks through the doorway, and the neon
 * interior glows up as you arrive inside — then a short "you're home" beat holds
 * before the hero releases into the flat. All transforms are written straight
 * to the DOM from one eased rAF loop.
 */
export function DoorHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const doorRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const arriveRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      if (doorRef.current) doorRef.current.style.transform = "rotateY(-110deg)";
      if (glowRef.current) glowRef.current.style.opacity = "1";
      if (bgGlowRef.current) bgGlowRef.current.style.opacity = "0.7";
      if (copyRef.current) copyRef.current.style.opacity = "0";
      if (arriveRef.current) arriveRef.current.style.opacity = "1";
      if (hintRef.current) hintRef.current.style.opacity = "0";
      return;
    }

    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
    const smooth = (t: number) => t * t * (3 - 2 * t);
    let target = 0;
    let cur = 0;
    let raf = 0;

    const measure = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const total = wrap.offsetHeight - window.innerHeight;
      const scrolled = -wrap.getBoundingClientRect().top;
      target = total > 0 ? clamp(scrolled / total, 0, 1) : 0;
    };

    const apply = (p: number) => {
      const open = smooth(clamp(p / 0.45, 0, 1)); // door fully open by 45%
      const dolly = smooth(clamp((p - 0.35) / 0.4, 0, 1)); // through the doorway by 75%
      const arrive = smooth(clamp((p - 0.6) / 0.2, 0, 1)); // "home" copy in
      const outro = smooth(clamp((p - 0.94) / 0.06, 0, 1)); // release fade

      if (doorRef.current) doorRef.current.style.transform = `rotateY(${-open * 118}deg)`;
      if (worldRef.current)
        worldRef.current.style.transform = `translateZ(${dolly * 820}px) scale(${1 + dolly * 2}) `;
      if (glowRef.current) glowRef.current.style.opacity = String(0.28 + open * 0.72);
      if (bgGlowRef.current) bgGlowRef.current.style.opacity = String(0.12 + dolly * 0.74);
      if (copyRef.current) {
        const o = 1 - smooth(clamp(p / 0.3, 0, 1));
        copyRef.current.style.opacity = String(o);
        copyRef.current.style.transform = `translateY(${(1 - o) * -30}px)`;
      }
      if (arriveRef.current) {
        arriveRef.current.style.opacity = String(arrive * (1 - outro));
        arriveRef.current.style.transform = `translateY(${(1 - arrive) * 24}px) scale(${0.96 + arrive * 0.04})`;
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp(p / 0.12, 0, 1));
    };

    const loop = () => {
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      apply(cur);
      raf = requestAnimationFrame(loop);
    };

    measure();
    cur = target;
    apply(cur);
    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section ref={wrapRef} className={reduced ? "relative" : "relative h-[280vh]"}>
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden bg-[#0b0722]">
        {/* full-screen warm interior wash — ramps up as the camera enters */}
        <div ref={bgGlowRef} className="interior-glow pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_125%,transparent,rgba(0,0,0,0.7))]" aria-hidden="true" />

        {/* 3D stage */}
        <div className="scene-3d absolute inset-0 flex items-center justify-center">
          <div ref={worldRef} className="flat-3d relative" style={{ willChange: "transform" }}>
            {/* Doorway casing — tall and squared like a real door */}
            <div className="door-casing relative rounded-[10px] p-3 sm:p-3.5">
              <div className="relative h-[460px] w-[228px] overflow-hidden rounded-[6px] bg-[#08051f] sm:h-[588px] sm:w-[300px]">
                <div ref={glowRef} className="interior-glow absolute inset-0 opacity-30" aria-hidden="true" />
                <div className="absolute inset-x-6 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(8,5,31,0.72),transparent)]" aria-hidden="true" />

                {/* door slab, hinged on the left */}
                <div className="flat-3d absolute inset-0" style={{ perspective: "1400px" }}>
                  <div
                    ref={doorRef}
                    className="door-slab backface-hidden absolute inset-0 origin-left rounded-[5px] p-4 sm:p-5"
                    style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                  >
                    <div className="nameplate mx-auto mb-4 flex h-8 w-16 items-center justify-center rounded-[4px] sm:h-9 sm:w-20">
                      <span className="font-display text-sm font-extrabold tracking-wide text-[#eae8ff] [text-shadow:0_0_10px_var(--rim,#7c6bff)] sm:text-base">408</span>
                    </div>
                    <div className="brass mx-auto mb-4 h-2.5 w-2.5 rounded-full" aria-hidden="true" />
                    <div className="grid h-[calc(100%-5rem)] grid-rows-2 gap-4 sm:gap-5">
                      <div className="door-panel" />
                      <div className="door-panel" />
                    </div>
                    <div className="brass absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full sm:right-3.5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-3 h-3.5 w-[200px] rounded-[5px] bg-[linear-gradient(160deg,#2b2560,#0d0a2c)] opacity-90 shadow-[0_18px_28px_-14px_rgba(0,0,0,0.9)] sm:w-[270px]" aria-hidden="true" />
          </div>
        </div>

        {/* intro copy */}
        <div ref={copyRef} className="relative z-10 mx-auto max-w-2xl px-6 text-center" style={{ willChange: "transform, opacity" }}>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[460px] w-[720px] max-w-[94vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(6,4,24,0.9),rgba(6,4,24,0.5)_58%,transparent)]" aria-hidden="true" />
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8b7bff]/40 bg-white/5 px-3.5 py-1.5 text-sm text-[#c9c2ff] backdrop-blur">
            <KeyRound className="h-4 w-4" />
            Flat 408
          </span>
          <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-[#eae8ff] drop-shadow-[0_2px_24px_rgba(109,94,252,0.45)] sm:text-7xl">
            Come on in.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-[#b9b3e8]">
            Everything your shared home runs on — chores, chat, reminders, who&rsquo;s in — waiting
            just inside the door.
          </p>
          <div ref={hintRef} className="mt-10 flex flex-col items-center gap-2 text-[#b9b3e8]">
            <ArrowDown className="h-5 w-5 animate-bounce" />
            <span className="text-xs uppercase tracking-[0.25em]">Scroll to open the door</span>
          </div>
        </div>

        {/* arrival copy — fades in once you're through */}
        <div ref={arriveRef} className="pointer-events-none relative z-10 mx-auto max-w-2xl px-6 text-center opacity-0" style={{ willChange: "transform, opacity", position: "absolute" }}>
          <h2 className="font-display text-5xl font-extrabold tracking-tight text-[#eae8ff] drop-shadow-[0_2px_28px_rgba(46,230,255,0.4)] sm:text-7xl">
            Welcome home.
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-lg text-[#c9c2ff]">Keep scrolling — the flat&rsquo;s this way.</p>
        </div>
      </div>
    </section>
  );
}
