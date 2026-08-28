"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Confines a soft accent-colored glow to follow the pointer within this
 * container only (not the whole viewport) — a scoped haptic detail, not a
 * global cursor-follow effect that would be distracting everywhere. Paints
 * via a radial-gradient on its own absolutely-positioned layer (not the
 * container's own background), so animating the glow's opacity in/out on
 * enter/leave can never affect the actual content's visibility — that's a
 * real trap here: an ancestor's opacity can't be "undone" by setting a
 * child's opacity back to 1, so the glow and the content must be siblings,
 * not parent/child.
 *
 * Uses var(--accent) rather than a hardcoded color, so it follows whichever
 * swatch the palette picker (components/palette-picker.tsx) has selected.
 */
export function CursorGlow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
    el.style.setProperty("--glow-opacity", "1");
  }

  function handleLeave() {
    ref.current?.style.setProperty("--glow-opacity", "0");
  }

  return (
    <div ref={ref} onPointerMove={handleMove} onPointerLeave={handleLeave} className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ease-out"
        style={{
          opacity: "var(--glow-opacity, 0)",
          backgroundImage:
            "radial-gradient(480px circle at var(--glow-x, 50%) var(--glow-y, 0%), color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
