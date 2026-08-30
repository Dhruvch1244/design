---
name: dsgn-soft-minimal
description: Silver-grey/white background, massive whitespace, ultra-diffused ambient shadows, calm micro-motion. For consumer, health, and wellness products, or anything explicitly "calm," "minimal," or "airy."
---

# Soft / Minimal

## 1. Identity

The calmest of the seven voices — closer to a wellness or consumer-health app
than a developer tool. Nothing shouts; components feel like they're floating
just above the background rather than sitting in a hard-bordered container.
The risk profile here is different from the other six voices: the biggest
failure mode isn't visual clutter, it's *accessibility drifting quietly*
because everything is intentionally low-contrast and soft.

## 2. Color logic

- Background: silver-grey or true white, no warmth (unlike the editorial
  voice's cream) and no darkness (unlike the flagship's OLED voice).
- Accent: a single muted pastel — used even more sparingly than the
  editorial voice's sage/espresso, often just as a small highlight or an
  icon tint rather than a fill.
- Text: dark grey rather than black for primary text (softens the overall
  contrast profile slightly, but see the accessibility note below — this
  softening has a real limit).
- No gradients, no saturated fills anywhere.

## 3. Typography

- Bold, geometric sans for headings — large and confident, but not
  condensed/display like the flagship voice's Bebas Neue. Think "big, round,
  friendly," not "tall and technical."
- Body: the same geometric sans family at a lighter weight, generous
  line-height.

## 4. Spacing & density

The airiest of the seven voices alongside editorial-warm, but structured
differently — favors floating, well-separated component "islands" over
editorial's dense text columns. Generous padding inside every component,
not just between sections.

## 5. Motion character

Gentle and slow. Micro-interactions (hover states, toggles) use soft,
low-amplitude movement — nothing snaps or pulses. This is the opposite
motion register from brutalist-mono: where that voice wants instant/
mechanical, this voice wants unhurried and continuous-feeling.

## 6. Borders & shadows

No visible borders at all where possible — components are separated by
extremely soft, highly diffused ambient shadows instead of a border line.
This is the single most distinctive trait of this voice: shadow does the job
borders do elsewhere. Shadow opacity should be very low (single digits) and
blur radius large, so the effect reads as "floating," not "framed."

## 7. Workflow facets in this voice

- **Component Builder**: Cards drop borders entirely in favor of a soft
  ambient shadow for separation. Buttons favor fully rounded (`rounded-full`)
  shapes with soft fills over the flagship voice's sharper `rounded-lg`
  rectangular buttons.
- **Page Composer**: layouts favor floating, well-spaced component islands
  rather than dense grids — err toward fewer things per view, more breathing
  room around each.
- **Theming Specialist**: raise `--radius-scale` toward its upper end (fully
  rounded pill shapes read as more "soft" than sharp rectangles), replace
  border-based separation with the ambient-shadow recipe, keep the accent
  genuinely muted (a saturated accent breaks this voice's calm register
  immediately).
- **Accessibility Reviewer**: this is one of the voices where contrast
  checking matters most (alongside corporate's subtle-elevation cues and
  startup's gradient contrast), precisely because everything here is
  intentionally soft and low-contrast by design — actively verify every
  text/background
  and icon/background pairing against WCAG AA, don't rely on "it looks
  readable." A muted pastel accent on a light grey background is a common
  place this voice fails contrast silently if not checked.
- **Motion specialist**: keep amplitude low across the board — even the
  "emphasized" motion in this voice (e.g. a successful-save confirmation)
  should be gentle relative to the other six voices' equivalents.

## 8. Do / Don't

- Do: use soft, diffused ambient shadows instead of borders for separation.
- Do: check contrast explicitly and often — this voice's calm aesthetic
  carries real a11y risk.
- Don't: add a visible hard border anywhere it can be avoided.
- Don't: use a saturated or high-chroma accent color.
- Don't: use fast/snappy motion — everything here should feel unhurried.

## 9. Pre-output checklist

- [ ] Background is silver-grey/white, no warmth or darkness
- [ ] Headings use a bold geometric sans, not the condensed display face
      other voices use — "big, round, friendly," not "tall and technical"
- [ ] Separation between elements uses soft shadow, not hard borders
- [ ] Accent color is muted, used only as a small highlight
- [ ] Every text/background and icon/background pairing checked against
      WCAG AA — don't assume, verify
- [ ] Motion amplitude is low and unhurried throughout
- [ ] Buttons/cards lean toward fully rounded rather than sharp corners
