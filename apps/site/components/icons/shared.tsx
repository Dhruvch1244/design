import type { ReactElement } from "react";

/**
 * Glyph geometry that is *byte-identical* across two or more showcases.
 *
 * Each showcase hand-rolls its own icon set on purpose — the SVG wrapper is
 * where the voice lives (Voltgate draws at stroke 1.5, Halyard at 1.6, Alcove
 * at 1.75 with round caps because soft-minimal wants round and friendly), and
 * a shared `<Icon>` component would flatten exactly the difference those sets
 * exist to express. So this module deliberately shares *geometry only*: the
 * inner `<path>`/`<circle>` children, with no viewBox, stroke, width, cap or
 * className opinion attached.
 *
 * The bar for landing here is strict — the path data must already be
 * character-for-character identical in every set that uses it. Where two
 * showcases draw the "same" glyph differently (Voltgate's chevron is
 * `m6 9 6 6 6-6`, Alcove's is `m6 9.5 6 5.5 6-5.5`, Halyard's is
 * `m7 9.5 5 5 5-5`), that difference is the voice doing its job and is left
 * alone; consolidating it would silently restyle three apps.
 *
 * These are static React elements, not components: they carry no state and no
 * props, so one shared element instance can be rendered inside every wrapper
 * without a re-render or reconciliation cost.
 */

/** Plus / add. Shared by Voltgate, Alcove and Sableroot. */
export const PLUS_GEOMETRY: ReactElement = <path d="M12 5v14M5 12h14" />;

/** Check / confirm. Shared by Voltgate and Alcove. */
export const CHECK_GEOMETRY: ReactElement = <path d="m5 12.5 4.5 4.5L19 7" />;

/** Magnifier. Shared by Voltgate and Halyard. */
export const SEARCH_GEOMETRY: ReactElement = (
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </>
);

/** Three-bar menu. Shared by Alcove and Halyard. */
export const MENU_GEOMETRY: ReactElement = <path d="M4 7h16M4 12h16M4 17h16" />;
