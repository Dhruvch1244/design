"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export const VOICES = [
  { id: "glass-dark-cyan", label: "Glass / Dark-Cyan" },
  { id: "editorial-warm", label: "Editorial / Warm" },
  { id: "brutalist-mono", label: "Brutalist / Mono" },
  { id: "soft-minimal", label: "Soft / Minimal" },
  { id: "neon-cyberpunk", label: "Neon / Cyberpunk" },
  { id: "corporate", label: "Corporate" },
  { id: "startup", label: "Startup" },
] as const;

// Same pattern as palette-picker.tsx: data-voice (seeded pre-paint by the
// inline script in layout.tsx) is the source of truth, read via
// useSyncExternalStore + a MutationObserver rather than copied into React
// state. No stored/attribute value at all means "glass-dark-cyan", the
// flagship voice — it's the :root baseline and needs no CSS block of its
// own (see globals.css), so there's nothing to default the attribute to.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-voice"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-voice") ?? "glass-dark-cyan";
}

function getServerSnapshot() {
  return "glass-dark-cyan";
}

export function VoicePicker({ className }: { className?: string }) {
  const active = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function select(id: string) {
    if (id === "glass-dark-cyan") {
      document.documentElement.removeAttribute("data-voice");
      localStorage.removeItem("voice");
    } else {
      document.documentElement.setAttribute("data-voice", id);
      localStorage.setItem("voice", id);
    }
  }

  return (
    <select
      value={active}
      onChange={(e) => select(e.target.value)}
      aria-label="Style voice"
      className={cn(
        "w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs",
        "focus:border-accent focus:outline-none",
        className,
      )}
    >
      {VOICES.map((voice) => (
        <option key={voice.id} value={voice.id}>
          {voice.label}
        </option>
      ))}
    </select>
  );
}
