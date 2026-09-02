/**
 * Pure formatters. No React, no Next, no component import — same boundary as
 * lib/console.ts, and the reason these live here rather than inline in a view
 * is that every one of them is used by at least two views.
 *
 * Every function takes an explicit `now` rather than reading the clock. A
 * formatter that calls Date.now() internally renders one string on the server
 * and a different one in the browser a few hundred milliseconds later, which
 * is a hydration mismatch that only shows up under load.
 */

const UNITS: Array<[limit: number, divisor: number, suffix: string]> = [
  [60_000, 1_000, "s"],
  [3_600_000, 60_000, "m"],
  [86_400_000, 3_600_000, "h"],
  [2_592_000_000, 86_400_000, "d"],
];

/** "41s ago", "6m ago", "in 3s". Compact by design — this goes in table cells. */
export function relativeTime(at: number, now: number): string {
  const delta = now - at;
  const abs = Math.abs(delta);
  if (abs < 5_000) return delta >= 0 ? "just now" : "in a moment";

  let text = `${Math.floor(abs / 2_592_000_000)}mo`;
  for (const [limit, divisor, suffix] of UNITS) {
    if (abs < limit) {
      text = `${Math.floor(abs / divisor)}${suffix}`;
      break;
    }
  }
  return delta >= 0 ? `${text} ago` : `in ${text}`;
}

/** Absolute UTC timestamp, fixed width so a column of them stays aligned. */
export function absoluteTime(at: number): string {
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`
  );
}

/** Clock only — for the log tail, where the date is the same for every row. */
export function clockTime(at: number): string {
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

export function groupedNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** Sub-second values keep a decimal; anything slower rounds to whole ms. */
export function duration(ms: number): string {
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(ms >= 10_000 ? 1 : 2)}s`;
  return `${Math.round(ms)}ms`;
}

/** The masked form of a key: the public prefix, then fixed-width dots. */
export function maskedKey(prefix: string): string {
  return `${prefix}${"•".repeat(16)}`;
}

export function fullKey(prefix: string, secret: string): string {
  return `${prefix}${secret}`;
}

export type StatusClass = "ok" | "redirect" | "client" | "server" | "pending";

export function statusClass(code: number | null): StatusClass {
  if (code === null) return "pending";
  if (code >= 500) return "server";
  if (code >= 400) return "client";
  if (code >= 300) return "redirect";
  return "ok";
}

/** Signed percentage, always with an explicit sign so "0" reads as flat. */
export function signedPercent(delta: number): string {
  if (delta === 0) return "0.0%";
  return `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)}%`;
}
