import { IsometricFlat } from "@/components/brand/isometric-flat";

export function GreetingHero({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="ambient relative mb-6 overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 elevate-lg sm:p-8">
      <div className="relative z-[1] flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1 max-w-md text-muted-foreground">{subtitle}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>
        <div className="pointer-events-none hidden w-40 shrink-0 opacity-95 sm:block lg:w-56">
          <IsometricFlat />
        </div>
      </div>
    </div>
  );
}
