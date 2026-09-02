import type { ReactNode } from "react";
import { StarIcon } from "@/components/design-shop/icons";
import { formatMoney } from "@/lib/design-shop/catalog";
import { cn } from "@/lib/utils";

/**
 * Four layout/typography primitives this shop uses more than once. They exist
 * so the voice's spacing and type rules live in one place rather than being
 * re-typed as ad-hoc class strings on every page — the same reason the colour
 * values live in globals.css rather than inline.
 */

/** The single page gutter. Every route uses this and nothing else. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>
  );
}

/**
 * Small caps label above a heading. Mono, wide-tracked, and the one place
 * the mono face appears in this design — the token doc's "meta/code, used
 * sparingly" rule for this voice.
 */
export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p
      className={cn(
        "font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Body copy at a constrained measure. The editorial-warm voice fails outright
 * if a paragraph runs edge-to-edge on a wide screen, so the max-width is part
 * of the component rather than something each page remembers.
 */
export function Prose({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("max-w-[62ch] text-[0.9375rem] leading-[1.75] text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function Price({
  amount,
  was,
  className,
}: {
  amount: number;
  was?: number;
  className?: string;
}) {
  return (
    <span className={cn("tnum inline-flex items-baseline gap-2", className)}>
      <span>{formatMoney(amount)}</span>
      {was !== undefined && was > amount && (
        <span className="text-sm text-muted-foreground line-through">{formatMoney(was)}</span>
      )}
    </span>
  );
}

export function Stars({
  rating,
  count,
  className,
}: {
  rating: number | null;
  count?: number;
  className?: string;
}) {
  if (rating === null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>No reviews yet</span>
    );
  }
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      // One accessible name for the whole group — five separate star glyphs
      // announced individually is noise, not information.
      aria-label={`Rated ${rating} out of 5${count ? ` from ${count} reviews` : ""}`}
      role="img"
    >
      <span className="flex items-center gap-0.5 text-accent" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} filled={i <= Math.round(rating)} className="h-3.5 w-3.5" />
        ))}
      </span>
      <span className="tnum text-xs text-muted-foreground" aria-hidden="true">
        {rating.toFixed(1)}
        {count ? ` · ${count}` : ""}
      </span>
    </span>
  );
}
