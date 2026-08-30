# dsgn-adopt — a Claude Code Agent Skill

The sibling to `skills/dsgn/`, for the opposite situation: instead of
building UI in a fresh scaffold (or restyling one) using this repo's own
philosophy and registry, `dsgn-adopt` extracts an **existing** codebase's
own real, already-shipped UI conventions — component variant names, styling
approach, primitive library, design tokens — into a portable skill file for
that project, before any new work touches it.

Same non-negotiable rule as everything else in this repo: every claim in
the output has to cite a real file it came from. Nothing invented, nothing
generalized from a single example without saying so.

## What's inside

```
skills/dsgn-adopt/
  SKILL.md                          # entry point — when to use it, the procedure, the one rule that matters
  reference/
    extraction-checklist.md           # step-by-step: what to grep/read, the output template
```

## Installing it

Same mechanism as `skills/dsgn/` — copy the directory into wherever Claude
Code looks for skills:

```
cp -r skills/dsgn-adopt ~/.claude/skills/dsgn-adopt        # every project
cp -r skills/dsgn-adopt <your-project>/.claude/skills/dsgn-adopt  # one project
```

Not currently bundled through `npx @dhruvchoudhary/dsgn skill` the way
`skills/dsgn/` is (that command's `--global`/`--project`/`--cursor`/etc.
targets, and `scripts/sync-skill.mjs`'s per-tool builds, are all scoped to
the voice-router skill specifically) — a natural next step if this proves
useful enough to want the same one-command install and multi-tool bundling.

## What it produces

Not changes to *this* repo — it writes a new file into the **target**
repo you point it at: `.claude/skills/<repo-name>-conventions/SKILL.md`,
portable the same way this repo's own `AGENTS.md` is. See
`reference/extraction-checklist.md` for the exact output shape.

## Verified against a real repo

Run once by hand against a real, unrelated Next.js + Base UI + shadcn
codebase (not one of this repo's own dependencies) to confirm the procedure
actually produces grounded, non-invented output rather than generic advice
— found and correctly cited real specifics (Base UI instead of Radix, a
6-variant Button vocabulary with no `accent` variant, a `data-slot`
convention, OKLCH tokens) that a guess from training-data defaults would
have gotten wrong.
