"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export const PALETTES = [
  { id: "cyan", label: "Cyan", swatch: "var(--cyan)" },
  { id: "violet", label: "Violet", swatch: "var(--violet)" },
  { id: "magenta", label: "Magenta", swatch: "var(--magenta)" },
  { id: "warm", label: "Warm", swatch: "var(--warm)" },
  { id: "emerald", label: "Emerald", swatch: "var(--emerald)" },
  { id: "blue", label: "Blue", swatch: "var(--blue)" },
  { id: "rose", label: "Rose", swatch: "var(--rose)" },
] as const;

// Same pattern as theme-toggle.tsx: the data-accent attribute (set
// pre-paint by the inline script in layout.tsx) is the source of truth,
// read via useSyncExternalStore + a MutationObserver rather than copied
// into React state.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-accent"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-accent") ?? "cyan";
}

function getServerSnapshot() {
  return "cyan";
}

export function PalettePicker({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const active = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function select(id: string) {
    document.documentElement.setAttribute("data-accent", id);
    localStorage.setItem("accent", id);
  }

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      style={style}
      role="radiogroup"
      aria-label="Accent color"
    >
      {PALETTES.map((palette) => (
        <button
          key={palette.id}
          type="button"
          role="radio"
          aria-checked={active === palette.id}
          aria-label={palette.label}
          onClick={() => select(palette.id)}
          className={cn(
            "h-4 w-4 rounded-full transition-transform duration-300 ease-fluid",
            "hover:scale-110",
            active === palette.id && "ring-2 ring-offset-2 ring-offset-background",
          )}
          style={{ backgroundColor: palette.swatch, ["--tw-ring-color" as string]: palette.swatch }}
        />
      ))}
    </div>
  );
}
