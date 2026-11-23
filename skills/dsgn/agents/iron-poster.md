---
name: dsgn-iron-poster
description: World — warm paper, heavy grotesk display type, gym-poster orange, ink-black hard shadows; content presented as a training log (program sheet, session cards, PRs, training history). For fitness products, coaching, and personal sites with a "progressive overload" story.
---

# Iron / Poster (world)

## 1. Identity

A training log pinned to a gym wall: the project list is a program sheet,
each entity a session card with its sets ticked off, the headline result a
PR, the career a training history. The only light world of the five —
paper and ink, one hot orange. Read `reference/worlds.md` first.

## 2. Color logic

- Background: warm paper (`#f6efe3`), surfaces cream (`#fffaf2`).
- Ink: deep navy-black (`#2d3142`) used for text *and* borders and shadows.
- Accent: poster orange (`#e36d3c`), secondary chalk yellow (`#ffd166`).
- Because it's light, re-check every dark-tuned default (opacity-based
  heatmaps, glows) — they wash out on cream.

## 3. Typography

- `--font-display`: a heavy grotesk (Archivo Black), uppercase, tight
  tracking (`-0.025em`), line-height ~0.95.
- `--font-sans`: its text cut (Archivo) for body.
- `--font-mono`: for set numbers, splits and labels.

## 4. Spacing & density

Card grid (auto-fill ~300px). Inside cards, a dense list of sets with
dashed separators. Section headings are big and close to their content.

## 5. Motion character

Physical and brief: cards lift on hover by translating up-left while the
ink shadow grows. Backdrop: graph paper with slowly rising, spinning weight
plates labelled `O(1)`, `O(n)`, `20 kg` that speed up with scroll.

## 6. Borders & shadows

2px ink borders, `6px 6px 0` ink shadows (orange on hover), 14px radius on
cards, pills for buttons. Photos inside cards get a hairline border and a
"form check" tag.

## 7. Workflow facets in this voice

- **Component Builder**: Card gets the ink border + offset shadow; Badge
  becomes a day chip (`MON`); Table becomes the program sheet.
- **Page Composer**: header + athlete card → this week's sessions →
  training history → book a session.
- **Theming Specialist**: light-only token block; `--shadow-ambient-raw`
  as a hard ink offset.
- **Accessibility Reviewer**: the barbell visual needs an `aria-label`
  ("6 technologies"); orange on cream must pass for text (use the darker
  accent step for small text).
- **Motion specialist**: one short lift on hover; nothing loops on content.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | THE PROGRAM sheet: #, lift, split, sets, PR |
| Entity card | session card: day chip, lift name, screenshot ("form check"), barbell, one set per technology, PR, coach's note |
| Category | split, from the entity's `kind` (desktop app = Legs · heavy, dev tool = Pull, …) |
| Metric | PR = the headline stat |
| Profile | athlete card: role, club (employer), based, split |
| Timeline | training history, first achievement shown as the PR |
| Call to action | book a session |

## 9. Copy voice

Coach-like and dry: lift names ("Deadlift", "Cut phase"), short coach's
notes that restate a real fact in gym terms ("2 GB on the bar, 79 ms
reps").

## 10. Do / Don't

- Do: load the barbell with one plate per real technology.
- Do: keep the ink color doing triple duty (text, border, shadow).
- Don't: invent weights, reps or timings that aren't derived.
- Don't: reuse dark-world opacity values on this light palette.

## 11. Pre-output checklist

- [ ] Program sheet + session cards + history + CTA present
- [ ] Sets and plates come from the real stack
- [ ] Text contrast passes on cream (small orange text especially)
- [ ] Hover lift is the only content motion
- [ ] Table collapses to name + PR at ~390px
