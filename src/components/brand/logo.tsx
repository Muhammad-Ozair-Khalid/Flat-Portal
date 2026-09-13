import { cn } from "@/lib/utils";

/** The Flat Portal mark: a house holding a keyhole — home + access. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[0.55rem] bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="h-[62%] w-[62%]" fill="none">
        <path
          d="M16 4.2 5.5 12.4a1.4 1.4 0 0 0-.54 1.1V27a1 1 0 0 0 1 1h20.1a1 1 0 0 0 1-1V13.5a1.4 1.4 0 0 0-.54-1.1L16 4.2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="17.4" r="2.4" fill="currentColor" />
        <path d="M14.9 18.9h2.2l.7 4.3h-3.6l.7-4.3Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("h-9 w-9", markClassName)} />
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Flat<span className="text-primary">Portal</span>
        </span>
      )}
    </span>
  );
}
