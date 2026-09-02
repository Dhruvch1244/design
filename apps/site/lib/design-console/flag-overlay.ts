/**
 * Staged feature-flag changes, modelled as an overlay over untouched
 * originals.
 *
 * The philosophy's third pillar, applied to the one surface in this console
 * where getting it wrong is genuinely dangerous: a feature flag read by nine
 * services in production. The naive shape — mutate the flag on toggle, then
 * add undo later — breaks the first time an edit has no clean inverse, and
 * "no clean inverse" here means "we no longer know what production was set to
 * before you started clicking."
 *
 * So: FEATURE_FLAGS is never written to. Every toggle appends an entry to an
 * ordered overlay. The view renders original + overlay. Discard is dropping
 * the overlay; undo is popping one entry. Publish is the single, named moment
 * the overlay is applied — and until it happens, closing the tab is trivially
 * correct.
 *
 * No React import: plain data + pure functions, driven from the view.
 */

import type { Environment, FeatureFlag } from "./console";

export interface FlagChange {
  key: string;
  environment: Environment;
  previous: boolean;
  next: boolean;
}

export type FlagOverlay = readonly FlagChange[];

export const EMPTY_OVERLAY: FlagOverlay = [];

/** The effective value of one flag in one environment, original + overlay. */
export function effectiveValue(
  flag: FeatureFlag,
  environment: Environment,
  overlay: FlagOverlay,
): boolean {
  let value = flag.enabled[environment];
  for (const change of overlay) {
    if (change.key === flag.key && change.environment === environment) {
      value = change.next;
    }
  }
  return value;
}

/**
 * Append a toggle. Two deliberate behaviours:
 *   - toggling a flag back to its original value removes its entries rather
 *     than stacking a second one, so "changed my mind" leaves a clean overlay
 *     and the staged-change count tells the truth
 *   - `previous` records the value the user actually saw, which is what an
 *     audit trail needs, not the pristine original
 */
export function stageToggle(
  flag: FeatureFlag,
  environment: Environment,
  next: boolean,
  overlay: FlagOverlay,
): FlagOverlay {
  const previous = effectiveValue(flag, environment, overlay);
  const without = overlay.filter(
    (change) => !(change.key === flag.key && change.environment === environment),
  );
  if (next === flag.enabled[environment]) return without;
  return [...without, { key: flag.key, environment, previous, next }];
}

/** Undo is "stop applying the last entry", not "compute an inverse". */
export function undoLast(overlay: FlagOverlay): FlagOverlay {
  return overlay.slice(0, -1);
}

export function changeCount(overlay: FlagOverlay): number {
  return overlay.length;
}

/**
 * The one place the overlay is applied. Returns a *new* array; the input
 * flags are still untouched afterwards, which is what makes an optimistic
 * publish safe to roll back if the write fails.
 */
export function publish(flags: readonly FeatureFlag[], overlay: FlagOverlay): FeatureFlag[] {
  return flags.map((flag) => {
    const relevant = overlay.filter((change) => change.key === flag.key);
    if (relevant.length === 0) return flag;
    const enabled = { ...flag.enabled };
    for (const change of relevant) enabled[change.environment] = change.next;
    return { ...flag, enabled };
  });
}

/** Human-readable summary of the staged set, for the confirm dialog. */
export function describeChange(change: FlagChange): string {
  return `${change.key} — ${change.environment} ${change.previous ? "on" : "off"} → ${change.next ? "on" : "off"}`;
}
