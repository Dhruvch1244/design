"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Defers mounting children until the wrapper scrolls into view (or a
 * fallback timeout, for the same backgrounded-tab reason as
 * components/motion/reveal.tsx). Needed specifically for cmdk-based demos
 * sitting well below the fold: cmdk auto-selects its first item on mount
 * and calls scrollIntoView({block:"nearest"}) on it. That's a no-op for an
 * already-visible Command, but for one mounted off-screen it cascades into
 * the whole page scrolling itself down on load — confirmed by tracing
 * scrollIntoView calls against the production build, not a guess. `minHeight`
 * keeps the collapse from shifting everything below it before mount.
 */
export function LazyMount({
  children,
  className,
  minHeight,
}: {
  children: React.ReactNode;
  className?: string;
  minHeight: number;
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
      { threshold: 0, rootMargin: "200px 0px" },
    );
    observer.observe(node);

    const fallback = setTimeout(() => setVisible(true), 1200);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} className={cn(className)} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
