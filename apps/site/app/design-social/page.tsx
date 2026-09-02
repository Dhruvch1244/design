import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/dsgn/tooltip";
import { Toaster } from "@/components/dsgn/toaster";
import { AppShell } from "@/components/design-social/app-shell";
import { AccentBootstrap } from "@/components/design-social/accent-bootstrap";
import { ShowcaseThemeScope } from "@/components/showcase-theme-scope";

// Startup voice wants a real weight axis for "a thin word next to a bold one
// in the same headline" — Bricolage Grotesque (200-800), Thrum's own brand
// choice, loaded fresh. Its mono role reuses the site's own already-loaded
// --font-jetbrains (same literal font Thrum's own build loads).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "500", "700", "800"],
});
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Thrum — a dsgn showcase",
  description:
    "Thrum is a fictional community feed app, built entirely with @dhruvchoudhary/dsgn, showcasing the tool's startup voice and full component registry.",
};

export default function DesignSocialPage() {
  return (
    <ShowcaseThemeScope
      showcase="thrum"
      className={`${bricolage.variable} ${jakarta.variable} min-h-[100dvh] bg-background font-sans text-foreground antialiased`}
    >
      <AccentBootstrap />
      <div className="aurora" aria-hidden="true" />
      <TooltipProvider delayDuration={200}>
        <AppShell />
      </TooltipProvider>
      {/* Mounted at this route's own root, not nested inside anything with a
          CSS transform (this route has none — SiteChrome skips the site's
          own chrome for /design-* entirely), so ToastViewport's
          position:fixed anchors to the true viewport. */}
      <Toaster />
    </ShowcaseThemeScope>
  );
}
