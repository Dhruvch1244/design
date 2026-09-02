import type { Metadata } from "next";
import { Anton, IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "@/components/dsgn/toaster";
import { ConsoleShell } from "@/components/design-console/console-shell";
import { ShowcaseThemeScope } from "@/components/showcase-theme-scope";

// neon-cyberpunk wants a display face bolder/more condensed than Bebas
// Neue — Anton, VOLTGATE's own brand choice, loaded fresh. Body is IBM
// Plex Sans (deliberately quiet, holds up at the 12-13px sizes a dense
// admin table runs at). Mono reuses the site's own already-loaded
// --font-jetbrains (same literal font VOLTGATE's own build loads).
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VOLTGATE — a dsgn showcase",
  description:
    "VOLTGATE is a fictional edge API developer console, built entirely with @dhruvchoudhary/dsgn, showcasing the tool's neon-cyberpunk voice and full component registry.",
};

export default function DesignConsolePage() {
  return (
    <ShowcaseThemeScope
      showcase="voltgate"
      className={`${anton.variable} ${plexSans.variable} min-h-[100dvh] bg-background font-sans text-foreground antialiased [color-scheme:dark]`}
    >
      {/* ConsoleShell mounts its own Backdrop, TooltipProvider and Tabs
          internally — same self-contained shape as Halyard's AppShell. */}
      <ConsoleShell />
      {/* Mounted at this route's own root, not nested inside anything with a
          CSS transform (SiteChrome skips the site's own chrome for /design-*
          entirely), so ToastViewport's position:fixed anchors to the true
          viewport. */}
      <Toaster />
    </ShowcaseThemeScope>
  );
}
