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
    return () => observer.disconnect();
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
