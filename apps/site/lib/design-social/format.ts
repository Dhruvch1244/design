/**
 * Pure formatting helpers. No React, no Next, no DOM.
 *
 * Hand-rolled rather than pulling `date-fns`/`numeral`: both problems here
 * are small, stable and fully specified by the two functions below, which is
 * exactly the line the dsgn philosophy draws for reaching into the standard
 * library first (pillar #7 — a dependency's real cost is its update cadence
 * and transitive surface, not its install size).
 */

/**
 * Renders an age in minutes as the compact relative stamp a feed uses
 * ("4m", "2h", "3d", "Nov 2").
 *
 * Takes minutes rather than a Date on purpose: the seed data is authored as
 * relative ages, so rendering it never depends on the wall clock and a
 * server render can never disagree with the client's first paint. A real
 * backend would pass `(Date.now() - createdAt) / 60000` here.
 *
 * Time: O(1). Space: O(1).
 *
 * @param minutes Whole minutes since the item was created.
 * @returns A short human-readable age.
 */
export function relativeTime(minutes: number): string {
  if (minutes < 1) return "now";
  if (minutes < 60) return `${Math.floor(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h`;
  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}d`;
  return `${Math.floor(days / 7)}w`;
}

/**
 * Compacts a count for a reaction chip: 942, 1.2K, 18K, 3.4M.
 *
 * Time: O(1). Space: O(1).
 *
 * @param n A non-negative count.
 * @returns The compacted string. Values under 1000 are returned unchanged.
 */
export function compactCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1000) return String(Math.floor(n));
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.floor(k)}K`;
  }
  const m = n / 1_000_000;
  return `${m < 10 ? m.toFixed(1).replace(/\.0$/, "") : Math.floor(m)}M`;
}

/**
 * Derives avatar initials from a display name, capped at two characters.
 *
 * The showcase ships no image assets, so every `AvatarFallback` in the app
 * reads through this — which also means it must never return an empty
 * string, or the fallback renders as a blank circle.
 *
 * Time: O(n) in the length of the name. Space: O(n).
 *
 * @param name A display name, possibly a single word.
 * @returns One or two uppercase characters, never empty for a non-empty name.
 */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
