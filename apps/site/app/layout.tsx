import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dsgn — a design philosophy, made usable",
  description:
    "A cross-AI design philosophy extracted from real shipped apps, plus a component registry you install with one command.",
};

const NAV_LINKS = [
  { href: "/philosophy", label: "Philosophy" },
  { href: "/components", label: "Components" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              dsgn
            </Link>
            <nav className="flex gap-6 text-sm text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              ))}
              <a
                href="https://github.com/dhruvch1244/design"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground">
            Built in the open. Every rule in the philosophy names the app it came from.
          </div>
        </footer>
      </body>
    </html>
  );
}
