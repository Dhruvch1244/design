# Workflow checklist — the five facets

Every style agent in `agents/` applies these five facets in its own voice.
This file defines what each facet concretely means, grounded in this repo's
real registry, tokens, and motion primitives — not generic advice.

## 1. Component Builder

- Before writing a component from scratch, check
  `reference/component-registry.md` — if it already exists in the registry,
  install it (`npx @dhruvchoudhary/dsgn add <name>`) instead of
  re-implementing it.
- If a component genuinely doesn't exist in the registry, build it the same
  way the registry does: CVA for variant props when there's more than one
  visual variant, a `cn()` merge for `className`, `React.forwardRef` for
  anything that wraps a native focusable element, and Radix primitives
  (not hand-rolled) for anything with real interaction complexity (menus,
  dialogs, comboboxes) — hand-rolling focus trapping, roving tabindex, or
  portal/positioning logic is exactly the kind of "small, well-understood
  problem" pillar #7 does *not* cover; it's a whole subsystem with an
  accessibility spec behind it.
- Style values (colors, radius, shadows, **fonts**) come from the token
  system in `reference/tokens.md` via semantic class names (`bg-accent`,
  `border-border`, `font-display`) — never a raw hex value or a hardcoded
  font stack in a component. Hardcoding breaks the reskin story for every
  consumer of that component.
- Get the display/body/mono split right: `font-display` on headings and
  short emphatic UI text only, `font-sans` for anything meant to be read
  at paragraph length, `font-mono` for code/meta/keyboard hints. Putting
  body copy in the display face (or the reverse) is one of the fastest
  ways to make an otherwise-correct build read as amateur — typography is
  usually the first thing a visitor registers about a page, before color
  or layout.
- **A hard-won, real lesson from this repo**: if the same SVG icon geometry
  ends up repeated ≥2 times within one project's own single voice (the real
  site had a magnifier icon duplicated 6 times and a chevron duplicated 4
  times across its own nav, sidebar, and gallery tiles — see
  `apps/site/components/icons/site.tsx`), extract just the `<path>`/
  `<circle>` children into a local shared constant; leave `viewBox`,
  `stroke`, `strokeWidth`, and `className` at each call site. Do **not**
  build a generic, reusable-across-voices `<Icon>` component from this,
  even though the instinct is the same one — stroke width and cap style are
  part of a voice's own identity (this repo's own showcases deliberately
  draw the "same" glyph differently per voice: 1.5px square-cap vs 1.75px
  round-cap strokes), so a shared cross-voice `<Icon>` would flatten exactly
  the difference those choices exist to express. See
  `apps/site/components/icons/shared.tsx`'s own comment for the fuller
  reasoning.

## 2. Page Composer

- A page is a composition of registry components, not a monolith. Look at
  how the real site's own `/examples` page composes multiple components
  into one realistic pattern (a sign-in card, a settings panel, a pricing
  tier row) — that's the target shape: small, named, real-data-driven
  compositions, not a single giant JSX block.
- Section spacing should breathe — the real site uses generous vertical
  rhythm between sections (see any style agent's specific density rule for
  exact numbers; they differ by voice, but none of the five default to
  cramped stacking).
