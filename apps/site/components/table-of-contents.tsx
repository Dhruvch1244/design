"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocEntry } from "@/lib/philosophy";

/**
 * Scrollspy sidebar nav for a single long doc — this is the "site view"
 * piece: instead of one undifferentiated wall of text, each doc becomes a
 * set of jump-to sections with the current one tracked as you scroll.
 *
 * Tracks every heading's intersection with a thin band near the top of the
 * viewport (rootMargin), keeping a set of which headings are currently in
 * that band, and highlights the last one in document order — the correct
 * scrollspy semantic even when a short section makes two headings overlap
 * the band briefly.
 */
export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const headings = toc
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setActiveIds((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            if (entry.isIntersecting) next.add(entry.target.id);
            else next.delete(entry.target.id);
          }
          return next;
        });
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  const activeId = [...toc].reverse().find((entry) => activeIds.has(entry.id))?.id;

  return (
    <div className="space-y-3 border-t border-border pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        On this page
      </p>
      <nav className="flex flex-col gap-2 text-sm">
        {toc.map((entry) => (
          <a
            key={entry.id}
            href={`#${entry.id}`}
            className={cn(
              "transition-colors duration-300 ease-fluid",
              entry.level === 3 && "pl-3 text-[13px]",
              activeId === entry.id ? "text-accent" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {entry.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
