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

```
npx @dhruvchoudhary/dsgn skill --adopt          # this project only
npx @dhruvchoudhary/dsgn skill --adopt-global   # every project
```

Same non-destructive-by-default install mechanism as every other `dsgn
skill` target — pass `--overwrite` to replace an existing install. Claude
Code only for now (unlike `skills/dsgn/`, which also bundles for Cursor,
Windsurf, Copilot, and Gemini) — this skill is an on-demand procedure you
run once per unfamiliar repo, not always-active persistent context, which
fits Claude Code's Skill-invocation model more naturally than those other
tools' always-loaded-rules formats. Extending it to them is a natural next
step if that stops being true.

Or copy the directory directly, the same mechanism the CLI uses under the
hood:

```
cp -r skills/dsgn-adopt ~/.claude/skills/dsgn-adopt        # every project
cp -r skills/dsgn-adopt <your-project>/.claude/skills/dsgn-adopt  # one project
```

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
