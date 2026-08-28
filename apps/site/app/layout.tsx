import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { Mark } from "@/components/brand/mark";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="grain-overlay" />
        <Nav />
        <main className="flex-1 pt-28">{children}</main>
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Mark className="h-4 w-4 text-accent" />
              <span className="font-display text-sm italic">Dhruv Choudhary</span>
              <span className="text-xs text-muted-foreground">
                — built in the open, one shipped decision at a time.
              </span>
            </div>
            <nav className="flex gap-6 text-sm text-muted-foreground">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors duration-300 ease-fluid hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
