---
name: dsgn-editorial-warm
description: Warm paper background, high-contrast serif display type, muted sage/espresso accent, flat hairline-bordered cards. For portfolios, agencies, and content-first sites that should read as considered rather than "techy."
---

# Editorial / Warm

## 1. Identity

Trades the flagship voice's dark glass for warm paper tones and editorial
type contrast — the register of a well-typeset magazine or a design studio's
own site, not a SaaS dashboard. Content and typography carry the weight;
color and effects stay quiet.

## 2. Color logic

- Background: warm off-white/cream (`#FDFBF7`–`#F7F5F0` range), never
  stark white.
- Accent: muted, desaturated — a deep sage green or espresso brown, not a
  bright/saturated hue. Use the same semantic token names as the flagship
  voice (`--accent`, `--muted`, `--border`) so components don't need
  source changes — just re-point the raw values (see
  `reference/tokens.md`'s indirection model).
- Text: near-black but not pure black (`#111111`–`#2F3437` range), high
  contrast against the cream background. Secondary text: muted warm gray.
- No glass/translucency layer — flat, opaque surfaces throughout.

## 3. Typography

- Display/headings: a high-contrast variable serif, tight tracking
  (`-0.02em` to `-0.04em`), tight line-height (`~1.1`). This is the single
  biggest departure from the flagship voice's condensed sans display type.
- Body: a clean, well-spaced sans, generous line-height (`1.6`+) for actual
  readability at paragraph length — this voice expects people to read prose,
  not just scan UI chrome.
- Meta/code: a plain monospace, used sparingly.

## 4. Spacing & density

The most generous of the five voices. Large margins, wide column measure
limits for body text (don't let a paragraph run edge-to-edge on a wide
screen), and real whitespace between sections — this voice fails if it feels
crowded.

## 5. Motion character

Understated. Fades and gentle upward drifts on scroll, no glow pulses, no
cursor-follow effects. Slightly longer, calmer easing than the flagship
voice's fluid curve — motion should feel like a page turning, not a UI
reacting.

## 6. Borders & shadows

Flat hairline borders (1px, low-contrast) instead of glass panels. Shadows
are nearly absent — if used at all, extremely soft and low-opacity (<5%),
never a visible drop shadow with hard edges.

## 7. Workflow facets in this voice

- **Component Builder**: Card components lose the glass/blur treatment and
  become flat bordered containers. Buttons favor `outline` and `ghost`
  registry variants; a solid `accent` fill is used sparingly, if at all.
- **Page Composer**: hero sections favor a large serif headline with a
  generous body paragraph beside or beneath it — text-forward, not
  proof-element-forward like the flagship voice's live terminal snippet
  pattern.
- **Theming Specialist**: re-point the raw token values only — background
  to warm cream, accent to sage/espresso, remove the glass/glow shadow
  recipes in favor of flat borders. Component source stays untouched.
- **Accessibility Reviewer**: near-black-on-cream generally holds strong
  contrast by default, but check the muted accent color specifically —
  desaturated sage/espresso hues can drift below AA contrast against cream
  faster than a saturated color would; verify, don't assume.
- **Motion specialist**: default to *less* motion than the flagship voice,
  not just slower motion. If in doubt, cut an animation rather than soften
  it further.

## 8. Do / Don't

- Do: let generous whitespace and serif type contrast do the visual work.
- Do: keep the accent color muted and rare.
- Don't: add a glass/blur panel treatment — this voice is intentionally flat.
- Don't: use a saturated, high-chroma accent color.
- Don't: let body copy run at less than `1.5` line-height.

## 9. Pre-output checklist

- [ ] Background is warm cream, not stark white or dark
- [ ] Headings use a serif display face; body text does not
- [ ] Accent color is muted/desaturated, used sparingly
- [ ] No glass/blur panels anywhere
- [ ] Body text line-height is generous (1.6+)
- [ ] Contrast of the muted accent verified against the cream background
