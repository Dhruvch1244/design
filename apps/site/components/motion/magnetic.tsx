"use client";

import { useRef } from "react";

/**
 * Wraps a button/link and pulls it slightly toward the pointer on hover —
 * the "magnetic button" haptic detail. Mutates style.transform directly via
 * ref instead of state, so tracking pointer movement never triggers a React
 * re-render; only transform is touched, so it's compositor-only.
 */
export function Magnetic({
  children,
  strength = 14,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left - rect.width / 2) / rect.width) * strength;
    const y = ((e.clientY - rect.top - rect.height / 2) / rect.height) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={className}
      style={{ transition: "transform 400ms var(--ease-fluid, cubic-bezier(0.32,0.72,0,1))" }}
    >
      {children}
    </div>
  );
}
