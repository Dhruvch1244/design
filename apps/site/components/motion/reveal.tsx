"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades/slides/un-blurs a section in as it enters the viewport, once.
 * IntersectionObserver-driven (not a scroll listener — see globals.css'
 * .reveal comment) so it costs one callback per element, not one per
 * scroll frame. `delay` staggers a group of siblings without needing a
 * parent orchestrator.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // threshold is a fraction of the target's own AREA, not the
      // viewport's — a 0.15 threshold silently never fires for an element
      // taller than ~6-7x the viewport (a long prose page, say), because
      // 15% of its area can never be on-screen at once. threshold:0 fires
      // on the first pixel instead, which is what "has this scrolled into
      // view yet" actually means regardless of the target's height.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);

    // Safety net, confirmed necessary by direct testing, not hypothetical:
    // IntersectionObserver callbacks are tied to the rendering pipeline, and
    // Chrome suspends them entirely for a backgrounded/hidden tab — verified
    // by observing document.body (always 100% visible) in a backgrounded
    // tab and getting zero callbacks. Content that only reveals on an
    // observer firing has no floor: if the tab starts hidden (opened in the
    // background, a permission prompt stealing focus during load, some
    // automation/embedding contexts) the entire page can stay invisible
    // indefinitely. Force it visible after a short delay regardless, so the
    // reveal animation is a progressive enhancement in the common case, not
    // a single point of failure for whether content shows up at all.
    const fallback = setTimeout(() => setVisible(true), 1200);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", visible && "reveal-in", className)}
    >
      {children}
    </div>
  );
}
