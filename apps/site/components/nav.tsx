"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/brand/mark";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/philosophy", label: "Philosophy" },
  { href: "/components", label: "Components" },
];

const GITHUB_URL = "https://github.com/dhruvch1244/design";

/**
 * Floating glass-pill island, detached from the viewport edge (mt-6) rather
 * than glued to the top — see the skill's "Fluid Island Nav" pattern. Below
 * md, the inline links collapse behind a hamburger that morphs into an X and
 * opens a full-screen glass overlay with a staggered link reveal.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="fixed inset-x-0 top-6 z-50 px-4">
        <div
          className={cn(
            "mx-auto flex w-full max-w-xl items-center justify-between gap-4 rounded-full border",
            "border-border bg-card/70 px-4 py-2.5 shadow-ambient backdrop-blur-xl transition-shadow",
            "duration-500 ease-fluid",
          )}
        >
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Mark className="h-5 w-5 text-accent" />
            <span className="font-display text-[15px] italic tracking-tight">
              Dhruv Choudhary
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors duration-300 ease-fluid hover:text-foreground",
                  pathname?.startsWith(link.href) && "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-300 ease-fluid hover:text-foreground"
            >
              GitHub ↗
            </a>
          </nav>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full md:hidden"
          >
            <span
              className={cn(
                "absolute h-px w-4 bg-foreground transition-all duration-500 ease-fluid",
                open ? "translate-y-0 rotate-45" : "-translate-y-[3px] rotate-0",
              )}
            />
            <span
              className={cn(
                "absolute h-px w-4 bg-foreground transition-all duration-500 ease-fluid",
                open ? "translate-y-0 -rotate-45" : "translate-y-[3px] rotate-0",
              )}
            />
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-background/90",
          "backdrop-blur-2xl transition-opacity duration-500 ease-fluid md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {[
          ...NAV_LINKS.map((link) => ({ ...link, external: false })),
          { href: GITHUB_URL, label: "GitHub ↗", external: true },
        ].map(
          (link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
              style={{ transitionDelay: open ? `${100 + i * 75}ms` : "0ms" }}
              className={cn(
                "font-display text-4xl italic transition-all duration-500 ease-fluid",
                open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
              )}
            >
              {link.label}
            </Link>
          ),
        )}
      </div>
    </>
  );
}
