import type { Metadata } from "next";
import Link from "next/link";
import { Bebas_Neue, Hanken_Grotesk, Space_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { Mark } from "@/components/brand/mark";
import { CommandPalette } from "@/components/command-palette";
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

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dhruv Choudhary — a design philosophy, made usable",
  description:
    "A cross-AI design philosophy extracted from real shipped apps, plus dsgn: a component registry you install with one command.",
};

const FOOTER_LINKS = [
  { href: "/philosophy", label: "Philosophy" },
  { href: "/components", label: "Components" },
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
  } catch (e) {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${hanken.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="ambient-glow" />
        <Nav />
        <CommandPalette />
        <main className="relative flex-1 pt-28">{children}</main>
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
                  className="transition-colors duration-300 ease-fluid hover:text-accent"
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
      </body>
    </html>
  );
}
