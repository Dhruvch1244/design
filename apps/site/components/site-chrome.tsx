"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/components/link";
import { Nav } from "@/components/nav";
import { Mark } from "@/components/brand/mark";
import { CommandPalette } from "@/components/command-palette";
import { Starfield } from "@/components/starfield";
import { RemixPanel } from "@/components/remix-panel";

const FOOTER_LINKS = [
  { href: "/philosophy", label: "Philosophy" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/components", label: "Components" },
  { href: "/examples", label: "Examples" },
  { href: "/theming", label: "Theming" },
  { href: "/design-analytics", label: "Showcase" },
  { href: "/skill", label: "Skill" },
  { href: "/changelog", label: "Changelog" },
  { href: "https://github.com/dhruvch1244/design", label: "GitHub" },
];

// /design-analytics is a full standalone app shell (its own nav, its own
// command palette, its own theme), not a page of this site — the site's own
// Nav/Starfield/⌘K palette/footer would visually collide with it (two navs,
// two command palettes both listening for the same shortcut) rather than
// frame it. Next.js applies one root layout to every route with no built-in
// per-route opt-out short of a second root layout (a much larger routing
// restructure for one page), so this reads the pathname client-side instead
// and skips the site chrome for that one route while every other route
// renders exactly as before.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandaloneShowcase = pathname?.startsWith("/design-analytics");

  if (isStandaloneShowcase) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-transform duration-300 ease-fluid focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="mesh-gradient" />
      <Starfield />
      <div className="grain-overlay" />
      <Nav />
      <CommandPalette />
      <main id="main-content" className="relative flex-1 pt-28">
        {children}
      </main>
      <footer className="relative border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Mark className="h-4 w-4 text-accent" />
            <span className="font-display text-lg tracking-wide">DHRUV CHOUDHARY</span>
            <span className="text-xs text-muted-foreground">
              — built in the open, one shipped decision at a time.
            </span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.href === "/skill"
                    ? "font-semibold text-accent transition-colors duration-300 ease-fluid hover:text-accent/80"
                    : "transition-colors duration-300 ease-fluid hover:text-accent"
                }
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://dhruvchoudhary.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-300 ease-fluid hover:text-accent"
            >
              Main portfolio ↗
            </a>
          </nav>
        </div>
      </footer>
      <RemixPanel />
    </>
  );
}
