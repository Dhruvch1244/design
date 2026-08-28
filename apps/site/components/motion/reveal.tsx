"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades/slides/un-blurs a section in as it enters the viewport, once.
 * IntersectionObserver-driven (not a scroll listener — see globals.css'
 * .reveal comment) so it costs one callback per element, not one per
 * scroll frame. `delay` staggers a group of siblings without needing a
 * parent orchestrator.
 *
 * Deliberately does NOT use React state to drive the "revealed" class —
 * confirmed by direct testing (not hypothetical) that routing this through
 * setState is itself a reliability problem: on a page mounting ~20 of these
 * at once (a component gallery, say), the observer/timeout callbacks'
 * setState calls could get scheduled at low priority and never actually
 * commit — content stayed invisible indefinitely on a fresh load, and only
 * "unstuck" after an unrelated click forced React to flush a render. A
 * single user interaction shouldn't be required to make a page's own
 * content appear. Toggling the class directly on the DOM node via the ref
 * removes React's scheduler from this path entirely: visibility here is a
 * pure visual concern with no other component depending on it, so there's
 * nothing lost by not modeling it as state.
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

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    function show() {
      node!.classList.add("reveal-in");
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
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

    // Safety net, confirmed necessary by direct testing: IntersectionObserver
    // callbacks are tied to the rendering pipeline, and Chrome suspends them
    // entirely for a backgrounded/hidden tab. Force it visible after a short
    // delay regardless, so the reveal animation is a progressive
    // enhancement, never a single point of failure for whether content
    // shows up at all.
    const fallback = setTimeout(show, 1200);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", className)}
    >
      {children}
    </div>
  );
}
