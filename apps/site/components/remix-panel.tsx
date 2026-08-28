"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { PalettePicker } from "@/components/palette-picker";
import { cn } from "@/lib/utils";

const RADIUS_OPTIONS = [
  { id: "0.4", label: "Sharp" },
  { id: "1", label: "Default" },
  { id: "1.6", label: "Round" },
] as const;

// Same useSyncExternalStore pattern as theme-toggle.tsx / palette-picker.tsx
// — a plain useState(lazyInit) reading localStorage would mismatch the
// server-rendered "1" default the instant a visitor has a stored non-default
// value, triggering a hydration error. The THEME_SCRIPT inline script in
// layout.tsx already applies any stored value to the inline style before
// React hydrates, so this only has to read that style back, not localStorage
// directly.
function subscribeRadius(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
  return () => observer.disconnect();
}

function getRadiusSnapshot(): string {
  return document.documentElement.style.getPropertyValue("--radius-scale") || "1";
}

function getRadiusServerSnapshot(): string {
  return "1";
}

/**
 * Site-wide floating trigger, separate from AppearanceMenu (the nav's
 * compact theme+accent control) — this is the bigger, more prominent "remix
 * the whole site live" demo: same accent picker (delegated to
 * PalettePicker, not reimplemented) plus a --radius-scale toggle that
 * reshapes every rounded-{sm,md,lg,xl,2xl,3xl} element at once via the
 * @theme inline re-read in globals.css. rounded-full pills (buttons,
 * badges, avatars) are untouched on purpose — see the --radius-scale
 * comment in globals.css.
 */
export function RemixPanel() {
  const [open, setOpen] = useState(false);
  const radius = useSyncExternalStore(subscribeRadius, getRadiusSnapshot, getRadiusServerSnapshot);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function applyRadius(id: string) {
    // No local setState — the MutationObserver above picks up this style
    // mutation and re-renders via a fresh getRadiusSnapshot() read.
    document.documentElement.style.setProperty("--radius-scale", id);
    localStorage.setItem("radius-scale", id);
  }

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        aria-label={open ? "Close remix panel" : "Remix this site"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-12 items-center gap-2 rounded-full border border-border bg-glass px-4",
          "text-sm font-medium shadow-ambient backdrop-blur-xl transition-all duration-500 ease-fluid",
          "hover:border-accent hover:text-accent",
          open && "border-accent text-accent",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" strokeLinecap="round" />
        </svg>
        Remix
      </button>

      <div
        className={cn(
          "absolute bottom-full right-0 mb-3 w-64 space-y-5 rounded-2xl border border-border bg-glass-strong p-5",
          "backdrop-blur-2xl shadow-ambient transition-all duration-300 ease-fluid",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Accent
          </span>
          <PalettePicker />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Corner radius
          </span>
          <div className="flex gap-1.5" role="radiogroup" aria-label="Corner radius">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={radius === option.id}
                onClick={() => applyRadius(option.id)}
                className={cn(
                  "flex-1 rounded-md border border-border py-1.5 text-xs transition-colors duration-300 ease-fluid",
                  radius === option.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "text-muted-foreground hover:border-accent/50 hover:text-accent",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This is applied to the whole site live, not just this panel.{" "}
          <Link href="/theming" onClick={() => setOpen(false)} className="text-accent hover:underline">
            Export it as CSS →
          </Link>
        </p>
      </div>
    </div>
  );
}
