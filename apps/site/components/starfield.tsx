"use client";

import { useEffect, useRef } from "react";

/**
 * The background starfield, now with mouse-driven depth parallax — the
 * "next wave" on top of the static version. Deliberately on-brand rather
 * than just a generic effect: the brightest, cyan-tinted layer (this
 * element's own background) barely moves at all, while the two fainter
 * dust layers (its ::before/::after — see globals.css) drift further. That
 * mirrors the actual Dhruv/pole-star concept the mark is built on — one
 * fixed point, everything else appears to shift around it — rather than
 * all three layers moving in lockstep, which would just look like the
 * whole background sliding.
 *
 * Implementation: this component owns only the pointer tracking. The
 * layers, their gradients, colors (light/dark via --star-color), and the
 * twinkle animation all still live in globals.css exactly as before —
 * this just sets --parallax-x/--parallax-y custom properties on the root
 * element, which the CSS reads with different multipliers per layer via
 * calc(). Pointer handling is rAF-throttled (one pending update per frame,
 * never one DOM write per raw pointermove event) and gated behind
 * prefers-reduced-motion.
 */
export function Starfield() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    function onPointerMove(e: PointerEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      pending = { x, y };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (pending && ref.current) {
          ref.current.style.setProperty("--parallax-x", `${pending.x * 20}px`);
          ref.current.style.setProperty("--parallax-y", `${pending.y * 20}px`);
        }
      });
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className="starfield" />;
}
