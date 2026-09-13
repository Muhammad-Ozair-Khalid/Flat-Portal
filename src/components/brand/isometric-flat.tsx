import { cn } from "@/lib/utils";

/* An isometric, extruded floor plan of the shared flat — the hero motif.
   Pure SVG so it renders crisply in both themes with no 3D-transform quirks. */

const TILE_W = 42;
const TILE_H = 21;
const HEIGHT = 22; // wall extrusion
const OX = 150;
const OY = 44;

type Room = {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

// A clean 6×5 plot, fully tiled.
const rooms: Room[] = [
  { name: "Living", x: 0, y: 0, w: 3, h: 3, color: "#8a5a2b" },
  { name: "Kitchen", x: 3, y: 0, w: 3, h: 2, color: "#a97b20" },
  { name: "Room A", x: 3, y: 2, w: 3, h: 1, color: "#c08a4a" },
  { name: "Hall", x: 0, y: 3, w: 2, h: 2, color: "#6f7a3f" },
  { name: "Bath", x: 2, y: 3, w: 1, h: 2, color: "#4a6a7a" },
  { name: "Room B", x: 3, y: 3, w: 3, h: 2, color: "#a23a2a" },
];

type Pin = { room: string; label: string; color: string };
const pins: Pin[] = [
  { room: "Living", label: "AK", color: "#8a5a2b" },
  { room: "Kitchen", label: "SJ", color: "#b05e2e" },
  { room: "Room B", label: "MR", color: "#a23a2a" },
];

function iso(gx: number, gy: number) {
  return { x: OX + (gx - gy) * (TILE_W / 2), y: OY + (gx + gy) * (TILE_H / 2) };
}

function shade(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * factor));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * factor));
  const b = Math.min(255, Math.round((n & 255) * factor));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function pts(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

export function IsometricFlat({ className }: { className?: string }) {
  const ordered = [...rooms].sort((a, b) => a.x + a.y - (b.x + b.y));

  return (
    <svg
      viewBox="0 0 300 250"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Isometric floor plan of a shared flat with three flatmates"
    >
      <defs>
        <filter id="softshadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0c1a15" floodOpacity="0.28" />
        </filter>
        <radialGradient id="plot-glow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#c79a5e" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#c79a5e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="150" cy="150" rx="150" ry="95" fill="url(#plot-glow)" />

      {ordered.map((room) => {
        const A = iso(room.x, room.y);
        const B = iso(room.x + room.w, room.y);
        const C = iso(room.x + room.w, room.y + room.h);
        const D = iso(room.x, room.y + room.h);
        const down = (p: { x: number; y: number }) => ({ x: p.x, y: p.y + HEIGHT });
        const center = iso(room.x + room.w / 2, room.y + room.h / 2);
        return (
          <g key={room.name}>
            {/* left wall (darkest) */}
            <polygon points={pts([D, C, down(C), down(D)])} fill={shade(room.color, 0.62)} />
            {/* right wall (mid) */}
            <polygon points={pts([B, C, down(C), down(B)])} fill={shade(room.color, 0.8)} />
            {/* top (lightest) */}
            <polygon
              points={pts([A, B, C, D])}
              fill={room.color}
              stroke={shade(room.color, 0.55)}
              strokeWidth="0.8"
            />
            {/* subtle sheen on the top face */}
            <polygon points={pts([A, B, C, D])} fill={shade(room.color, 1.18)} opacity="0.18" />
            <text
              x={center.x}
              y={center.y + 3}
              textAnchor="middle"
              className="font-sans"
              fontSize="7"
              fontWeight="600"
              fill="#ffffff"
              opacity="0.92"
            >
              {room.name}
            </text>
          </g>
        );
      })}

      {/* flatmate pins floating above their rooms */}
      {pins.map((pin, i) => {
        const room = rooms.find((r) => r.name === pin.room)!;
        const c = iso(room.x + room.w / 2, room.y + room.h / 2);
        const lift = 30;
        return (
          <g key={pin.label} style={{ animation: `flatpin-float 4s ease-in-out ${i * 0.6}s infinite` }}>
            <ellipse cx={c.x} cy={c.y + 2} rx="9" ry="4.5" fill="#0c1a15" opacity="0.22" />
            <g filter="url(#softshadow)">
              <circle cx={c.x} cy={c.y - lift} r="12" fill={pin.color} stroke="#ffffff" strokeWidth="2" />
              <path
                d={`M ${c.x - 5} ${c.y - lift + 9} L ${c.x + 5} ${c.y - lift + 9} L ${c.x} ${c.y - lift + 18} Z`}
                fill={pin.color}
              />
              <text
                x={c.x}
                y={c.y - lift + 3.5}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill="#ffffff"
                className="font-sans"
              >
                {pin.label}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
