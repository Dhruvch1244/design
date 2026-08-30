# dsgn — a Claude Code Agent Skill

This is a real [Claude Code Agent Skill](https://docs.claude.com/en/docs/claude-code) —
the same format as `SKILL.md` packages loaded via `~/.claude/skills/` or a
project's own `.claude/skills/`. It teaches Claude to build UI using the real
`@dhruvchoudhary/dsgn` component registry and the `dhruvch1244/design`
philosophy, in one of seven distinct visual voices, with a router that picks
the right one automatically.

A sibling skill, `skills/dsgn-adopt/`, covers the opposite situation —
extracting an *existing* codebase's own real conventions (before this skill
was ever pointed at it) into a portable skill file for that project, instead
of introducing a competing style. See `skills/dsgn-adopt/README.md`.

## What's inside

```
skills/dsgn/
  SKILL.md                    # entry point — router logic, how to use the rest
  agents/                     # 7 self-contained style personas
    glass-dark-cyan.md          # this site's own real look (default)
    editorial-warm.md
    brutalist-mono.md
    soft-minimal.md
    neon-cyberpunk.md
    corporate.md
    startup.md
  reference/                  # real, fact-checked data pulled from this repo
    philosophy-summary.md       # condensed from philosophy/AGENTS.md
    component-registry.md       # real components + variants from packages/registry
    tokens.md                   # the real CSS token system from apps/site/app/globals.css
    workflow-checklist.md       # 5 workflow facets every style agent applies
```

Every file under `reference/` is derived from real source in this repo at
the time it was written (component names, variant names, CSS variable names,
philosophy rules) — nothing here is invented. If the upstream repo changes,
treat these as a snapshot and prefer the live source when they disagree.

## Installing it

Copy the whole `skills/dsgn/` directory into wherever Claude Code looks for
skills:

- **Globally**, so it's available in every project:
  ```
  cp -r skills/dsgn ~/.claude/skills/dsgn
  ```
- **Per-project**, so it only applies to one repo:
  ```
  cp -r skills/dsgn <your-project>/.claude/skills/dsgn
  ```

Once installed, Claude Code will surface it in the available-skills listing
and can invoke it directly (`/dsgn`) or pick it up automatically when a task
matches its description (building or restyling UI).

## Why this exists as a local package, not a marketplace listing

At the time this was built, no specific external "skills" registry/CLI was
confirmed to publish to — rather than guess a marketplace and submit to the
wrong one, this ships as a complete, correct local package first. If a
specific registry is identified later, publishing there is a matter of
following that registry's own submission process against this same content.

## Keeping it in sync with the real repo

The reference docs are a hand-maintained snapshot, not a live query — if you
add new components to `packages/registry/`, add new philosophy pillars, or
change the token system in `apps/site/app/globals.css`, update the matching
file under `skills/dsgn/reference/` yourself.

What *is* automated: `scripts/sync-skill.mjs` (run via `prepublishOnly` on
every real CLI publish) rebuilds `packages/cli/skill/` — the Claude Code
bundle, the flattened `AGENTS.md`-style doc, and the Cursor/Windsurf/
Copilot/Gemini variants — from whatever's currently in `skills/dsgn/`. That
step keeps every *installed* format in sync with each other; it doesn't
keep this source content in sync with the rest of the repo, which is still
on you.
