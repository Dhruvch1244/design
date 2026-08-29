---
name: dsgn-neon-cyberpunk
description: Near-black background with saturated multi-color neon glow, tight bold display type, high-intensity motion. For gaming, music, and entertainment products, or anything explicitly "cyberpunk," "neon," or "loud."
---

# Neon / Cyberpunk

## 1. Identity

The most intense of the five voices — takes the flagship voice's single-cyan
glow-on-dark idea and turns the intensity up past what a professional
SaaS/dev-tool product would want, deliberately. Appropriate for gaming,
music, live-event, and entertainment contexts where "loud" is the correct
answer, not a mistake.

## 2. Color logic

- Background: near-black, slightly cooler/bluer than the flagship voice's
  `--void`.
- Accent: *multiple* saturated neon hues used simultaneously and layered —
  where the other four voices insist on one accent color, this is the one
  voice where combining cyan + magenta + violet (the same three hues already
  present in this repo's real token set, just used together instead of one
  at a time) is correct, via layered glows and gradient edges rather than
  large flat fills.
- Avoid muddy combinations — layer glows with real transparency/blur so
  colors blend at the edges rather than producing a flat, muddy mixed hue
  where they overlap.

## 3. Typography

- Display/headings: tight tracking, bold weight, high-contrast against the
  dark background — condensed like the flagship voice's Bebas Neue, but
  bolder and often combined with a neon text-shadow/glow effect on key
  headlines (used sparingly — glowing text on every heading reads as
  noisy, reserve it for the single most important headline per view).
- Body/meta: a clean sans or mono, kept quiet so it doesn't compete with the
  loud display type and glow effects.

## 4. Spacing & density

Denser and more layered than the flagship voice — this voice can support
overlapping elements, diagonal accents, and grid/scanline texture details
that the calmer voices should avoid.

## 5. Motion character

The highest-intensity motion of the five — glow pulses, color-shifting
accents, more elaborate scroll choreography are all in-bounds here. Still
built on the same real-world constraints as every other voice though:
animate `transform`/`opacity` only, and — because this voice's motion is the
most likely of the five to be genuinely uncomfortable for motion-sensitive
users — a `prefers-reduced-motion` fallback isn't optional polish here, it's
required.

## 6. Borders & shadows

Glow is the primary visual language, more than actual borders. Layer
multiple `color-mix()`-derived glows (see `reference/tokens.md`'s shadow
recipe pattern) at different colors and blur radii rather than a single flat
shadow. Thin borders where used should themselves carry a subtle glow rather
than being a plain flat line.

## 7. Workflow facets in this voice

- **Component Builder**: the registry's `glow` Button variant is the
  default here, not the exception reserved for one CTA — but vary which
  accent color the glow uses per section so the whole page doesn't read as
  monochrome-neon.
- **Page Composer**: layouts can be more visually dense and layered than
  the other four voices — overlapping glow elements, diagonal section
  breaks, and grid/scanline background texture are all appropriate here in
  a way they wouldn't be for the calmer voices.
- **Theming Specialist**: activate multiple accent hues simultaneously
  (unusual for this token system, which is built around one active
  `data-accent` at a time) by layering *additional* glow elements with
  explicit colors rather than trying to make the single `--accent` variable
  hold more than one hue at once — keep the semantic `--accent` token
  pointing at one primary hue for component consistency, and treat the
  extra neon colors as page-level decorative accents layered on top.
- **Accessibility Reviewer**: this voice's biggest a11y risk is
  motion-intensity, not contrast (dark background + saturated glow usually
  reads with plenty of contrast by construction) — prioritize the
  `prefers-reduced-motion` fallback above all else, and double-check that
  glow effects never fully obscure text at any point in an animation cycle.
- **Motion specialist**: this is the one voice where "more" motion is
  correct by default — but every animated effect still needs the reduced-
  motion fallback; intensity is a stylistic choice, accessibility isn't.

## 8. Do / Don't

- Do: layer 2-3 neon glow colors with real blur/transparency rather than
  flattening them into one mixed hue.
- Do: provide a genuinely reduced-motion fallback for every glow/pulse
  effect — treat this as required, not optional, given the intensity here.
- Don't: use flat, unblurred saturated fills as large background areas —
  the glow-layered look is the point, a solid neon-colored panel is not.
- Don't: apply a heavy glow effect to every heading on a page — reserve it
  for the single most important one per view.

## 9. Pre-output checklist

- [ ] Multiple accent hues are layered as glow, not flattened into one
      muddy mixed color
- [ ] Only the single most important headline per view gets a glow/shadow
      text effect
- [ ] Headings use tight-tracked, bold, condensed display type — bolder
      than the flagship voice's Bebas Neue, never a plain sans/serif
- [ ] Every pulsing/glowing animation has a `prefers-reduced-motion`
      fallback
- [ ] Glow effects never fully obscure text at any point in their cycle
- [ ] Semantic `--accent` token still points to one primary hue for
      component-level consistency
