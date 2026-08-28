# UI & interaction — non-destructive, and trust the data

Expands pillars #3 and #5 from `AGENTS.md`. Read that file first.

## Model edits as an overlay, not a mutation

Before implementing any editable view, decide explicitly: is the original
ever touched before the user takes an explicit, named "commit" action
(Save, Export, Publish)? If the honest answer is "the in-memory model gets
mutated as soon as the user types," undo has to be reconstructed after the
fact — and it will be incomplete the first time an edit doesn't have a clean
inverse.

The overlay shape, generalized from file-viewer's edit tracking:

- Keep the original data (file contents, fetched record, published document)
  immutable in memory for the duration of the session.
- Represent every change as an entry in a separate, ordered overlay:
  `{ target, previous, new }` at minimum.
- The view renders `original + overlay`, not a mutated copy.
- Undo is "remove the last overlay entry" — not "figure out how to reverse
  what just happened." This is why it's structurally guaranteed rather than
  best-effort: there's no case where an edit doesn't have an inverse, because
  the inverse is just *not applying it*.
- Commit/Save/Export is the one moment the overlay is actually applied to
  produce a new artifact. Until then, closing without saving is trivially
  correct — you just discard the overlay.

Illustrative example of the mistake, and the fix:

```ts
// Anti-pattern — mutate the model directly. Undo has to be reconstructed
// after the fact, and it breaks the first time an edit has no clean inverse.
function onCellEdit(row: number, col: string, value: string) {
  data[row][col] = value; // the original value is gone the instant this runs
}
```

```ts
// Fix — record the change; the original stays untouched until commit.
// Undo is structurally guaranteed: there's nothing to reverse, only
// something to stop applying.
function onCellEdit(row: number, col: string, value: string) {
  overlay.push({ target: [row, col], previous: data[row][col], next: value });
}
const view = applyOverlay(data, overlay); // render original + overlay, never a mutated copy
function undo() {
  overlay.pop();
}
```

This generalizes past file editors:

- **Forms/settings screens**: stage changes in local component state; only
  write to the persisted record on explicit Save. A user backing out of a
  settings screen shouldn't have partially-applied their edits.
- **Drafts**: a draft is an overlay over "nothing" (or over the last
  published version) that never touches the published copy until Publish.
- **Bulk operations**: build the overlay for all affected rows before
  applying anything, so a bulk action is atomic from the user's perspective
  and cancellable up to the point of commit.

## Trust the data — the structure/content line

The rule from pillar #5 is narrower than "never validate anything." Draw the
line explicitly for every new view or import path:

- **Structural validity** — is this a well-formed instance of the format at
  all (required sections present, file not truncated, JSON actually
  parses)? **Enforce this.** Refusing to open something that isn't
  structurally the thing it claims to be is correct, and the error should
  name the specific structural problem, not just say "invalid file."
- **Content plausibility** — does a *value inside* an otherwise well-formed
  record look like something the app's author expected (a date in a
  sensible range, a string matching an expected pattern, a number below some
  guessed ceiling)? **Don't gate on this.** Surface it as information if it's
  useful (a sort/filter, a visual flag) but never silently drop, coerce, or
  block the row. The user's data is the user's data; a guess about what
  "normal" looks like is not license to hide what doesn't match it.

A concrete test when reviewing a new validation rule: "if I'm wrong about
what normal looks like here, does this rule hide real data from the user, or
does it correctly refuse to open something that isn't actually the format it
claims to be?" The first is content gatekeeping (avoid); the second is
structural validation (keep).

Practical corollary: error messages for structural failures should be
specific enough to act on ("missing required section marker at offset X",
not "could not open file"), precisely because you're asking the user to
trust that a real problem exists rather than an assumption of yours.

Illustrative example of the mistake, and the fix:

```ts
// Anti-pattern — content gatekeeping disguised as validation. A row the
// author didn't expect silently vanishes with no error the user can see.
for (const row of rows) {
  if (row.date > new Date()) continue; // "that can't be right" — drops it
  render(row);
}
```

```ts
// Fix — structural check only. Unusual content still renders; it's
// surfaced as information, never silently removed.
for (const row of rows) {
  if (!isWellFormedRow(row)) {
    throw new ParseError(`row ${row.index}: missing required field "date"`);
  }
  render(row, { flagged: row.date > new Date() }); // future-dated, still shown
}
```

## Where these two pillars meet

Non-destructive editing and trust-the-data reinforce each other: if you never
mutate the source and never hide content the user didn't ask to hide, the
user's mental model of "what is my data, right now" stays accurate through
every interaction with your app. The moment either guarantee breaks — a
mutation that can't be undone, or a row that silently vanished because it
didn't match an assumption — that trust doesn't come back with an apology in
a changelog. Treat both as correctness properties of the interaction design,
not as "nice to have if there's time."
