import type { CSSProperties, ReactNode } from "react";
import type { ArtMotif, ArtTone } from "@/lib/design-shop/catalog";
import { cn } from "@/lib/utils";

/**
 * Every product tile in this shop is generated artwork, not a photograph.
 * That is a deliberate constraint of the demo — nothing here should be
 * mistakable for a real retailer's product photography — but it also has to
 * carry the page visually, so each motif is a real drawing rather than a
 * grey box.
 *
 * Colour comes from `var(--art-<tone>)` mixed against `--card`, so the whole
 * set re-tints with the theme (and would re-tint with a rebrand) without this
 * file knowing a single hex value. Mixing against --card rather than a fixed
 * white is why the dark theme's tiles read as tinted charcoal instead of
 * washed-out pastels.
 *
 * The motif paths use SVG presentation attributes (`fill="var(--art-mark)"`)
 * rather than Tailwind `fill-[...]` utilities on purpose: these are inside a
 * `.map()` over indices, so half the opacity values would be dynamically
 * constructed class names that Tailwind's scanner cannot see and would never
 * generate. Presentation attributes have no such failure mode.
 */

interface ProductArtProps {
  tone: ArtTone;
  motif: ArtMotif;
  className?: string;
  /** Scales the motif up for hero-sized renders. */
  emphasis?: "default" | "large";
}

const MARK = "var(--art-mark)";

const MOTIFS: Record<ArtMotif, ReactNode> = {
  /*
   * Every arc here is centred below the viewBox with a radius wide enough
   * that both endpoints fall outside 0–120. That is not incidental: the
   * first version used arcs whose endpoints landed *inside* the frame, and
   * once `slice` cropped them they read unmistakably as spider legs coming
   * off the disc. An arc has to leave the frame to read as a horizon.
   */
  sun: (
    <>
      <path d="M-38 132a98 98 0 0 1 196 0" stroke={MARK} fill="none" strokeWidth="2.5" opacity="0.3" />
      <path d="M-24 132a84 84 0 0 1 168 0" stroke={MARK} fill="none" strokeWidth="2.5" opacity="0.55" />
      <path d="M-10 132a70 70 0 0 1 140 0" stroke={MARK} fill="none" strokeWidth="2.5" opacity="0.85" />
      <circle cx="60" cy="30" r="16" fill={MARK} />
    </>
  ),
  ridge: (
    <>
      <path d="M0 106 36 60l24 26 28-40 34 60Z" fill={MARK} opacity="0.32" />
      <path d="M0 106 30 70l20 20 26-34 30 50Z" fill={MARK} />
      <circle cx="90" cy="30" r="11" fill={MARK} opacity="0.55" />
    </>
  ),
  tide: (
    <>
      <path
        d="M-4 42c16-14 32 14 48 0s32-14 48 0 24 6 32 0"
        stroke={MARK}
        fill="none"
        strokeWidth="3"
        opacity="0.35"
      />
      <path
        d="M-4 64c16-14 32 14 48 0s32-14 48 0 24 6 32 0"
        stroke={MARK}
        fill="none"
        strokeWidth="3"
        opacity="0.65"
      />
      <path
        d="M-4 86c16-14 32 14 48 0s32-14 48 0 24 6 32 0"
        stroke={MARK}
        fill="none"
        strokeWidth="3"
      />
    </>
  ),
  grain: (
    <>
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={20 + col * 20}
            cy={20 + row * 20}
            r={2 + ((row + col) % 3) * 1.9}
            fill={MARK}
            opacity={0.3 + ((row * 5 + col) % 4) * 0.2}
          />
        )),
      )}
    </>
  ),
  orbit: (
    <>
      <circle cx="58" cy="62" r="48" stroke={MARK} fill="none" strokeWidth="2" opacity="0.28" />
      <circle cx="58" cy="62" r="34" stroke={MARK} fill="none" strokeWidth="3" opacity="0.55" />
      <circle cx="58" cy="62" r="16" fill={MARK} />
      <circle cx="94" cy="28" r="9" fill={MARK} opacity="0.8" />
    </>
  ),
  vessel: (
    <>
      <path d="M30 36h50l-5 48a12 12 0 0 1-12 11H47a12 12 0 0 1-12-11Z" fill={MARK} />
      <path d="M82 46h6a12 12 0 0 1 0 24h-4" stroke={MARK} fill="none" strokeWidth="4" opacity="0.7" />
      <path d="M20 104h80" stroke={MARK} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </>
  ),
};

export function ProductArt({ tone, motif, className, emphasis = "default" }: ProductArtProps) {
  const style = {
    "--art-base": `var(--art-${tone})`,
    "--art-mark": "color-mix(in srgb, var(--art-base) 80%, var(--foreground))",
    backgroundImage:
      "linear-gradient(155deg, color-mix(in srgb, var(--art-base) 14%, var(--card)) 0%, color-mix(in srgb, var(--art-base) 38%, var(--card)) 100%)",
  } as CSSProperties;

  return (
    <div aria-hidden="true" style={style} className={cn("relative overflow-hidden", className)}>
      <svg
        viewBox="0 0 120 120"
        preserveAspectRatio="xMidYMid slice"
        className={cn("h-full w-full", emphasis === "large" && "scale-105")}
      >
        {MOTIFS[motif]}
      </svg>
    </div>
  );
}
