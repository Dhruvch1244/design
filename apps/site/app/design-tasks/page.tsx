import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { AppShell } from "@/components/design-tasks/app-shell";
import { ShowcaseThemeScope } from "@/components/showcase-theme-scope";

// Soft-minimal voice calls for "a bold geometric sans, the same family
// lighter for body" — Figtree, Alcove's own brand choice, loaded fresh here.
// Its mono role reuses the site's own already-loaded --font-jetbrains
// (identical font to what the standalone deployment loads) rather than
// downloading JetBrains Mono a second time.
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Alcove — a dsgn showcase",
  description:
    "Alcove is a fictional planning tool, built entirely with @dhruvchoudhary/dsgn, showcasing the tool's soft-minimal voice and full component registry.",
};

export default function DesignTasksPage() {
  return (
    <ShowcaseThemeScope
      showcase="alcove"
      className={`${figtree.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
    >
      {/* AppShell wraps itself in its own TooltipProvider; Alcove has no
          Toaster usage, so none is mounted here. */}
      <AppShell />
    </ShowcaseThemeScope>
  );
}
