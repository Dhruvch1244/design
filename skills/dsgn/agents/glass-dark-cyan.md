---
name: dsgn-glass-dark-cyan
description: Dark OLED background, cyan accent, backdrop-blur glass panels, Bebas Neue display type — the real, current visual system of the dhruvch1244/design site itself. Default choice for dev-tool/SaaS/technical UI.
---

# Glass / Dark-Cyan

## 1. Identity

This is not an invented archetype — it's an accurate description of
`design.dhruvchoudhary.com`'s own real, shipped visual system. Deep near-OLED
background, a single cyan accent (swappable to violet/magenta/warm via the
same token mechanism), floating translucent glass panels, and condensed
uppercase display type for headings. Reads as technical, precise, and a
little cinematic — appropriate for developer tools, SaaS products, and
anything that wants to feel like infrastructure rather than a consumer app.

## 2. Color logic

- Background: `--void` (`#07080c` dark / `#f7f5f2` light) — never pure `#000`.
- Panels: `--surface` (`#0d0f16` dark / `#ffffff` light), or the translucent
  `--glass`/`--glass-strong` pair for anything meant to float over the
  background rather than sit flush with it.
- One accent, used sparingly: default `--cyan` (`#28e0ec` dark, darkened to
  `#0e8b96` in light mode for contrast). Reserve it for the single primary
  action per view, focus rings, and small highlight details — not large
  fills. A UI that's 40% cyan has lost the accent's meaning.
- Text: `--ink` primary, `--ink-soft` secondary, `--ink-faint` for anything
  truly tertiary (timestamps, disabled state).
- Shadows and glows are always derived from `var(--accent)` via
  `color-mix()`, never a hardcoded color — see `reference/tokens.md`.

## 3. Typography

- Display/headings: `--font-display` (Bebas Neue) — condensed, uppercase,
  wide letter-tracking. Use it for section titles and hero type, never for
  body copy or anything that needs to be read at length.
- Body: `--font-sans` (Hanken Grotesk).
- Meta/code/keyboard hints: `--font-mono` (JetBrains Mono) — used for
  terminal snippets, `⌘K`-style kbd hints, filenames, timestamps.

## 4. Spacing & density

Moderate-to-generous section padding (not maximal whitespace like a soft
editorial layout, but never cramped). Cards get real padding (`p-6`–`p-8`
range), not tight `p-2` boxes. A floating pill nav (detached from the
viewport edge, `rounded-full`, `backdrop-blur-xl`) rather than an edge-glued
sticky bar — see the real `Nav` component's own doc comment: it's a
"floating glass-pill island."

## 5. Motion character

- Every transition: `var(--ease-fluid)` (`cubic-bezier(0.32, 0.72, 0, 1)`),
  300–900ms depending on element weight.
- Scroll-reveal: elements fade up with a slight blur resolving to sharp
  (`opacity + translateY + blur` → `1, 0, 0`), never a static pop-in. Pair
  an `IntersectionObserver` with a ~1.2s timeout fallback and mutate
  visibility via direct `classList`, not React state — see
  `reference/workflow-checklist.md` facet 5 for why this specific detail is
  load-bearing, not a style preference.
- Hover glow: a cursor-following radial gradient confined to its container,
  painted on a sibling layer (see `reference/workflow-checklist.md` facet 5).
- Background chrome: a subtle mesh-gradient wash + a sparse starfield +
  a very low-opacity grain overlay, all `pointer-events-none` and layered
  behind content — ambient, not attention-grabbing.

## 6. Borders & shadows

Thin 1px borders (`--border` → `--rule`), never a thick or double border.
Shadows are soft and ambient (`--shadow-ambient`: an inset highlight +
diffuse drop shadow), plus an optional `--shadow-glow` (ring + accent-colored
glow) reserved for the one emphasized CTA (`variant="glow"` on Button).

## 7. Workflow facets in this voice

- **Component Builder**: default to the registry's `outline`/`ghost`/`soft`
  button variants for most actions; reserve `glow` for exactly one CTA per
  view. Cards get a 1px border + `--shadow-ambient`, not a heavy drop shadow.
- **Page Composer**: hero sections pair large Bebas Neue type on the left
  with a live/interactive proof element on the right (a terminal snippet, a
  live component preview) rather than a static illustration.
- **Theming Specialist**: this *is* the default token set — swapping accent
  presets (cyan/violet/magenta/warm) is free; swapping the whole palette
  away from dark-glass means moving to a different agent instead, not
  fighting this one's assumptions.
- **Accessibility Reviewer**: cyan-on-dark and the darkened cyan-on-light
  variant were chosen specifically to hold AA contrast — don't lighten the
  dark-mode cyan further without rechecking; it was tuned in light mode
  by darkening the hue, not just changing background.
- **Motion specialist**: this voice can afford confident, visible motion
  (fade-up reveals, glow pulses on the emphasized CTA) — restraint here
  is about frequency (not every element needs a hover glow), not intensity.

## 8. Do / Don't

- Do: one accent color per view, generous but not maximal whitespace,
  condensed display type for headings only.
- Do: derive every glow/shadow color from `var(--accent)`.
- Don't: use pure black (`#000000`) — always the warmer, deep near-black
  `--void`.
- Don't: apply `backdrop-blur` to scrolling content — fixed/sticky elements
  only (nav, overlays), per the performance guardrail in
  `reference/workflow-checklist.md`.
- Don't: let more than one element per view use the `glow` treatment.

## 9. Pre-output checklist

- [ ] Background is `--void`, not pure black
- [ ] Exactly one accent-heavy CTA per view (if any)
- [ ] Headings use the display font; body text never does
- [ ] All glows/shadows derive from `var(--accent)`
- [ ] Scroll-reveal (if any) has a timeout fallback and doesn't route through
      React state for the visibility toggle
- [ ] `backdrop-blur` only on fixed/sticky elements
- [ ] Contrast checked in both dark and light variants
