import type { ReactElement } from "react";

/**
 * Glyph geometry byte-identical across multiple places within this site's
 * own single voice (glass-dark-cyan) — the sibling `shared.tsx` in this same
 * directory does the equivalent thing *across* showcases, each of which
 * intentionally keeps its own stroke width/cap style since that's part of
 * its voice. There's no such cross-voice concern here: every call site below
 * is this one site, so sharing geometry loses nothing.
 *
 * Same convention as `shared.tsx`: these export only the inner
 * `<path>`/`<circle>` children, with no `viewBox`, `stroke`, `strokeWidth`,
 * or `className` opinion — each call site keeps its own wrapper.
 */

/** Magnifier. Nav's desktop + mobile search buttons, SectionSearchButton,
 * ComponentsSidebar's filter input, and the Command + Combobox gallery tiles
 * on /components. */
export const SEARCH_GEOMETRY: ReactElement = (
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </>
);

/** Chevron down. The select, accordion, collapsible, and combobox gallery
 * tiles on /components. */
export const CHEVRON_DOWN_GEOMETRY: ReactElement = <path d="m6 9 6 6 6-6" />;
