---
name: dsgn-brutalist-mono
description: Pure black/white, thick borders, monospace-forward everywhere including headings, hard offset shadows, near-zero radius. For developer tools, changelogs, and anything explicitly "raw" or "no-nonsense."
---

# Brutalist / Mono

## 1. Identity

The loudest, most graphic of the seven voices, in the opposite direction from
"soft" — high-contrast, raw, unapologetically rectangular. Reads as a
developer tool built by developers for developers: a changelog, a CLI's
companion site, an internal admin panel that doesn't need to court anyone.

## 2. Color logic

- Background: pure white or pure black (this is the one voice where the
  flagship voice's "never pure black" rule is deliberately broken — the
  starkness is the point).
- Accent: a single loud, saturated color (electric yellow, pure red, or the
  flagship's cyan at full saturation) used as a hard block fill, not a
  subtle highlight.
- No gradients, no color-mix soft shadows — flat, solid fills only.

## 3. Typography

- Monospace-forward *everywhere*, including headings — not just meta/code
  text like the other six voices. Large, bold monospace display type.
- If a second typeface is used at all, it's a heavy grotesk sans for body
  copy — never a serif, never anything with soft curves.

## 4. Spacing & density

Tighter and more graphic than the other voices — content sits close to
thick borders rather than floating in whitespace. Blocky, grid-aligned
layout with visible structural lines (borders as a deliberate design
element, not just a container edge).

## 5. Motion character

Minimal and snappy — near-instant or very short transitions (100–150ms),
deliberately less "fluid" than the flagship voice's cubic-bezier curve.
Motion here should feel mechanical/immediate, not physics-based. Avoid
elaborate scroll-reveal choreography; a hard cut or a very fast fade reads
more on-brand than a slow blur-up.

## 6. Borders & shadows

Thick borders (2–4px, not 1px hairlines) in pure black or the single accent
color. Shadows are hard-edged and offset (e.g. `4px 4px 0 #000`, no blur
radius at all) — never soft/diffuse. Radius scale pushed toward `0` (see
`reference/tokens.md`'s `--radius-scale` — override that one variable rather
than every individual radius token).

## 7. Workflow facets in this voice

- **Component Builder**: Buttons get thick borders and a hard offset shadow
  that disappears (or shifts) on press for tactile feedback — favor the
  registry's `outline` variant restyled with a thick border over the
  softer `soft`/`ghost` variants, which read as too quiet for this voice.
- **Page Composer**: layouts favor bold graphic blocks over floating cards —
  sections can touch or overlap at hard edges rather than being separated
  by soft whitespace.
- **Theming Specialist**: set `--radius-scale` near `0`, swap
  `--shadow-ambient`/`--shadow-glow` for a hard offset shadow recipe with no
  blur, and push background to pure black or pure white.
- **Accessibility Reviewer**: contrast is usually already very high by
  construction in this voice, so the actual review focus shifts to **focus-
  state visibility** (a thick-border aesthetic can accidentally make the
  focus ring indistinguishable from decorative borders — make sure it's
  still visually distinct) and **motion-reduction** (the snappy, high-
  frequency micro-interactions this voice favors are exactly the kind that
  need a `prefers-reduced-motion` fallback, more than the calmer voices do).
- **Motion specialist**: default to *fast*, not smooth. If an interaction
  needs 300ms+ to read clearly in this voice, reconsider the interaction
  rather than slowing down the transition to match the flagship voice's
  fluid curve.

## 8. Do / Don't

- Do: use pure black/white and one loud accent color.
- Do: use hard, offset shadows with zero blur.
- Don't: soften corners — radius should read as near-zero.
- Don't: use a soft, diffuse, or color-mixed shadow anywhere.
- Don't: default to the flagship voice's fluid 300-900ms easing — this
  voice needs a faster, more mechanical motion signature.

## 9. Pre-output checklist

- [ ] Background is pure black or pure white
- [ ] Headings use monospace, not a display sans/serif
- [ ] Borders are thick (2-4px), not hairline
- [ ] Shadows are hard-offset with zero blur, not soft/diffuse
- [ ] Radius scale is near zero throughout
- [ ] Focus rings are visually distinct from decorative borders
- [ ] A `prefers-reduced-motion` fallback exists for the snappier motion
