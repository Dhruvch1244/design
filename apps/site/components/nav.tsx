"use client";

import { useState } from "react";
import { Link } from "@/components/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/brand/mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { PalettePicker } from "@/components/palette-picker";
import { AppearanceMenu } from "@/components/appearance-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/philosophy", label: "Philosophy" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/components", label: "Components" },
  { href: "/examples", label: "Examples" },
  { href: "/theming", label: "Theming" },
  { href: "/best-practices", label: "Best Practices" },
];

// Rendered as a filled accent pill, not a plain text link — the Agent Skill
// is the site's top promoted feature, so its nav entry carries real visual
// weight instead of blending into the rest of the list.
const SKILL_LINK = { href: "/skill", label: "Skill" };

const GITHUB_URL = "https://github.com/dhruvch1244/design";

/**
 * Floating glass-pill island. Below md, the inline links collapse behind a
 * hamburger that morphs into an X and opens a full-screen glass overlay
 * with a staggered link reveal. The search icon dispatches "cmdk:open" —
 * see components/command-palette.tsx, which owns the actual palette state
 * so this component doesn't need to know it exists beyond firing the event.
 *
 * The pill carries the logomark only, not a wordmark — "Dhruv Choudhary"
 * at nav width wrapped to two lines and broke the pill's shape (a real
 * reported bug, not a style preference); the name still appears in the
 * footer and page title. Theme + accent color are behind one Appearance
 * trigger (components/appearance-menu.tsx) instead of five separate
 * controls living in the pill permanently.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="fixed inset-x-0 top-6 z-50 px-4">
        <div
          className={cn(
            "mx-auto flex w-full max-w-4xl items-center justify-between gap-3 rounded-full border",
            "border-border bg-glass px-4 py-2.5 shadow-ambient backdrop-blur-xl transition-shadow",
            "duration-500 ease-fluid",
          )}
        >
          <Link href="/" aria-label="Home" onClick={() => setOpen(false)} className="-m-1.5 p-1.5">
            <Mark className="h-6 w-6 text-accent" />
          </Link>

          <nav className="hidden items-center gap-4 text-sm whitespace-nowrap text-muted-foreground md:flex">
            <Link
              href={SKILL_LINK.href}
              className={cn(
                "rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground",
                "transition-transform duration-300 ease-fluid hover:scale-105",
              )}
            >
              Skill
            </Link>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors duration-300 ease-fluid hover:text-accent",
                  pathname?.startsWith(link.href) && "text-accent",
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-300 ease-fluid hover:text-accent"
            >
              GitHub ↗
            </a>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Open command palette"
              onClick={() => window.dispatchEvent(new CustomEvent("cmdk:open"))}
              className="hidden h-8 items-center gap-1.5 rounded-full border border-border px-2.5 text-xs text-muted-foreground transition-colors duration-300 ease-fluid hover:border-accent hover:text-accent md:flex"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" />
              </svg>
              <kbd className="font-mono text-[10px]">⌘K</kbd>
            </button>
            <AppearanceMenu />
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
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-background/95",
          "backdrop-blur-2xl transition-opacity duration-500 ease-fluid md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {[
          { ...SKILL_LINK, external: false, featured: true },
          ...NAV_LINKS.map((link) => ({ ...link, external: false, featured: false })),
          { href: GITHUB_URL, label: "GitHub ↗", external: true, featured: false },
        ].map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
            style={{ transitionDelay: open ? `${100 + i * 75}ms` : "0ms" }}
            className={cn(
              "font-display text-4xl tracking-wide transition-all duration-500 ease-fluid",
              link.featured && "text-accent",
              open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
            )}
          >
            {link.label}
          </Link>
        ))}
        <div
          className={cn(
            "mt-8 flex items-center gap-6 transition-all duration-500 ease-fluid",
            open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
          )}
          style={{ transitionDelay: open ? "325ms" : "0ms" }}
        >
          <button
            type="button"
            aria-label="Open command palette"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("cmdk:open"));
            }}
            className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground transition-colors duration-300 ease-fluid hover:border-accent hover:text-accent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            Search
          </button>
          <ThemeToggle />
          <PalettePicker />
        </div>
      </div>
    </>
  );
}
