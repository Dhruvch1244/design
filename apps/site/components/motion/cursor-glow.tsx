"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Confines a soft cyan glow to follow the pointer within this container only
 * (not the whole viewport) — a scoped haptic detail for the hero, not a
 * global cursor-follow effect that would be distracting everywhere. Paints
 * via a radial-gradient background-image driven by CSS custom properties,
 * so the only per-move cost is a style write, never a layout-affecting one.
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
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    ref.current!.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
    ref.current!.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      className={cn("relative", className)}
      style={{
        backgroundImage:
          "radial-gradient(360px circle at var(--glow-x, 50%) var(--glow-y, 0%), color-mix(in srgb, var(--cyan) 14%, transparent), transparent 70%)",
      }}
    >
      {children}
    </div>
  );
}
