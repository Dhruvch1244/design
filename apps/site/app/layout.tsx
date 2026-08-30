import type { Metadata, Viewport } from "next";
import { Link } from "@/components/link";
import { Bebas_Neue, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { Mark } from "@/components/brand/mark";
import { CommandPalette } from "@/components/command-palette";
import { Starfield } from "@/components/starfield";
import { RemixPanel } from "@/components/remix-panel";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

// JetBrains Mono, not Space Mono, despite this site otherwise matching
// dhruvchoudhary.com's exact font stack — confirmed by directly rendering
// both side by side that Space Mono's "@" glyph is a near-flat shape
// almost indistinguishable from "a", which makes the site's own primary
// CTA ("npx @dhruvchoudhary/dsgn ...") read as garbled text. Legibility of
// a scoped npm package name in the hero beats exact brand-font parity on
// the mono face specifically.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dhruv Choudhary — a design philosophy, made usable",
  description:
    "A Claude Code Agent Skill built on a cross-AI design philosophy extracted from real shipped apps, plus dsgn: a component registry you install with one command.",
  metadataBase: new URL("https://design.dhruvchoudhary.com"),
  openGraph: {
    title: "Dhruv Choudhary — a design philosophy, made usable",
    description:
      "A Claude Code Agent Skill built on a cross-AI design philosophy extracted from real shipped apps, plus dsgn: a component registry you install with one command.",
    url: "https://design.dhruvchoudhary.com",
    siteName: "Dhruv Choudhary",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dhruv Choudhary — a design philosophy, made usable",
    description:
      "A Claude Code Agent Skill built on a cross-AI design philosophy extracted from real shipped apps, plus dsgn: a component registry you install with one command.",
  },
};

// Matches dhruvchoudhary.com's own theme-color (#07080c, the void token) so
// the mobile browser chrome tints consistently across both properties
// instead of defaulting to white.
export const viewport: Viewport = {
  themeColor: "#07080c",
  colorScheme: "dark light",
};

const FOOTER_LINKS = [
  { href: "/philosophy", label: "Philosophy" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/components", label: "Components" },
  { href: "/examples", label: "Examples" },
  { href: "/theming", label: "Theming" },
  { href: "/skill", label: "Skill" },
  { href: "/changelog", label: "Changelog" },
  { href: "https://github.com/dhruvch1244/design", label: "GitHub" },
];

// Sets data-theme before first paint (localStorage, falling back to system
// preference) so there's no flash of the wrong theme while React boots —
// same technique dhruvchoudhary.com uses, kept as an inline script rather
// than a client component specifically so it runs before hydration.
const THEME_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    var accent = localStorage.getItem('accent') || 'cyan';
    document.documentElement.setAttribute('data-accent', accent);
    var voice = localStorage.getItem('voice');
    if (voice) document.documentElement.setAttribute('data-voice', voice);
    var radius = localStorage.getItem('radius-scale');
    if (radius) document.documentElement.style.setProperty('--radius-scale', radius);
    var variants = ['a', 'b', 'c', 'd', 'e'];
    var variant = variants[Math.floor(Math.random() * variants.length)];
    document.documentElement.setAttribute('data-glow-variant', variant);
  } catch (e) {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${hanken.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
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
      </body>
    </html>
  );
}
