---
name: dsgn-pit-lane
description: World — asphalt black, italic condensed display type, yellow and red, checkered strip; content presented as a race weekend (timing tower, onboard camera, team radio, race control). For motorsport-adjacent products, performance-focused dev tools, and portfolios that sell speed.
---

# Pit Lane (world)

## 1. Identity

A race weekend broadcast: a timing tower down the side, an onboard camera
for whichever car you pick, team radio quotes, race control messages and a
driver card. Fast, slanted, high-contrast. Read `reference/worlds.md`
first. Keep it generic motorsport — no real team, series or driver names,
numbers or liveries.

## 2. Color logic

- Background: asphalt (`#0f1012`), surfaces `#17181c`, tower rows a step
  darker (`#0a0a0c`).
- Accents: signal yellow (`#ffd60a`) primary, racing red (`#ff2a3c`)
  secondary. White for the checkered strip.
- Tyre compounds use their own fixed colors (red/yellow/white/green/blue)
  as data, not decoration.

## 3. Typography

- `--font-display`: an italic condensed heavy face (Barlow Condensed 800
  italic), uppercase.
- `--font-sans`: its text family (Barlow).
- `--font-mono`: gaps, lap counters, labels.

## 4. Spacing & density

Broadcast density: a sticky timing tower (~360px) beside a wide content
column. On phones the tower stacks above, and picking a car scrolls the
onboard view into place.

## 5. Motion character

Directional: horizontal speed streaks in the backdrop that rush when you
scroll; a brief blur-in when the onboard camera switches; skewed buttons
that nudge right on hover. Off under reduced motion.

## 6. Borders & shadows

Hard edges, almost no radius. A 4px colored rule down the tower's left
edge, `inset 4px 0 0` highlight on the active row, a checkered strip across
the top. Buttons `skewX(-10deg)`.

## 7. Workflow facets in this voice

- **Component Builder**: Table becomes the timing tower (buttons for rows
  when pickable); Badge becomes a tyre compound chip; Button is skewed.
- **Page Composer**: driver card → tower + race control/team radio →
  career → "box, box" CTA. Projects page: classification + onboard.
- **Theming Specialist**: radius near `0.1`; no ambient shadows.
- **Accessibility Reviewer**: pickable rows are `<button aria-pressed>`;
  the onboard region is `aria-live="polite"`; tyre chips have a `title`
  with the compound name.
- **Motion specialist**: motion reads as speed — horizontal, short.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | timing tower / classification: POS, NO, DRIVER, TYRE, GAP |
| Entity detail | onboard camera (screenshot) + team radio + setup (stack) + fastest lap (stat) |
| Category | tyre compound from `kind` |
| Entity headline | team radio line |
| Recent activity | race control messages (`LAP 42 · CAR 04 (SELECTA): …`) |
| Profile | driver card with a large outlined number |
| Timeline | career by season |
| Call to action | "Box, box" |

## 9. Copy voice

Radio-clipped and calm under pressure: "Copy, building the set now. Drop in
32 bars." Race control messages in uppercase. Gaps and lap numbers are
labels, never presented as a measurement of the work.

## 10. Do / Don't

- Do: make the tower pickable on the classification page.
- Do: derive tyre compounds from a real field.
- Don't: use real driver numbers, team names, liveries or series branding.
- Don't: put a real-looking time next to a claim it doesn't measure.

## 11. Pre-output checklist

- [ ] Tower + onboard + radio + race control + career + CTA present
- [ ] Row pick updates the onboard and scrolls to it on phones
- [ ] No real-world motorsport trademarks or numbers
- [ ] Skewed buttons stay legible; focus ring visible on dark asphalt
- [ ] Streaks and camera blur stop under reduced motion
