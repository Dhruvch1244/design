/**
 * The accent preset, modelled as an external store rather than React state.
 *
 * Embedded-route adaptation: the standalone build keys this off `data-accent`
 * on `<html>`, primed by a pre-paint `<head>` script. This route can't do
 * either — `<html>` already carries the *site's own* `data-accent` (its own
 * cyan/violet/... picker), so writing there would collide with it; and the
 * scoped wrapper div this reads/writes instead doesn't exist yet when a
 * `<head>` script would run, since it's part of the React tree, not static
 * markup. So the attribute lives on `[data-showcase="thrum"]` specifically
 * (a selector unique to this route), and the stored preference is applied via
 * `useApplyStoredAccent` on mount instead of a pre-paint script — one
 * possible frame of the default "aurora" gradient before hydration, not a
 * correctness issue.
 */

"use client";

import { useEffect, useSyncExternalStore } from "react";

export const ACCENTS = [
  {
    id: "aurora",
    label: "Aurora",
    from: "#3ce0f0",
    to: "#a06bff",
  },
  { id: "ember", label: "Ember", from: "#ff5fa2", to: "#ffb14d" },
  { id: "bloom", label: "Bloom", from: "#b06bff", to: "#ff5fa2" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];

export const DEFAULT_ACCENT: AccentId = "aurora";
const STORAGE_KEY = "thrum:accent";
const SCOPE_SELECTOR = '[data-showcase="thrum"]';

function isAccent(value: string | null): value is AccentId {
  return ACCENTS.some((a) => a.id === value);
}

function scopeEl(): Element | null {
  return document.querySelector(SCOPE_SELECTOR);
}

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): AccentId {
  const current = scopeEl()?.getAttribute("data-accent") ?? null;
  return isAccent(current) ? current : DEFAULT_ACCENT;
}

function getServerSnapshot(): AccentId {
  return DEFAULT_ACCENT;
}

/** Reads the active accent preset, re-rendering when it changes. */
export function useAccent(): AccentId {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Switches the accent preset, scoped to this route's own wrapper element. */
export function setAccent(next: AccentId): void {
  scopeEl()?.setAttribute("data-accent", next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* Preference not persisted; the in-session value still applies. */
  }
  listeners.forEach((l) => l());
}

/**
 * Applies a stored accent preference on mount — the embedded-route stand-in
 * for the standalone build's pre-paint bootstrap script. Call once, near the
 * root of this route.
 */
export function useApplyStoredAccent(): void {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isAccent(stored)) setAccent(stored);
    } catch {
      /* No stored preference available; default stands. */
    }
  }, []);
}
