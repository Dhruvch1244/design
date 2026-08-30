"use client";

import { useSyncExternalStore } from "react";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

const TOKENS = [
  { name: "--background", role: "Page background" },
  { name: "--foreground", role: "Default text color" },
  { name: "--card", role: "Card / Frame surface background" },
  { name: "--primary", role: "Primary button fill" },
  { name: "--secondary", role: "Secondary button / muted surface fill" },
  { name: "--accent", role: "The one brand color" },
  { name: "--muted", role: "Low-emphasis fill" },
  { name: "--destructive", role: "Destructive button fill" },
  { name: "--border", role: "Every component's border color" },
] as const;

// Browsers only resolve a custom property to a color at paint time (many of
// this site's tokens are color-mix() expressions or var()-chains, not
// literal hex), and <input type="color"> only accepts #rrggbb. Bouncing the
// computed value through a throwaway element's .color and reading back
// getComputedStyle's normalized "rgb(r, g, b)" is the standard way to force
// that resolution without hand-writing a CSS color parser.
function toHex(computed: string): string {
  const probe = document.createElement("div");
  probe.style.color = computed;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const nums = rgb.match(/[\d.]+/g);
  if (!nums) return "#000000";
  const [r, g, b] = nums.map(Number);
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0"))
      .join("")
  );
}

// Same useSyncExternalStore pattern as theme-toggle.tsx / palette-picker.tsx
// — the DOM (not React state) is the source of truth, so a plain useState
// read on mount would mismatch the server-rendered HTML (React error #418)
// the instant a visitor's stored theme/accent differs from the SSR default.
// getSnapshot caches its result and only computes a new object when the
// underlying computed values actually changed, which useSyncExternalStore
// requires for referential stability.
let cachedKey = "";
let cachedSnapshot: Record<string, string> | null = null;

function getSnapshot(): Record<string, string> {
  const styles = getComputedStyle(document.documentElement);
  const key = TOKENS.map((t) => styles.getPropertyValue(t.name)).join("|");
  if (key !== cachedKey) {
    cachedKey = key;
    cachedSnapshot = Object.fromEntries(
      TOKENS.map((t) => [t.name, toHex(styles.getPropertyValue(t.name).trim())]),
    );
  }
  return cachedSnapshot!;
}

// Mirrors this site's actual :root dark-theme defaults (globals.css) rather
// than an arbitrary placeholder — visitors on the default theme see zero
// flash on hydration; only a stored light theme or non-default accent
// causes the brief, harmless correction every useSyncExternalStore read
// here already accepts.
function getServerSnapshot(): Record<string, string> {
  return {
    "--background": "#07080c",
    "--foreground": "#f2f4f8",
    "--card": "#0d0f16",
    "--primary": "#f2f4f8",
    "--secondary": "#151822",
    "--accent": "#28e0ec",
    "--muted": "#12141c",
    "--destructive": "#ff5470",
    "--border": "#1d2130",
  };
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-accent", "style"],
  });
  return () => observer.disconnect();
}

export function ThemeExporter() {
  const values = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setToken(name: string, hex: string) {
    // No local setState — the MutationObserver above picks up this style
    // mutation and re-renders via a fresh getSnapshot() read.
    document.documentElement.style.setProperty(name, hex);
  }

  function reset() {
    for (const token of TOKENS) document.documentElement.style.removeProperty(token.name);
  }

  const rootSnippet = `:root {\n${TOKENS.map((t) => `  ${t.name}: ${values[t.name]};`).join("\n")}\n}`;
  const themeSnippet = `@theme inline {\n${TOKENS.map(
    (t) => `  --color-${t.name.slice(2)}: var(${t.name});`,
  ).join("\n")}\n  /* ...same pattern for the remaining 7 of the site's 16 tokens */\n}`;
  const fullSnippet = `${rootSnippet}\n\n${themeSnippet}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOKENS.map((token) => (
          <label
            key={token.name}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors",
              "duration-300 ease-fluid hover:border-accent/50",
            )}
          >
            <input
              type="color"
              value={values[token.name]}
              onChange={(e) => setToken(token.name, e.target.value)}
              className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-border bg-transparent p-0"
              aria-label={`${token.name} color`}
            />
            <span className="min-w-0 flex-1">
              <code className="block truncate font-mono text-xs text-accent">{token.name}</code>
              <span className="block truncate text-xs text-muted-foreground">{token.role}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Every color on this page just changed live — this is the same <code className="font-mono">@theme inline</code>{" "}
          re-read that makes the 16 tokens work in your own project.
        </p>
        <button
          type="button"
          onClick={reset}
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-300 ease-fluid hover:border-accent hover:text-accent"
        >
          Reset
        </button>
      </div>

      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
          <code>{fullSnippet}</code>
        </pre>
        <CopyButton text={fullSnippet} className="absolute right-3 top-3" />
      </div>
    </div>
  );
}
