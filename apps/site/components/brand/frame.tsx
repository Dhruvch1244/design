import { cn } from "@/lib/utils";

/**
 * The "double-bezel" wrapper: an outer shell (thin border, large radius,
 * faint tinted fill) around an inner core (the card's actual background,
 * a slightly smaller concentric radius, a soft inner highlight). Makes a
 * card read as machined hardware — a glass plate sitting in a tray — rather
 * than a flat div with a border. Used for every major card on the site.
 */
export function Frame({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-border bg-ivory-100/60 p-1.5 dark:bg-white/[0.03]",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-[1.375rem] bg-card p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
          "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
