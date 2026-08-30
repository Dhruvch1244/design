"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PalettePicker } from "@/components/palette-picker";
import { VoicePicker } from "@/components/voice-picker";
import { cn } from "@/lib/utils";

/**
 * Consolidates the theme toggle, accent palette picker, and voice picker
 * behind one trigger icon, so the nav pill carries one item instead of
 * several. All three are still one click away, just not permanently
 * occupying pill real estate. Closes on outside click or Escape.
 */
export function AppearanceMenu() {
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Appearance settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground",
          "transition-colors duration-300 ease-fluid hover:text-accent",
          open && "text-accent",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="M12 3v2M12 19v2M5 12H3M21 12h-2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4.5" />
        </svg>
      </button>

      <div
        className={cn(
          "absolute right-0 top-full mt-3 w-56 space-y-4 rounded-2xl border border-border bg-glass-strong p-4",
          "backdrop-blur-2xl shadow-ambient transition-all duration-300 ease-fluid",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Theme
          </span>
          <ThemeToggle />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Accent
          </span>
          <PalettePicker className="flex-wrap" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Voice
          </span>
          <VoicePicker />
        </div>
      </div>
    </div>
  );
}
