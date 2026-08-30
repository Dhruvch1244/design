import { cn } from "@/lib/utils";

/** The small pill tag that precedes a display heading, e.g. "PHILOSOPHY / 001". */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1",
        "text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
      {children}
    </span>
  );
}
