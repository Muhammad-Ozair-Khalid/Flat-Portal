import { memo } from "react";

export type RoomVariant = "bedroom" | "lounge" | "kitchen";

const DEFAULT_ACCENT: Record<RoomVariant, string> = {
  bedroom: "var(--room-1)",
  lounge: "var(--room-lounge)",
  kitchen: "var(--room-kitchen)",
};

/**
 * A neon-dusk illustration of a room in Flat 408, looking out onto the city at
 * night. `accent` (any CSS colour, e.g. `var(--room-2)`) tints the room's glow
 * and soft furnishings so each room can carry its own hue. Swap in a real photo
 * later by dropping an <img> where this component sits — the 3D framing stays.
 */
export const RoomScene = memo(function RoomScene({
  variant = "bedroom",
  accent,
  className,
}: {
  variant?: RoomVariant;
  accent?: string;
  className?: string;
}) {
  const a = accent ?? DEFAULT_ACCENT[variant];
  const uid = variant;

  return (
    <svg viewBox="0 0 1200 760" className={className} role="img" aria-label={`${variant} in Flat 408`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#241d57" />
          <stop offset="1" stopColor="#120f34" />
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1547" />
          <stop offset="1" stopColor="#0c0926" />
        </linearGradient>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1233" />
          <stop offset="0.42" stopColor="#3b1e63" />
          <stop offset="0.72" stopColor="#b8347f" />
          <stop offset="1" stopColor="#ff9a5a" />
        </linearGradient>
        <radialGradient id={`${uid}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={a} stopOpacity="0.85" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-winglow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7de3ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7de3ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-vig`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.42" />
        </radialGradient>
      </defs>

      {/* wall + floor */}
      <rect x="0" y="0" width="1200" height="548" fill={`url(#${uid}-wall)`} />
      <rect x="0" y="524" width="1200" height="26" fill="#000" opacity="0.22" />
      <rect x="0" y="548" width="1200" height="212" fill={`url(#${uid}-floor)`} />
      {[588, 628, 672, 720].map((y) => (
        <rect key={y} x="0" y={y} width="1200" height="2" fill="#000" opacity="0.2" />
      ))}
      {/* accent light spill on the floor */}
      <ellipse cx="640" cy="590" rx="520" ry="70" fill={a} opacity="0.1" />
      {/* corner shade for depth */}
      <rect x="0" y="0" width="150" height="548" fill="#000" opacity="0.16" />
      <rect x="1050" y="0" width="150" height="548" fill="#000" opacity="0.14" />

      {/* window onto the neon city at dusk */}
      <g>
        <rect x="96" y="70" width="384" height="372" rx="12" fill={`url(#${uid}-winglow)`} opacity="0.9" transform="translate(-16 -16) scale(1.08)" />
        <rect x="120" y="86" width="336" height="336" rx="8" fill="#0a0820" />
        <rect x="132" y="98" width="312" height="312" fill={`url(#${uid}-sky)`} />
        {/* moon */}
        <circle cx="360" cy="150" r="24" fill="#fff4f8" opacity="0.92" />
        {/* skyline silhouettes */}
        <g fill="#0a0820" opacity="0.96">
          <rect x="140" y="250" width="52" height="160" />
          <rect x="196" y="210" width="40" height="200" />
          <rect x="240" y="286" width="60" height="124" />
          <rect x="306" y="232" width="46" height="178" />
          <rect x="356" y="272" width="52" height="138" />
          <rect x="412" y="300" width="32" height="110" />
        </g>
        {/* lit windows in accent + cyan */}
        <g opacity="0.9">
          {[
            [152, 268], [172, 268], [152, 300], [172, 332],
            [208, 228], [222, 260], [208, 292], [222, 324],
            [256, 304], [276, 336], [316, 250], [332, 282], [316, 314],
            [368, 292], [388, 324],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="8" height="12" fill={i % 3 === 0 ? "#2ee6ff" : a} />
          ))}
        </g>
        {/* muntins */}
        <rect x="286" y="98" width="4" height="312" fill="#0a0820" />
        <rect x="132" y="250" width="312" height="4" fill="#0a0820" />
        {/* sill */}
        <rect x="110" y="422" width="356" height="16" rx="4" fill="#1a1547" />
      </g>

      {variant === "bedroom" && (
        <g>
          <ellipse cx="620" cy="710" rx="380" ry="42" fill={a} opacity="0.18" />
          {/* bed */}
          <g transform="translate(470 430)">
            <rect x="0" y="0" width="70" height="200" rx="12" fill="#241d57" />
            <rect x="60" y="120" width="470" height="110" rx="14" fill={a} opacity="0.9" />
            <rect x="60" y="96" width="470" height="34" rx="10" fill="#fff" opacity="0.12" />
            <rect x="86" y="70" width="120" height="60" rx="16" fill="#e9e7ff" />
            <rect x="220" y="70" width="120" height="60" rx="16" fill="#d5d1ff" />
            <path d="M60 170 h470 v18 q-235 26 -470 0 z" fill="#000" opacity="0.16" />
            <rect x="70" y="230" width="18" height="30" fill="#181346" />
            <rect x="512" y="230" width="18" height="30" fill="#181346" />
          </g>
          {/* nightstand + neon lamp */}
          <g transform="translate(1010 500)">
            <rect x="0" y="40" width="110" height="120" rx="8" fill="#1c1650" />
            <rect x="14" y="60" width="82" height="30" rx="5" fill="#000" opacity="0.2" />
            <ellipse cx="55" cy="-6" rx="120" ry="120" fill={`url(#${uid}-lamp)`} />
            <path d="M34 0 h42 l10 40 h-62 z" fill={a} />
          </g>
          {/* plant */}
          <g transform="translate(330 470)">
            <rect x="24" y="120" width="56" height="70" rx="8" fill="#1c1650" />
            <path d="M52 120 C10 80 20 30 52 10 C84 30 94 80 52 120 Z" fill="#2dd4bf" />
          </g>
        </g>
      )}

      {variant === "lounge" && (
        <g>
          {/* wall-mounted glowing TV */}
          <g transform="translate(560 120)">
            <ellipse cx="230" cy="120" rx="300" ry="150" fill="#2ee6ff" opacity="0.12" />
            <rect x="30" y="0" width="400" height="230" rx="14" fill="#05030f" />
            <rect x="44" y="14" width="372" height="202" rx="8" fill="#0a1230" />
            <rect x="44" y="14" width="372" height="202" rx="8" fill={a} opacity="0.28" />
            {/* on-screen glow bands */}
            <rect x="44" y="60" width="372" height="30" fill="#2ee6ff" opacity="0.4" />
            <rect x="44" y="120" width="372" height="52" fill={a} opacity="0.45" />
            <rect x="210" y="230" width="40" height="26" fill="#181346" />
            <rect x="150" y="256" width="160" height="10" rx="5" fill="#241d57" />
          </g>
          {/* rug + sofa */}
          <ellipse cx="640" cy="700" rx="360" ry="46" fill={a} opacity="0.2" />
          <g transform="translate(470 470)">
            <rect x="0" y="70" width="360" height="120" rx="20" fill={a} opacity="0.92" />
            <rect x="-8" y="20" width="70" height="150" rx="20" fill={a} opacity="0.92" />
            <rect x="298" y="20" width="70" height="150" rx="20" fill={a} opacity="0.92" />
            <rect x="20" y="30" width="140" height="70" rx="16" fill="#fff" opacity="0.12" />
            <rect x="180" y="30" width="140" height="70" rx="16" fill="#000" opacity="0.14" />
            <rect x="40" y="180" width="24" height="34" fill="#181346" />
            <rect x="296" y="180" width="24" height="34" fill="#181346" />
          </g>
          <rect x="520" y="486" width="64" height="64" rx="14" fill="#2ee6ff" opacity="0.8" transform="rotate(-8 552 518)" />
          {/* coffee table */}
          <g transform="translate(560 636)">
            <rect x="0" y="0" width="170" height="18" rx="6" fill="#241d57" />
            <rect x="8" y="18" width="12" height="40" fill="#181346" />
            <rect x="150" y="18" width="12" height="40" fill="#181346" />
          </g>
        </g>
      )}

      {variant === "kitchen" && (
        <g>
          {/* base cabinets + counter */}
          <rect x="120" y="560" width="560" height="150" fill="#1c1650" />
          {[180, 300, 420, 540].map((x) => (
            <rect key={x} x={x} y="576" width="90" height="118" rx="6" fill="#000" opacity="0.18" />
          ))}
          <rect x="108" y="540" width="584" height="26" rx="6" fill="#2a2366" />
          {/* upper cabinets */}
          <rect x="150" y="150" width="220" height="120" rx="6" fill="#1c1650" />
          <rect x="166" y="164" width="90" height="92" rx="5" fill="#000" opacity="0.18" />
          <rect x="266" y="164" width="90" height="92" rx="5" fill="#000" opacity="0.18" />
          {/* the fridge — tall double-door, emerald sheen */}
          <g transform="translate(720 360)">
            <ellipse cx="90" cy="180" rx="150" ry="90" fill={a} opacity="0.14" />
            <rect x="0" y="0" width="180" height="350" rx="16" fill="#efeaff" />
            <rect x="0" y="0" width="180" height="350" rx="16" fill={a} opacity="0.16" />
            <rect x="10" y="10" width="160" height="150" rx="10" fill="#fff" opacity="0.5" />
            <rect x="10" y="172" width="160" height="168" rx="10" fill="#fff" opacity="0.42" />
            {/* seam + handles */}
            <rect x="0" y="163" width="180" height="6" fill="#241d57" opacity="0.4" />
            <rect x="150" y="30" width="10" height="110" rx="5" fill="#241d57" />
            <rect x="150" y="192" width="10" height="120" rx="5" fill="#241d57" />
            {/* little magnet dots */}
            <circle cx="40" cy="40" r="7" fill="#f43f9d" />
            <circle cx="64" cy="40" r="7" fill="#2ee6ff" />
          </g>
          {/* kettle + fruit bowl on counter */}
          <g transform="translate(200 470)">
            <path d="M0 60 q6 -46 44 -46 q38 0 44 46 z" fill="#241d57" />
            <rect x="16" y="18" width="56" height="10" rx="5" fill={a} />
          </g>
          <g transform="translate(360 500)">
            <path d="M0 20 a60 20 0 0 0 120 0 z" fill="#2a2366" />
            <circle cx="42" cy="14" r="14" fill="#f43f9d" />
            <circle cx="72" cy="10" r="14" fill="#fbbf24" />
            <circle cx="58" cy="22" r="13" fill={a} />
          </g>
        </g>
      )}

      {/* framed art */}
      <g transform="translate(980 150)">
        <rect x="-6" y="-6" width="132" height="164" rx="6" fill="#181346" />
        <rect x="0" y="0" width="120" height="152" fill="#0f0c30" />
        <path d="M8 120 L44 60 L76 104 L96 74 L112 120 Z" fill={a} opacity="0.9" />
        <circle cx="90" cy="36" r="14" fill="#2ee6ff" />
      </g>

      {/* ambient wash + vignette */}
      <rect x="0" y="0" width="1200" height="760" fill={a} opacity="0.05" />
      <rect x="0" y="0" width="1200" height="760" fill={`url(#${uid}-vig)`} />
    </svg>
  );
});
