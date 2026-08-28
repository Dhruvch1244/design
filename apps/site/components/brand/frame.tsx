import { cn } from "@/lib/utils";

/**
 * The glass card: translucent surface, backdrop-blur, a hairline border,
 * and a cyan glow that only appears on hover — the "Ethereal Glass" texture
 * that matches dhruvchoudhary.com's own card treatment (backdrop-blur(10px)
 * over the void background) rather than a flat bordered div.
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
        "rounded-3xl border border-border bg-glass p-6 backdrop-blur-xl transition-shadow",
        "duration-500 ease-fluid",
        glow && "hover:shadow-glow",
        className,
      )}
    >
      {children}
    </div>
  );
}
