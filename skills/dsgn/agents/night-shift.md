---
name: dsgn-night-shift
description: World — lavender night sky, rounded friendly type, soft large radii, a moon and a peeking cat; content presented as a night journal and a polaroid wall. For personal sites, indie products and creative portfolios that should feel warm and human rather than corporate.
---

# Night Shift (world)

## 1. Identity

Late-night and personal: the home page is a journal with timestamped
entries, the project list is a wall of taped polaroids with a note on each,
and a small character (a cat) gives a verdict. Whimsy is allowed exactly
where it's obviously whimsy; facts stay facts. Read `reference/worlds.md`
first.

## 2. Color logic

- Background: a vertical gradient from deep indigo (`#211a42`) to dusk
  violet (`#6a4f8f`), fixed so it doesn't scroll away.
- Accents: mint (`#a8f0d1`) primary, moon yellow (`#ffd84f`) secondary,
  blush (`#f2a7c3`) tertiary.
- Polaroid paper is warm off-white (`#fbf7ee`) with indigo caption text.

## 3. Typography

- `--font-display`: a rounded geometric (Fredoka), sentence case, not
  uppercase.
- `--font-sans`: a friendly humanist (Nunito) at a slightly larger body
  size.
- Timestamps in the display face, in the moon yellow.

## 4. Spacing & density

Airy and single-column for the journal (~780px measure); a loose
auto-fill grid for the polaroid wall with room for tilt and tape.

## 5. Motion character

Slow and ambient: twinkling stars, the occasional shooting star, a moon
that drifts with scroll; polaroids straighten and lift slightly on hover;
the cat blinks and its eyes follow the cursor. All ambient motion stops
under reduced motion.

## 6. Borders & shadows

Large radii (20px+) on journal cards, pill buttons, soft long shadows under
polaroids, translucent surfaces over the sky. No hard edges anywhere.

## 7. Workflow facets in this voice

- **Component Builder**: Card becomes a journal entry or polaroid; Avatar
  gets a moon-yellow ring.
- **Page Composer**: "hi, I'm…" note → recent entries → where I am by day
  → leave a note.
- **Theming Specialist**: radius scale high (~1.8); soft ambient shadows.
- **Accessibility Reviewer**: the decorative cat is a real `<button>` with
  an `aria-label` if it's interactive; emoji ratings get an `aria-label`
  ("4 of 5 paws"); mint on indigo must pass for links.
- **Motion specialist**: ambient, slow, never on the text itself.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | polaroid wall: photo (screenshot), caption, note on the back |
| Entity headline | journal entry with a timestamp |
| Metric | the fact inside the entry ("search went from 1.8 seconds to 79 milliseconds") + paws derived from a real field |
| Profile | "hi, I'm…" with a short day/night line |
| Timeline | "where I am by day" |
| Call to action | "leave a note" |

## 9. Copy voice

Lowercase, first person, a little tired and fond. The cat's verdict is the
one place jokes go ("knocked the router off the desk to test it"). Never
turn a joke into a claim about the work.

## 10. Do / Don't

- Do: keep every number in an entry true to the content model.
- Do: give imageless entities a designed blank (stat on a dusk gradient).
- Don't: let whimsy invent metrics or users.
- Don't: use uppercase display type or hard edges.

## 11. Pre-output checklist

- [ ] Journal, polaroid wall, day job and CTA present
- [ ] Polaroid photos crop to a consistent ratio (`height: auto` with an
      `aspect-ratio`, or the `height` attribute wins)
- [ ] Ratings and the cat are labelled for screen readers
- [ ] Ambient motion stops under reduced motion
- [ ] Contrast passes for mint and blush text on the sky
