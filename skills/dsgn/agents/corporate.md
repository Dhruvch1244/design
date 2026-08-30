---
name: dsgn-corporate
description: Near-white/near-black neutral background, one restrained accent, generous whitespace, near-invisible shadows, system-native sans type. Apple/Google/Next.js-inspired — for enterprise SaaS, developer platforms, and anything that needs to read as high-craft and trustworthy rather than experimental.
---

# Corporate

## 1. Identity

The most restrained of the seven voices — takes cues from Apple's marketing
pages, Google's Material 3 surfaces, and Next.js's own docs site: confident
through restraint, not through loudness. Nothing here competes with the
content for attention. Reads as high-craft, considered, and safe to put in
front of an enterprise buyer — the opposite instinct from neon-cyberpunk's
"loud is correct," but arrived at deliberately, not from a lack of ideas.

## 2. Color logic

- Background: true near-white (`#FAFAFA`–`#FFFFFF`) in light mode, true
  near-black (`#0A0A0B`–`#111113`) in dark mode — neutral, not warm like
  editorial-warm's cream and not cool-tinted like neon-cyberpunk's void.
- Accent: exactly one, desaturated relative to the flagship voice's cyan —
  a muted blue or near-black is the default instinct, used sparingly and
  almost never as a large fill. Most of the interface should be neutral
  grayscale; the accent marks the one action per view that matters.
- Borders over shadows for separation where possible — a 1px neutral-gray
  hairline reads as more "engineered" than a soft shadow does.
- No gradients, no glow, no glass/backdrop-blur panels — those all read as
  "consumer/marketing" rather than "enterprise tool."

## 3. Typography

- System-native sans (the OS's own UI font stack, or a geometric grotesk
  that reads the same) for both headings and body — no condensed display
  face like the flagship voice's Bebas Neue. Headings are large through
  size and weight, not through stretching or all-caps.
- Tight, controlled letter-spacing — slightly negative tracking on large
  headings is correct here (the opposite of the flagship voice's wide
  uppercase tracking); body copy stays at normal tracking for readability.
- Fewer weights in play than other voices — regular and semibold cover most
  of the interface; reserve bold for true emphasis, not decoration.

## 4. Spacing & density

Generous but not airy in soft-minimal's floating-island sense — spacing
here reads as *precision*, not calm. Consistent, grid-aligned padding;
components line up to a shared baseline rather than drifting. Whitespace is
used to group related things, not just to create breathing room.

## 5. Motion character

Subtle and fast — 150–250ms, no bounce or overshoot easing. Motion here
should be nearly invisible if you're not looking for it: a fade, a small
scale, never a slide-and-settle. The instinct to check: if a reviewer would
describe the motion as "smooth" rather than notice it as an effect at all,
it's right for this voice.

## 6. Borders & shadows

Borders do almost all the separation work — a consistent 1px neutral border
(not the flagship voice's --rule on a dark glass panel, a genuinely flat
neutral gray) around cards, inputs, and containers. Shadows exist only as a
near-invisible single-digit-opacity ambient layer for true elevation (a
dropdown over content, a modal), never as a decorative glow — `--glow-accent`
should read as effectively off in this voice.

## 7. Workflow facets in this voice

- **Component Builder**: cards use a 1px neutral border, not a shadow, for
  their primary separation; reserve shadow for genuinely elevated surfaces
  (dropdowns, modals). Buttons favor a tight `rounded-md`, not the flagship
  voice's pill shapes, except where a pill is the platform-native pattern
  (a filter chip, a status badge).
- **Page Composer**: grid-aligned layouts with a strict, visible rhythm —
  err toward a systemized 8px spacing scale applied consistently rather than
  bespoke spacing per section.
- **Theming Specialist**: lower `--radius-scale` toward its default-to-sharp
  end, drop `--glow-accent` to near-zero, keep the accent genuinely singular
  and desaturated — a second bright color anywhere breaks this voice's
  restraint immediately.
- **Accessibility Reviewer**: the near-invisible shadow/border approach
  means elevation cues are subtle — verify a modal/dropdown is distinguishable
  from its background by more than opacity alone (a border or a real shadow,
  not just a 2% tint), and that focus states are clearly visible against
  the near-white/near-black backgrounds.
- **Motion specialist**: keep every transition under 250ms with linear or
  ease-out timing — no spring/bounce easing anywhere in this voice.

## 8. Do / Don't

- Do: use a single, desaturated accent color, reserved for the one action
  that matters per view.
- Do: use 1px neutral borders as the primary separation method.
- Don't: add glass/backdrop-blur panels, gradients, or decorative glow.
- Don't: use the flagship voice's condensed all-caps display type — system
  sans, size and weight for hierarchy instead.
- Don't: use bounce/spring easing or motion longer than ~250ms.

## 9. Pre-output checklist

- [ ] Background is neutral near-white/near-black, no warmth or color tint
- [ ] Exactly one accent color, desaturated, used sparingly
- [ ] Separation uses 1px neutral borders, not shadows, except for true
      elevation (dropdowns, modals)
- [ ] Headings use system-native sans at size/weight for hierarchy, not the
      condensed display face other voices use
- [ ] No gradients, glow, or glass/backdrop-blur panels anywhere
- [ ] Motion is under ~250ms with linear/ease-out timing, no bounce
- [ ] Spacing follows a consistent, grid-aligned rhythm