- Use real, plausible content. No "Lorem ipsum," no "foo/bar/baz," no fake
  stats presented as if real (pillar #5's spirit extends here: don't show
  the person building against this UI something that isn't actually true).

## 3. Theming Specialist

- Confirm which of the seven style agents is active, then set the *values*
  in `reference/tokens.md`'s raw-value layer to match that agent's palette —
  never introduce a new CSS variable name at the semantic or Tailwind-token
  layer to do it. The whole point of the two-layer indirection is that
  component source never needs to change when the brand does.
- Provide both a dark and a light variant of any new palette, and check
  contrast in both — a hue that reads fine on `--void` dark can fail AA
  contrast on a light background without also darkening it (see the real
  cyan → `#0e8b96` shift in `reference/tokens.md`'s light-mode block as a
  worked example).
- If the target project supports multiple accent presets (like this
  repo's `cyan`/`violet`/`magenta`/`warm`), derive shadows and glows from
  `var(--accent)` via `color-mix()`, not a hardcoded color, so they follow
  whichever preset is active automatically.
- Typography is part of the theme, not a separate decision made once and
  forgotten: each style agent's own "Typography" section names the exact
  `--font-display`/`--font-sans`/`--font-mono` choice for that voice (e.g.
  Bebas Neue for glass-dark-cyan's condensed display headings, a serif for
  editorial-warm). Switching voices means switching fonts too, not just
  the color palette — a reskin that keeps the old voice's typeface but
  swaps colors hasn't actually changed voice.

## 4. Accessibility Reviewer

- Every interactive element needs a visible focus state — `focus-visible`
  ring styling, not just a hover state standing in for it. Radix primitives
  give you the right ARIA roles/attributes for free; don't strip them by
  overriding the rendered element type carelessly.
- **A hard-won, real lesson from this repo**: `ring-offset-2` alone isn't
  enough. Tailwind's ring-offset utility silently falls back to a
  hardcoded white `ring-offset-color` unless one is set explicitly — this
  repo's own `badge`, `button`, `input`, `select`, `slider`, `tabs`, and
  `textarea` components shipped with exactly this gap: a bright white halo
  around every focused control on any dark voice (six of the seven), fully
  invisible if you only checked focus states in light mode. Always pair
  `ring-offset-2` with an explicit `ring-offset-background` (or whichever
  semantic background token the surface actually sits on) — never the bare
  Tailwind default. Verify by checking a focused control in dark mode
  specifically, not just confirming a ring renders at all.
- Check real contrast ratios for the chosen palette in both themes, not
  just "it looks readable to me" — this is the specific place a purely
  aesthetic style choice (a muted, low-contrast palette; a saturated neon
  glow over dark) most often silently fails accessibility.
- Respect `prefers-reduced-motion` for anything beyond a subtle opacity
  fade — a style agent with heavy motion (glow pulses, large translate/blur
  reveals) needs an explicit reduced-motion fallback, not just "it's part of
  the brand" as a reason to skip it.

## 5. Motion / Micro-interaction Specialist

- All transitions use a single custom easing curve
  (`--ease-fluid: cubic-bezier(0.32, 0.72, 0, 1)` in the real site, or
  whatever this style agent's equivalent named curve is) — never the CSS
  defaults (`ease`, `linear`, `ease-in-out`).
- Animate only `transform` and `opacity` for anything running on scroll or
  interaction — never `top`/`left`/`width`/`height`, which forces layout
  and drops frames.
- **A hard-won, real lesson from this repo**: don't route a scroll-reveal or
  other visibility-toggling animation's state through React state if you can
  avoid it. The real site's `Reveal` component
  (`apps/site/components/motion/reveal.tsx`) originally used `useState` to
  track "has this element entered the viewport," and it had a genuine,
  reproduced bug — under React 19's concurrent scheduler, a `setState` call
  from an `IntersectionObserver` callback or a `setTimeout` fallback could
  get silently deferred indefinitely under mount-pressure contention (many
  components mounting at once), leaving content permanently stuck invisible
  with no error anywhere. The fix was to remove React state from the
  concern entirely and mutate `classList` directly via a ref inside the
  observer/timeout callbacks. If you build a similar reveal-on-scroll
  pattern, prefer the same direct-DOM approach for the actual visibility
  toggle, and always pair an `IntersectionObserver` with a timeout fallback
  (the real component uses 1.2s) so a missed observer firing doesn't leave
  content invisible forever.
- Scoped hover effects (a glow that follows the cursor, a spotlight) should
  live on their own sibling layer, not as the parent's own background — see
  `apps/site/components/motion/cursor-glow.tsx`: it paints the glow on an
  absolutely-positioned sibling `div`, not the container's own background,
  specifically because an ancestor's `opacity` can't be "undone" for a
  child — if the glow and the content shared a layer, fading the glow out
  would also fade the content.
- **A hard-won, real lesson from this repo**: a continuous, per-event effect
  (a magnetic hover-pull that recalculates on every `pointermove`, not a
  one-time scroll reveal) needs its own explicit `prefers-reduced-motion`
  check — it doesn't get to inherit the "subtle opacity fade" exemption.
  `apps/site/components/motion/magnetic.tsx` shipped for a while without
  one; the fix reads the media query into a ref (not React state, matching
  the ref-driven transform itself) and no-ops the pointer handler when
  reduced motion is requested, so the wrapped button/link stays fully
  functional with zero motion rather than being removed outright.
