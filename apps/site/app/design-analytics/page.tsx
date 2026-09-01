import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/dsgn/tooltip";
import { Toaster } from "@/components/dsgn/toaster";
import { AppShell } from "@/components/design-analytics/app-shell";
import { ShowcaseThemeScope } from "@/components/showcase-theme-scope";

// Corporate voice calls for "system-native sans, or a geometric grotesk that
// reads the same" — Geist is that grotesk, and specifically not this site's
// own Hanken/JetBrains pairing, which is Halyard's brand choice to keep
// regardless of the parent site's own fonts. Loaded here rather than the
// root layout since it's the one route that needs it.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Halyard — a dsgn showcase",
  description:
    "Halyard is a fictional product-analytics workspace, built entirely with @dhruvchoudhary/dsgn, showcasing the tool's corporate voice and full component registry.",
};

export default function DesignAnalyticsPage() {
  return (
    <ShowcaseThemeScope
      showcase="halyard"
      className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
    >
      <TooltipProvider delayDuration={200} skipDelayDuration={400}>
        <AppShell />
      </TooltipProvider>
      {/* Mounted at this route's own root, not nested inside anything with a
          CSS transform (this route has none — SiteChrome skips the site's
          own Reveal-wrapped chrome for /design-analytics entirely), so
          ToastViewport's position:fixed anchors to the true viewport. */}
      <Toaster />
    </ShowcaseThemeScope>
  );
}
