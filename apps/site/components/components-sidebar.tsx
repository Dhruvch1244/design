"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/components/link";
import { cn } from "@/lib/utils";
import { COMPONENTS_DATA } from "@/lib/components-data";
import { SEARCH_GEOMETRY } from "@/components/icons/site";

/**
 * Persistent left-rail nav + live-filtering search, in the spirit of
 * Angular Material's docs site — always visible, not a modal you have to
 * open, and the list itself narrows as you type instead of only jumping to
 * a match. Filters client-side against a list this small (25 items); no
 * need for anything heavier.
 */
export function ComponentsSidebar() {
  const [query, setQuery] = useState("");
  const pathname = usePathname();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMPONENTS_DATA;
    return COMPONENTS_DATA.filter(
      (c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        >
          {SEARCH_GEOMETRY}
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter components..."
          aria-label="Filter components"
          className={cn(
            "w-full rounded-full border border-border bg-card py-2 pl-9 pr-3 text-sm",
            "placeholder:text-muted-foreground focus:border-accent focus:outline-none",
          )}
        />
      </div>

      <nav className="flex max-h-[calc(100vh-14rem)] flex-col gap-0.5 overflow-y-auto text-sm">
        {filtered.length === 0 ? (
          <p className="px-2 py-1.5 text-muted-foreground">No matches.</p>
        ) : (
          filtered.map((c) => {
            const href = `/components/${c.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={c.slug}
                href={href}
                className={cn(
                  "rounded-md px-2 py-1.5 transition-colors duration-200 ease-fluid",
                  active
                    ? "bg-accent/12 font-medium text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {c.title}
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );
}
