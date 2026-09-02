"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../lib/utils";

// Renders one Thumb per value in `props.value`/`defaultValue`, so this same
// component covers both a single-handle slider (one number) and a range
// slider (two numbers) without a separate API — Radix's own value array is
// already shaped that way, this just reflects it rather than hiding it.
export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  // Radix puts role="slider" on each Thumb, not Root, so an aria-label
  // passed straight through to Root (as JSX intuitively suggests) is inert
  // to assistive tech — it never reaches the element that actually needs a
  // name. For a single-thumb slider, `aria-label`/`aria-labelledby` below
  // are applied to that one Thumb directly. A range slider has more than
  // one labelable control and no single name can describe both, so give
  // each one its own via thumbLabels (e.g. ["Minimum price", "Maximum price"]).
  thumbLabels?: string[];
}

export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, defaultValue, value, thumbLabels, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }, ref) => {
    const thumbCount = (value ?? defaultValue ?? [0]).length;
    return (
      <SliderPrimitive.Root
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full bg-accent" />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }).map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            aria-label={thumbLabels?.[i] ?? (thumbCount === 1 ? ariaLabel : undefined)}
            aria-labelledby={thumbCount === 1 ? ariaLabelledBy : undefined}
            className={cn(
              "block h-4 w-4 rounded-full border-2 border-accent bg-background shadow transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
            )}
          />
        ))}
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = SliderPrimitive.Root.displayName;
