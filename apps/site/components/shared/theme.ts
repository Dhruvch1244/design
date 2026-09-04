/**
 * The site's one theme write path.
 *
 * `data-theme` on <html> is the single source of truth — it is set pre-paint
 * by the inline script in app/layout.tsx and read by every showcase's token
 * scope. Three surfaces used to flip it with their own copy of this four-line
 * function (the header toggle, Halyard's shell, Alcove's palette), which is
 * three chances for one of them to write a different localStorage key and
 * leave the toggle button out of sync with the theme it just changed.
 *
 * Deliberately not a hook and deliberately not React state: the attribute is
 * the state, and ThemeToggle subscribes to it with a MutationObserver, so
 * anything that calls this is reflected in the UI without a second store.
 */

export type SiteTheme = "light" | "dark";

/** The theme currently applied to the document. Client-only. */
export function readSiteTheme(): SiteTheme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/** Applies `next` to the document and persists it. Client-only. */
export function setSiteTheme(next: SiteTheme): void {
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

/** Flips the document between light and dark. Client-only. */
export function toggleSiteTheme(): void {
  setSiteTheme(readSiteTheme() === "light" ? "dark" : "light");
}
