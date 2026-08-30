---
name: dsgn-startup
description: High-saturation gradient accent, oversized confident type, energetic overshoot motion, bold claims in the hero. For product launches, marketing sites, and anything that needs to feel fast-moving and ambitious rather than settled.
---

# Startup

## 1. Identity

The most ambitious-*feeling* of the seven voices — not the loudest in raw
color intensity (that's still neon-cyberpunk), but the one built to make a
first-time visitor feel like they've found something moving fast. Reads as
"we shipped this last week and it already works," the opposite instinct
from corporate's "this has been engineered and reviewed." Appropriate for
landing pages, product launches, and marketing sites where the job is
conversion and momentum, not enterprise trust-building.

## 2. Color logic

- Background: near-black or a very deep saturated tone (deep violet-black,
  not the flagship voice's neutral `--void`) — dark enough for a bright
  accent to pop, warmer/more colorful than the flagship's technical OLED.
- Accent: a bold gradient (two of the flagship voice's real hues — cyan
  into violet, or magenta into warm — not a single flat fill) used
  confidently and often: hero headlines, primary CTAs, stat callouts. Where
  corporate uses one desaturated color sparingly, this voice wants gradient
  accent everywhere the eye should land first.
- High contrast throughout — this voice doesn't do quiet secondary text;
  even muted copy should read clearly at a glance.

## 3. Typography

- Oversized, confident display type for headlines — bigger than the
  flagship voice's already-large headings, tight leading, often mixed
  weight (a thin word next to a bold one) for emphasis within a single
  line. This is the one voice where a headline breaking a "don't make text
  too big" instinct is often correct.
- Body copy stays legible and normal-weight — the size contrast between
  headline and body should be dramatic, not gradual.

## 4. Spacing & density

Punchy, not airy — sections are large and confident (big hero, big stat
row) but content within a section sits close together, creating a "dense
but not cluttered" feel very different from soft-minimal's floating
islands or corporate's grid precision. Whitespace is spent on section-level
breathing room, not evenly distributed everywhere.

## 5. Motion character

Fast and energetic, with real overshoot — spring/bounce easing is
*correct* here, unlike corporate's linear/ease-out-only rule. Hero elements
should feel like they arrive with momentum: a slight overshoot on scale-in,
a quick stagger across a stat row. This is the opposite motion register
from corporate: where that voice wants motion nearly invisible, this voice
wants it noticed, as long as it never blocks interaction.

## 6. Borders & shadows

Glow is a first-class tool here, more than the flagship voice's "sparing,
single accent" use — a hero CTA or headline can carry a real
`shadow-glow`-style effect (see `button.tsx`'s `glow` variant) without it
reading as excessive, because everything else in this voice already signals
"high energy." Borders, where used, can carry a gradient edge rather than a
flat neutral line.

## 7. Workflow facets in this voice

- **Component Builder**: primary CTAs default to the boldest available
  treatment (glow + gradient-leaning accent), not a quiet outline — this is
  the one voice where the flagship's restraint ("reserve glow for the one
  CTA per view") relaxes into "the hero CTA should be unmissable."
- **Page Composer**: front-load the boldest content — a big claim, a real
  number, a confident headline — above the fold; the hero section should do
  more visual work than any other voice's hero.
- **Theming Specialist**: raise `--radius-scale` toward pill shapes for
  buttons/badges (confident, friendly, fast), lean into a two-color
  gradient for the accent treatment rather than a single flat hue.
- **Accessibility Reviewer**: gradient text/fills need contrast checked at
  both ends of the gradient, not just the midpoint — verify the darkest
  point of a gradient-on-dark-background pairing still clears WCAG AA, since
  this voice's confidence can quietly break contrast at one edge of a
  gradient even when it looks fine at a glance.
- **Motion specialist**: use spring/overshoot easing for hero and CTA
  moments specifically; keep it faster and punchier than neon-cyberpunk's
  sustained high-intensity motion — this voice wants quick bursts of
  energy, not continuous intensity.

## 8. Do / Don't

- Do: use a confident two-color gradient accent on hero headlines and
  primary CTAs.
- Do: use spring/overshoot easing for hero-moment motion.
- Do: size headline type dramatically larger than body copy.
- Don't: spread the gradient accent everywhere uniformly — it should mark
  the highest-priority elements, not become wallpaper.
- Don't: use corporate's linear/no-bounce motion rule here — flat, no
  overshoot reads as the wrong voice entirely.

## 9. Pre-output checklist

- [ ] Hero headline is oversized and confident, noticeably larger than this
      voice's own body copy
- [ ] Primary CTA carries a bold gradient/glow treatment, not a quiet outline
- [ ] Motion on hero/CTA moments uses spring or overshoot easing
- [ ] Gradient contrast checked at both ends against WCAG AA, not just the
      midpoint
- [ ] Background is dark/saturated enough for the gradient accent to read
      clearly, not the flagship voice's neutral technical void
- [ ] Section-level whitespace is generous; within-section spacing stays
      punchy and close
