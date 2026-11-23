---
name: dsgn-arcade-synth
description: World — synthwave purple, pixel display type, chunky offset shadows; content presented as an arcade cabinet (title screen, level select, hi-scores, CONTINUE?). For games, playful portfolios, hackathon and event sites.
---

# Arcade / Synth (world)

## 1. Identity

The site is a cabinet you just walked up to: a title screen with PRESS
START, a PLAYER 1 card, a level select where every entity is a cartridge,
a HI-SCORES table, and a CONTINUE? countdown as the call to action. Loud,
but organized — every element is still a real link to a real page. Read
`reference/worlds.md` first.

## 2. Color logic

- Background: deep synth purple (`#170a35`), surfaces a step lighter
  (`#221050`), with a vertical gradient toward magenta at the bottom.
- Accents: arcade yellow (`#ffe14f`) as primary, magenta (`#ff4fd8`) for
  shadows/outlines, cyan (`#7af7ff`) as secondary. Three accents is the
  ceiling.
- Text: white, with a lavender soft step (`#e3d3ff`).

## 3. Typography

- `--font-display`: a pixel face (Press Start 2P) — headings, buttons,
  labels only, never paragraphs.
- `--font-mono`: a readable bitmap-style mono (VT323) at a larger size for
  stats and meta.
- `--font-sans` stays a clean sans for body copy — pixel fonts at paragraph
  length are unreadable.

## 4. Spacing & density

Grid-first. Cartridges in a two-up grid for featured items, auto-fill for
the full list. Generous gaps (20px+) so the offset shadows don't collide.

## 5. Motion character

Snappy and discrete: `steps()` blinks on PRESS START and CONTINUE, a hard
2-4px press-down on buttons (shadow shrinks as the button moves). Backdrop:
pixel starfield + rolling perspective grid floor + striped sun, speeding up
with scroll. All of it off under reduced motion.

## 6. Borders & shadows

3px solid borders; hard offset shadows with zero blur in magenta
(`4px 4px 0`); square corners on buttons, slightly rounded "cartridge"
shells (14px top, 6px bottom). Screens inside cartridges get scanlines.

## 7. Workflow facets in this voice

- **Component Builder**: Button gets a pixel-font, square, offset-shadow
  treatment; Progress becomes a segmented cell bar.
- **Page Composer**: title screen → player card → level select → scores →
  continue. Each section opens with a `★ HEADING`.
- **Theming Specialist**: radius scale low (~0.3); shadows are hard
  offsets; `--glow-accent` can carry a neon edge.
- **Accessibility Reviewer**: segmented bars need an `aria-label` with the
  real value ("TECH 6 of 8"); blinking text must stop under reduced motion;
  pixel fonts only above ~11px.
- **Motion specialist**: discrete steps, not easing.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | LEVEL SELECT — cartridges labelled `WORLD 1-1…` |
| Entity headline | STAGE name + BOSS (the problem it beat) |
| Metric | `★` win line (the headline stat) + segmented stat bars derived from real fields |
| Profile | PLAYER 1 card: CLASS (role), GUILD (employer · city), lore (summary) |
| Timeline | HI-SCORES table |
| Call to action | CONTINUE? `9` → YES · EMAIL, plus secondary buttons |
| Interaction | ▶ PRESS START scrolls to the level select |

## 9. Copy voice

UPPERCASE for labels and headings, short game nouns (STAGE, BOSS, CLASS,
GUILD). Bosses are the real problem the entity solved ("a 116MB installer",
"the frozen spreadsheet").

## 10. Do / Don't

- Do: compute every bar from a field (stack size, recency).
- Do: keep body copy in a normal sans.
- Don't: invent scores, levels or XP that mean nothing.
- Don't: let three accents become five.

## 11. Pre-output checklist

- [ ] Title, player card, level select, scores and continue all exist
- [ ] Stat bars are derived and labelled for screen readers
- [ ] Pixel type never sets paragraphs
- [ ] Hard offset shadows, no blur
- [ ] Blinks and backdrop stop under reduced motion
