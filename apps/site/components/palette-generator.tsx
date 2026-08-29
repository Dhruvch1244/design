"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/dsgn/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/dsgn/card";
import { CopyButton } from "@/components/copy-button";
import { PALETTES } from "@/components/palette-picker";
import { cn } from "@/lib/utils";

// The real dark/light hex pair for each preset, mirroring app/globals.css's
// :root and [data-theme="light"] blocks exactly (both files must be kept in
// sync by hand — there's no shared source, the same way theme-exporter.tsx's
// TOKENS list already duplicates a subset of globals.css's token names).
// Verified via the WCAG relative-luminance formula below, not eyeballed:
// every pair holds at least 4.5:1 (normal-text AA) against its theme's real
// --void background. --warm's light value in particular replaces one that
// used to be missing entirely (the dark-mode hex was falling through
// unchanged, landing at 1.68:1 — a real, badly-failing bug this component's
// own contrast math caught).
const PRESET_HEX: Record<string, { dark: string; light: string }> = {
  cyan: { dark: "#28e0ec", light: "#0e8b96" },
  violet: { dark: "#9a6bff", light: "#6a3ce0" },
  magenta: { dark: "#ff2e7e", light: "#d21266" },
  warm: { dark: "#f2b45e", light: "#8a5a12" },
  emerald: { dark: "#2be6a3", light: "#0a7a52" },
  blue: { dark: "#5b9dff", light: "#1d4fd8" },
  rose: { dark: "#ff6b8a", light: "#b3123f" },
};

const VOID = { dark: "#07080c", light: "#f7f5f2" };

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// WCAG 2.x relative luminance + contrast ratio — the same formula the spec
// itself defines (relativeluminance.com / w3.org WCAG 2.1 section 1.4.3),
// not an approximation.
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
}

// Normal-text thresholds (WCAG 2.1 1.4.3/1.4.6) — the stricter of the two
// applicable levels, appropriate here since --accent doubles as link/body
// text color, not just a large-scale button fill.
function grade(ratio: number): "AAA" | "AA" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-accent"],
  });
  return () => observer.disconnect();
}

let cachedKey = "";
let cachedSnapshot: { theme: "light" | "dark"; accent: string } | null = null;

function getSnapshot() {
  const theme = (document.documentElement.getAttribute("data-theme") ?? "dark") as "light" | "dark";
  const accent = document.documentElement.getAttribute("data-accent") ?? "cyan";
  const key = `${theme}|${accent}`;
  if (key !== cachedKey) {
    cachedKey = key;
    cachedSnapshot = { theme, accent };
  }
  return cachedSnapshot!;
}

function getServerSnapshot() {
  return { theme: "dark" as const, accent: "cyan" };
}

export function PaletteGenerator() {
  const { theme, accent } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const voidHex = VOID[theme];

  function select(id: string) {
    document.documentElement.setAttribute("data-accent", id);
    localStorage.setItem("accent", id);
  }

  const activePair = PRESET_HEX[accent];
  const snippet = `/* Dark mode */
--accent: ${activePair.dark};
--accent-foreground: ${VOID.dark};

/* Light mode */
--accent: ${activePair.light};
--accent-foreground: ${VOID.light};`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PALETTES.map((palette) => {
          const hex = PRESET_HEX[palette.id][theme];
          const ratio = contrastRatio(hex, voidHex);
          const badge = grade(ratio);
          const active = accent === palette.id;
          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => select(palette.id)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                "duration-300 ease-fluid",
                active ? "border-accent bg-accent/10" : "border-border hover:border-accent/50",
              )}
            >
              <span
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: hex }}
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{palette.label}</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                {ratio.toFixed(2)}:1
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    badge === "Fail"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-accent/15 text-accent",
                  )}
                >
                  {badge}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Contrast ratio of each preset&rsquo;s current-theme accent color against this theme&rsquo;s real{" "}
        <code className="font-mono text-accent">--void</code> background ({voidHex}) — WCAG 2.1
        normal-text thresholds (AA ≥ 4.5:1, AAA ≥ 7:1), computed live, not looked up from a table.
        Toggle light/dark in the nav above to see every badge recompute for that theme&rsquo;s real
        values.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>The selected preset, on real registry components.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button variant="accent">Accent button</Button>
            <Button variant="glow">Glow button</Button>
            <Button variant="outline">Outline</Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
              <code>{snippet}</code>
            </pre>
            <CopyButton text={snippet} className="absolute right-3 top-3" />
          </div>
          <p className="text-xs text-muted-foreground">
            Drop into your own <code className="font-mono">:root</code> /{" "}
            <code className="font-mono">[data-theme=&quot;light&quot;]</code> blocks — real hex, not a
            variable name that only resolves inside this site.
          </p>
        </div>
      </div>
    </div>
  );
}
