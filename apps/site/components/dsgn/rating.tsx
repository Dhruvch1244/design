"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m12 2.5 2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7Z" />
    </svg>
  );
}

export interface RatingProps {
  /** Current rating. Fractional in read-only mode (e.g. 3.5); the interactive mode always commits whole numbers. */
  value: number;
  /** Supplying this switches Rating into controlled interactive input mode. Omit it for a pure read-only display. */
  onValueChange?: (value: number) => void;
  /** Number of icons in the scale. Default 5. */
  max?: number;
  /** Force read-only display even if `onValueChange` is supplied. Defaults to `!onValueChange`. */
  readOnly?: boolean;
  /** Custom icon, e.g. a heart or thumbs-up. Defaults to an inline star SVG -- no icon-library dependency. */
  icon?: React.ComponentType<{ className?: string }>;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  "aria-label"?: string;
}

/**
 * Rating renders `max` icons (a 5-point star scale by default) in one of two
 * modes:
 *
 * - Read-only display (the default whenever `onValueChange` isn't passed):
 *   `value` can be fractional (e.g. 3.5) -- each icon shows a partial fill
 *   via a clipped overlay (a dim outline copy underneath, a solid accent
 *   copy on top, absolutely positioned and width-clamped to the exact fill
 *   percentage) rather than rounding to the nearest whole icon.
 * - Controlled interactive input (`onValueChange` supplied): clicking or
 *   using arrow keys commits a whole-number rating. Hovering previews the
 *   value that would be committed, without touching `value` itself.
 *
 * Accessibility: interactive mode uses `role="radiogroup"` with one
 * `role="radio"` per icon, not `role="slider"`. A 1-N star rating is a
 * discrete choice among N named options ("rate it 1 star" / "2 stars" /
 * ... / "N stars"), which is exactly what radiogroup models -- not a
 * continuous value along a range, which is the contract `slider` implies
 * (arbitrary intermediate values, `aria-valuenow` tracking the literal
 * current position). Roving tabindex keeps only the radio matching the
 * current value in the tab order, matching the native radiogroup pattern.
 */
export function Rating({
  value,
  onValueChange,
  max = 5,
  readOnly = !onValueChange,
  icon: Icon = StarIcon,
  size = "md",
  className,
  "aria-label": ariaLabel = "Rating",
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const sizeClass = SIZE_CLASSES[size];

  if (readOnly) {
    return (
      <div
        className={cn("inline-flex items-center gap-0.5", className)}
        role="img"
        aria-label={`${value} out of ${max}`}
      >
        {Array.from({ length: max }, (_, i) => {
          const fraction = Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className={cn("relative inline-block", sizeClass)}>
              <Icon className={cn(sizeClass, "text-muted-foreground/30")} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fraction * 100}%` }}>
                <Icon className={cn(sizeClass, "text-accent")} />
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  const displayValue = hoverValue ?? value;

  function commit(next: number) {
    onValueChange?.(next);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(max, value + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(1, value - 1);
    else if (event.key === "Home") next = 1;
    else if (event.key === "End") next = max;
    else if (event.key === " " || event.key === "Enter") next = index + 1;

    if (next !== null) {
      event.preventDefault();
      commit(next);
      itemRefs.current[next - 1]?.focus();
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayValue;
        const isChecked = starValue === value;
        const isTabbable = value > 0 ? isChecked : starValue === 1;
        return (
          <button
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isChecked}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            tabIndex={isTabbable ? 0 : -1}
            onClick={() => commit(starValue)}
            onMouseEnter={() => setHoverValue(starValue)}
            onKeyDown={(event) => handleKeyDown(event, i)}
            className={cn(
              sizeClass,
              "rounded-sm outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <Icon className={cn(sizeClass, filled ? "text-accent" : "text-muted-foreground/30")} />
          </button>
        );
      })}
    </div>
  );
}
