"use client";

import { useSyncExternalStore } from "react";
import { setSiteTheme } from "@/components/shared/theme";
import { cn } from "@/lib/utils";

// The data-theme attribute (set pre-paint by the inline script in
// layout.tsx) is the single source of truth for the current theme — this
// reads it via useSyncExternalStore instead of copying it into React state,
// so a MutationObserver keeps the button in sync with whatever writes the
// attribute (this component's own toggle(), or anything else in the future)
// without a setState-in-effect anti-pattern.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme") ?? "dark";
}

function getServerSnapshot() {
  return "dark";
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    // Writes through components/shared/theme.ts so the button, the showcase
    // command palettes and anything else that flips the theme all use one
    // attribute and one storage key.
    setSiteTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft",
        "transition-colors duration-300 ease-fluid hover:text-accent",
        className,
      )}
    >
      {theme === "light" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  );
}
