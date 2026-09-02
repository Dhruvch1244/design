import { cn } from "@/lib/utils";

/**
 * The Thrum wordmark.
 *
 * Mixed weight inside a single word — a light "th" against an extra-bold
 * "rum" — which is the startup voice's own typographic device applied at
 * brand scale. It only works on a variable face with a real weight axis,
 * which is why the display font is Bricolage Grotesque rather than a
 * two-weight static family.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "select-none font-display text-2xl leading-none tracking-[-0.04em]",
        className,
      )}
    >
      <span className="font-light text-foreground">th</span>
      <span className="text-gradient font-extrabold">rum</span>
    </span>
  );
}
