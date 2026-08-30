---
name: dsgn-adopt
description: Before building new UI in an existing, already-designed codebase — one with its own real components, styling approach, and conventions already shipped — extract what's actually there into a portable, evidence-grounded skill file, instead of guessing at conventions or silently introducing a competing style (a second component library, a new naming scheme, a different variant vocabulary) alongside the one already in use.
---

# dsgn-adopt

## 1. Identity

`skills/dsgn/` (the sibling skill this one lives next to) is for building UI
from scratch, or restyling a project that doesn't have a strong opinion of
its own yet — it hands you a philosophy, a registry, and 7 style voices to
apply. This skill is for the opposite situation: a codebase that **already
has real, shipped UI conventions**, and the job is to keep working in them,
not replace them.

The failure mode this exists to prevent: an agent opens an unfamiliar repo,
doesn't look closely at what's already there, and either (a) invents new
component variants that don't match the existing vocabulary (a `variant="accent"`
next to a codebase that only ever uses `default`/`outline`/`secondary`), or
(b) pulls in a second UI library/pattern alongside the one already
installed, because the training-data-default felt more familiar than
actually reading the repo. Both leave the codebase with two competing
conventions instead of one coherent one.

## 2. When to use this skill

Use it once, near the start of working in a repo that:

- Has real, already-built UI (components, pages, styling) — not a blank
  scaffold. A blank scaffold is `skills/dsgn`'s job, not this one's.
- Doesn't already have a skill file describing its own conventions (check
  for `CLAUDE.md`, `AGENTS.md`, `.claude/skills/*/SKILL.md`, or a
  `DESIGN.md`/`CONVENTIONS.md` first — **if one exists, read and defer to
  it instead of running this extraction**; it's already the source of
  truth, and duplicating it risks drifting out of sync with a hand-written
  doc someone is actually maintaining).
- You (or whoever's picking up the work next) don't yet have a clear,
  evidenced picture of the real conventions — component variant names,
  styling approach, naming scheme, primitive library.

Don't re-run it on every session in the same repo — once the output file
exists and the codebase hasn't materially changed, read that file instead
of re-extracting from scratch.

## 3. The extraction procedure

Full step-by-step detail, including exactly what to grep/read and the
output template, is in `reference/extraction-checklist.md`. Summary:

1. **Check for an existing source of truth first** (see above) — stop here
   if one exists.
2. **Identify the real stack** from `package.json` (or the equivalent —
   `Cargo.toml`, `.csproj`, `pubspec.yaml`) — framework, version, the actual
   UI primitive/component library in use (Radix? Base UI? MUI? Chakra?
   Bootstrap? none?), the actual styling approach (Tailwind? CSS Modules?
   styled-components? plain CSS?). **Read the file — don't infer the stack
   from a README, a case-study doc, or anything else that might be stale.**
   A repo's own dependencies are the only thing that can't have drifted out
   of date.
3. **Read real component files**, not just list them — at minimum the most
   fundamental, most-reused ones (whatever plays the role of Button/Card in
   this codebase). Extract the actual variant/prop names, the actual
   className/styling pattern, any `data-*` attribute conventions.
4. **Find the real design-token source** if one exists (a CSS custom
   property block, a theme file, `tailwind.config`) — and say explicitly if
   there isn't one; inconsistent/ad-hoc values is itself a real finding,
   not something to paper over with an invented "should probably use
   tokens" recommendation.
5. **Write the output** to `.claude/skills/<repo-name>-conventions/SKILL.md`
   inside the **target repo** (not this one) — portable, so any future
   session (this tool or another) picks it up automatically the same way
   this repo's own `CLAUDE.md` → `AGENTS.md` bridge works.

## 4. The one rule that matters most

**Never write down a pattern you didn't actually observe.** Every claim in
the output needs a real file (and ideally a line reference) behind it. A
pattern seen in exactly one file is weaker evidence than one seen in three
— say so, don't flatten that distinction. Where the codebase is genuinely
inconsistent (three different spacing scales in three different files),
write that down as the finding — "no consistent pattern here" is more
useful to a future agent than a fabricated "the convention is X" that will
immediately be contradicted by the fourth file it reads.

This is the same discipline `philosophy/AGENTS.md` (in the `dsgn` skill)
holds itself to: "a rule with no worked example in this file is a rule you
should be suspicious of." That rule doesn't relax just because the target
here is someone else's codebase instead of this one.
