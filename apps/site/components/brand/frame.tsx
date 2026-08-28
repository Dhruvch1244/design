import { cn } from "@/lib/utils";

/**
 * The glass card: translucent surface, backdrop-blur, a hairline border,
 * an ambient shadow for depth, and an accent glow that only appears on
 * hover — the "Ethereal Glass" texture that matches dhruvchoudhary.com's
 * own card treatment (backdrop-blur(10px) over the void background) rather
 * than a flat bordered div.
 *
 * The base ambient shadow matters more than it looks like it should:
 * translucency alone only reads as "glass" over something rich to blur
 * (the void background + starfield). Over the light theme's plain cream
 * page, a low-opacity card with no shadow at all just looks like a flat,
 * slightly-off-white div — shadow-ambient is what still separates the card
 * from the page when the blur-over-darkness effect isn't doing that work.
 */
export function Frame({
  children,
  className,
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-glass p-6 shadow-ambient backdrop-blur-xl",
        "transition-shadow duration-500 ease-fluid",
        glow && "hover:shadow-glow",
        className,
      )}
    >
      {children}
    </div>
  );
}
