import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { TooltipProvider } from "@/components/dsgn/tooltip";
import { CartProvider } from "@/components/design-shop/cart-provider";
import { SiteHeader } from "@/components/design-shop/site-header";
import { SiteFooter } from "@/components/design-shop/site-footer";
import { ShowcaseThemeScope } from "@/components/showcase-theme-scope";

// Editorial-warm's display face — a high-contrast variable serif, Sableroot's
// own brand choice, loaded fresh here. Its sans role reuses the sitewide
// --font-hanken directly: Sableroot's own body font IS Hanken Grotesk, the
// exact Google Font the root layout already loads, so no second download.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Sableroot — a dsgn showcase",
    template: "%s · Sableroot",
  },
  description:
    "Sableroot is a fictional coffee roastery, built entirely with @dhruvchoudhary/dsgn, showcasing the tool's editorial-warm voice and full component registry.",
};

// This route tree (/design-shop, /design-shop/shop, /design-shop/shop/[slug],
// /design-shop/checkout) mirrors the standalone deployment's real multi-page
// structure — unlike the other three showcases, which are single client-state
// apps, Sableroot genuinely routes. CartProvider/TooltipProvider/SiteHeader/
// SiteFooter live here (not per-page) for the same reason they live in the
// standalone build's own root layout: shared across every page in the tree.
export default function DesignShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShowcaseThemeScope
      showcase="sableroot"
      className={`${fraunces.variable} flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased`}
    >
      <CartProvider>
        <TooltipProvider delayDuration={200}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </TooltipProvider>
      </CartProvider>
    </ShowcaseThemeScope>
  );
}
