import { cn } from "@/lib/utils";

/* An illustrated apartment building at neon dusk — Aurora Indigo night sky,
   amber-lit windows, balconies with plants, an awning and a tree. Pure SVG,
   on-brand, always renders. */

const LIT = [
  [1, 0, 1, 1],
  [0, 1, 1, 0],
  [1, 1, 0, 1],
];

export function ApartmentBuilding({ className }: { className?: string }) {
  const startX = 122;
  const startY = 132;
  const winW = 40;
  const winH = 46;
  const stepX = 58;
  const stepY = 70;

  return (
    <svg viewBox="0 0 460 500" className={cn("h-auto w-full", className)} role="img" aria-label="Illustration of an apartment building at neon dusk">
      <defs>
        <radialGradient id="sky" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#6d5efc" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2360" />
          <stop offset="100%" stopColor="#171338" />
        </linearGradient>
        <linearGradient id="win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>

      {/* dusk glow */}
      <circle cx="230" cy="150" r="230" fill="url(#sky)" />
      {/* moon */}
      <circle cx="370" cy="80" r="26" fill="#eae8ff" opacity="0.9" />
      <circle cx="380" cy="74" r="26" fill="url(#sky)" opacity="0.5" />

      {/* tree */}
      <rect x="60" y="300" width="12" height="120" rx="4" fill="#1b1640" />
      <circle cx="66" cy="288" r="40" fill="#34d399" />
      <circle cx="40" cy="308" r="28" fill="#22d3ee" />
      <circle cx="92" cy="308" r="26" fill="#6d5efc" />

      {/* building body */}
      <rect x="98" y="96" width="240" height="330" rx="10" fill="url(#wall)" stroke="#4a3fb0" strokeWidth="3" />
      {/* roof */}
      <path d="M92 96 L218 58 L344 96 Z" fill="#1b1640" stroke="#0e0b2a" strokeWidth="3" strokeLinejoin="round" />
      {/* chimney */}
      <rect x="286" y="66" width="20" height="30" fill="#1b1640" />

      {/* floor dividers */}
      {[0, 1, 2].map((f) => (
        <line key={f} x1="98" y1={startY + f * stepY + 56} x2="338" y2={startY + f * stepY + 56} stroke="#6d5efc" strokeOpacity="0.35" strokeWidth="2" />
      ))}

      {/* windows */}
      {LIT.map((row, f) =>
        row.map((lit, c) => {
          const x = startX + c * stepX;
          const y = startY + f * stepY;
          return (
            <g key={`${f}-${c}`}>
              <rect x={x - 4} y={y - 4} width={winW + 8} height={winH + 8} rx="6" fill="#6d5efc" opacity="0.9" />
              <rect x={x} y={y} width={winW} height={winH} rx="3" fill={lit ? "url(#win)" : "#0e0b2a"} />
              {lit ? <rect x={x} y={y} width={winW} height={winH / 2} rx="3" fill="#fff" opacity="0.18" /> : null}
              <line x1={x + winW / 2} y1={y} x2={x + winW / 2} y2={y + winH} stroke="#4a3fb0" strokeWidth="2" />
              <line x1={x} y1={y + winH / 2} x2={x + winW} y2={y + winH / 2} stroke="#4a3fb0" strokeWidth="2" />
              {/* balcony */}
              <rect x={x - 8} y={y + winH + 6} width={winW + 16} height="7" rx="3" fill="#4a3fb0" />
              <circle cx={x + 6} cy={y + winH + 2} r="4" fill="#34d399" />
              <circle cx={x + winW - 6} cy={y + winH + 2} r="4" fill="#f43f9d" />
            </g>
          );
        }),
      )}

      {/* ground floor: awning + door + shop windows */}
      <rect x="112" y="352" width="212" height="10" fill="#4a3fb0" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={112 + i * 35} y="362" width="18" height="20" fill={i % 2 ? "#f43f9d" : "#eae8ff"} />
      ))}
      {/* door */}
      <rect x="196" y="392" width="46" height="34" rx="4" fill="#fb923c" />
      <rect x="196" y="392" width="46" height="34" rx="4" fill="none" stroke="#4a3fb0" strokeWidth="3" />
      <circle cx="234" cy="410" r="2.5" fill="#eae8ff" />
      {/* shop windows */}
      <rect x="126" y="394" width="52" height="32" rx="3" fill="#fbbf24" opacity="0.9" />
      <rect x="260" y="394" width="52" height="32" rx="3" fill="#fbbf24" opacity="0.9" />

      {/* ground line */}
      <rect x="20" y="420" width="420" height="10" rx="5" fill="#6d5efc" opacity="0.5" />
    </svg>
  );
}
