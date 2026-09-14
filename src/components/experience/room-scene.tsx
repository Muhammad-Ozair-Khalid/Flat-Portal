import { memo } from "react";

type Variant = "living" | "kitchen" | "bedroom";

const PALETTES: Record<Variant, { wallTop: string; wallBot: string; floor: string; board: string; accent: string; accent2: string }> = {
  living: { wallTop: "#bd7f45", wallBot: "#8a4f24", floor: "#6f4523", board: "#583516", accent: "#a23a2a", accent2: "#cf9445" },
  kitchen: { wallTop: "#a98d54", wallBot: "#79602f", floor: "#6f4523", board: "#583516", accent: "#5f7138", accent2: "#a97b20" },
  bedroom: { wallTop: "#ab6360", wallBot: "#6f3d43", floor: "#6f4523", board: "#583516", accent: "#b05e2e", accent2: "#caa27a" },
};

/**
 * A big, warm interior illustration of a room in Flat 3B, looking out onto the
 * city at dusk. Front-on "photo" of the flat — swap `variant` for a different
 * room. (If you ever want a real photo here instead, drop an <img> in place of
 * this component; the surrounding 3D panel styling stays the same.)
 */
export const RoomScene = memo(function RoomScene({
  variant = "living",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const p = PALETTES[variant];
  const uid = variant; // gradient id namespace

  return (
    <svg viewBox="0 0 1200 760" className={className} role="img" aria-label={`${variant} in Flat 3B`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.wallTop} />
          <stop offset="1" stopColor={p.wallBot} />
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.board} />
          <stop offset="1" stopColor={p.floor} />
        </linearGradient>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2350" />
          <stop offset="0.45" stopColor="#7a4f6b" />
          <stop offset="0.72" stopColor="#e0954a" />
          <stop offset="1" stopColor="#f7cd7c" />
        </linearGradient>
        <radialGradient id={`${uid}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9bd" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe9bd" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-winglow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffdca0" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffdca0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* wall + floor */}
      <rect x="0" y="0" width="1200" height="548" fill={`url(#${uid}-wall)`} />
      <rect x="0" y="524" width="1200" height="26" fill="#000" opacity="0.16" />
      <rect x="0" y="548" width="1200" height="212" fill={`url(#${uid}-floor)`} />
      {[588, 628, 672, 720].map((y) => (
        <rect key={y} x="0" y={y} width="1200" height="2" fill="#000" opacity="0.14" />
      ))}
      {/* soft corner shade for depth */}
      <rect x="0" y="0" width="150" height="548" fill="#000" opacity="0.12" />
      <rect x="1050" y="0" width="150" height="548" fill="#000" opacity="0.1" />

      {/* window onto the dusk city */}
      <g>
        <rect x="96" y="70" width="384" height="372" rx="12" fill={`url(#${uid}-winglow)`} opacity="0.9" transform="translate(-16 -16) scale(1.08)" />
        <rect x="120" y="86" width="336" height="336" rx="8" fill="#efe0c2" />
        <rect x="132" y="98" width="312" height="312" fill={`url(#${uid}-sky)`} />
        {/* moon */}
        <circle cx="360" cy="150" r="26" fill="#fff4d8" opacity="0.92" />
        {/* skyline silhouettes */}
        <g fill="#241a2e" opacity="0.94">
          <rect x="140" y="250" width="52" height="160" />
          <rect x="196" y="210" width="40" height="200" />
          <rect x="240" y="286" width="60" height="124" />
          <rect x="306" y="232" width="46" height="178" />
          <rect x="356" y="272" width="52" height="138" />
          <rect x="412" y="300" width="32" height="110" />
        </g>
        {/* lit windows */}
        <g fill="#ffd47a" opacity="0.85">
          {[
            [152, 268], [172, 268], [152, 300], [172, 332],
            [208, 228], [222, 260], [208, 292], [222, 324],
            [256, 304], [276, 336], [316, 250], [332, 282], [316, 314],
            [368, 292], [388, 324],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="8" height="12" />
          ))}
        </g>
        {/* muntins */}
        <rect x="286" y="98" width="4" height="312" fill="#efe0c2" />
        <rect x="132" y="250" width="312" height="4" fill="#efe0c2" />
        {/* sill */}
        <rect x="110" y="422" width="356" height="16" rx="4" fill="#d9c39a" />
      </g>

      {/* pendant lamp */}
      <g>
        <ellipse cx="840" cy="470" rx="150" ry="150" fill={`url(#${uid}-lamp)`} />
        <rect x="838" y="40" width="4" height="120" fill="#3a2a18" />
        <path d="M800 160 h80 l-16 46 h-48 z" fill="#2e2113" />
        <ellipse cx="840" cy="206" rx="24" ry="6" fill="#ffe9bd" />
      </g>

      {/* framed art */}
      <g transform="translate(980 150)">
        <rect x="-6" y="-6" width="132" height="164" rx="6" fill="#2e2113" />
        <rect x="0" y="0" width="120" height="152" fill="#f3e6cb" />
        <path d="M8 120 L44 60 L76 104 L96 74 L112 120 Z" fill={p.accent} opacity="0.85" />
        <circle cx="90" cy="36" r="14" fill={p.accent2} />
      </g>

      {variant === "living" && (
        <g>
          {/* rug */}
          <ellipse cx="640" cy="700" rx="360" ry="46" fill={p.accent} opacity="0.22" />
          {/* sofa */}
          <g transform="translate(470 470)">
            <rect x="0" y="70" width="360" height="120" rx="20" fill={p.accent} />
            <rect x="-8" y="20" width="70" height="150" rx="20" fill={p.accent} />
            <rect x="298" y="20" width="70" height="150" rx="20" fill={p.accent} />
            <rect x="20" y="30" width="140" height="70" rx="16" fill="#fff" opacity="0.14" />
            <rect x="180" y="30" width="140" height="70" rx="16" fill="#000" opacity="0.12" />
            <rect x="40" y="180" width="24" height="34" fill="#3a2a18" />
            <rect x="296" y="180" width="24" height="34" fill="#3a2a18" />
          </g>
          {/* cushion */}
          <rect x="520" y="486" width="64" height="64" rx="14" fill={p.accent2} transform="rotate(-8 552 518)" />
          {/* coffee table */}
          <g transform="translate(560 636)">
            <rect x="0" y="0" width="170" height="18" rx="6" fill="#3a2a18" />
            <rect x="8" y="18" width="12" height="40" fill="#2e2113" />
            <rect x="150" y="18" width="12" height="40" fill="#2e2113" />
          </g>
          {/* plant */}
          <g transform="translate(940 470)">
            <rect x="24" y="120" width="56" height="70" rx="8" fill={p.accent2} />
            <path d="M52 120 C10 80 20 30 52 10 C84 30 94 80 52 120 Z" fill="#5f7138" />
            <path d="M52 120 C30 92 34 54 52 34 C70 54 74 92 52 120 Z" fill="#728a44" />
          </g>
        </g>
      )}

      {variant === "kitchen" && (
        <g>
          {/* base cabinets + counter */}
          <rect x="120" y="560" width="640" height="150" fill={p.accent} />
          {[180, 300, 420, 540, 660].map((x) => (
            <rect key={x} x={x} y="576" width="90" height="118" rx="6" fill="#000" opacity="0.12" />
          ))}
          <rect x="108" y="540" width="664" height="26" rx="6" fill="#efe4d0" />
          {/* upper cabinets */}
          <rect x="560" y="150" width="220" height="120" rx="6" fill={p.accent} opacity="0.92" />
          <rect x="576" y="164" width="90" height="92" rx="5" fill="#000" opacity="0.12" />
          <rect x="676" y="164" width="90" height="92" rx="5" fill="#000" opacity="0.12" />
          {/* range hood */}
          <path d="M600 150 h140 l-24 70 h-92 z" fill="#4a3620" />
          {/* kettle + bowl on counter */}
          <g transform="translate(200 470)">
            <path d="M0 60 q6 -46 44 -46 q38 0 44 46 z" fill="#3a2a18" />
            <rect x="16" y="18" width="56" height="10" rx="5" fill="#2e2113" />
          </g>
          <g transform="translate(360 500)">
            <path d="M0 20 a60 20 0 0 0 120 0 z" fill={p.accent2} />
            <circle cx="42" cy="14" r="14" fill="#a23a2a" />
            <circle cx="72" cy="10" r="14" fill="#cf9445" />
            <circle cx="58" cy="22" r="13" fill="#5f7138" />
          </g>
          {/* stools */}
          {[840, 940].map((x) => (
            <g key={x} transform={`translate(${x} 560)`}>
              <ellipse cx="30" cy="6" rx="34" ry="10" fill="#3a2a18" />
              <rect x="10" y="10" width="8" height="130" fill="#2e2113" />
              <rect x="44" y="10" width="8" height="130" fill="#2e2113" />
            </g>
          ))}
        </g>
      )}

      {variant === "bedroom" && (
        <g>
          {/* rug */}
          <ellipse cx="620" cy="710" rx="380" ry="42" fill={p.accent} opacity="0.2" />
          {/* bed */}
          <g transform="translate(470 430)">
            <rect x="0" y="0" width="70" height="200" rx="12" fill="#4a3620" />
            <rect x="60" y="120" width="470" height="110" rx="14" fill={p.accent} />
            <rect x="60" y="96" width="470" height="34" rx="10" fill="#fff" opacity="0.14" />
            {/* pillows */}
            <rect x="86" y="70" width="120" height="60" rx="16" fill="#f3e6cb" />
            <rect x="220" y="70" width="120" height="60" rx="16" fill="#efe0c2" />
            {/* duvet fold */}
            <path d="M60 170 h470 v18 q-235 26 -470 0 z" fill="#000" opacity="0.12" />
            <rect x="70" y="230" width="18" height="30" fill="#3a2a18" />
            <rect x="512" y="230" width="18" height="30" fill="#3a2a18" />
          </g>
          {/* nightstand + lamp */}
          <g transform="translate(1010 500)">
            <rect x="0" y="40" width="110" height="120" rx="8" fill="#4a3620" />
            <rect x="14" y="60" width="82" height="30" rx="5" fill="#000" opacity="0.14" />
            <ellipse cx="55" cy="-6" rx="120" ry="120" fill={`url(#${uid}-lamp)`} />
            <path d="M34 0 h42 l10 40 h-62 z" fill={p.accent2} />
            <rect x="52" y="40" width="6" height="0" />
          </g>
          {/* plant */}
          <g transform="translate(330 470)">
            <rect x="24" y="120" width="56" height="70" rx="8" fill={p.accent2} />
            <path d="M52 120 C10 80 20 30 52 10 C84 30 94 80 52 120 Z" fill="#5f7138" />
          </g>
        </g>
      )}

      {/* warm ambient wash */}
      <rect x="0" y="0" width="1200" height="760" fill="#ffb14a" opacity="0.06" />
      <rect x="0" y="0" width="1200" height="760" fill="url(#vignette)" />
      <radialGradient id="vignette" cx="0.5" cy="0.42" r="0.75">
        <stop offset="0.6" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.28" />
      </radialGradient>
    </svg>
  );
});
