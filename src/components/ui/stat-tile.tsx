import type { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { StatTileMotion } from "@/components/ui/stat-tile-motion";

type Tone = "primary" | "success" | "warning" | "danger" | "info";

const toneColor: Record<Tone, string> = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
};

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  href,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  href?: string;
}) {
  const color = toneColor[tone];
  return (
    <StatTileMotion href={href}>
      <span
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 45%, transparent))` }}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white elevate-sm"
          style={{ background: `linear-gradient(140deg, ${color}, color-mix(in oklab, ${color} 58%, #000))` }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground">
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </StatTileMotion>
  );
}
