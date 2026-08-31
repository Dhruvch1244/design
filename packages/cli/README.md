# dsgn

[![npm version](https://img.shields.io/npm/v/@dhruvchoudhary/dsgn)](https://www.npmjs.com/package/@dhruvchoudhary/dsgn)
[![npm downloads](https://img.shields.io/npm/dw/@dhruvchoudhary/dsgn)](https://www.npmjs.com/package/@dhruvchoudhary/dsgn)
[![license](https://img.shields.io/npm/l/@dhruvchoudhary/dsgn)](https://github.com/dhruvch1244/design/blob/main/LICENSE)

A CLI that copies [dsgn](https://design.dhruvchoudhary.com) design-system
components into your own project's source tree — the shadcn/ui model. No
runtime dependency on this package: once a component lands, you own the
file. Works in any React + Tailwind project.

## Usage

```sh
npx @dhruvchoudhary/dsgn init
npx @dhruvchoudhary/dsgn add button card
```

`init` writes `dsgn.config.json` (component/lib paths and your import
alias). `add` copies the named component's source into your project,
rewriting `@/lib/utils` imports to match your configured alias, and
installs whatever npm dependencies that component needs.

By default `add` **never overwrites an existing file** — pass
`--overwrite` to opt in. This mirrors the design system's own
non-destructive-by-default pillar, not an oversight.

## Recipes

`add recipe:<name>` installs a whole composed pattern — the recipe file
itself plus every component it depends on — in one shot:

```sh
npx @dhruvchoudhary/dsgn add recipe:auth-form
```

Available recipes: `auth-form` (sign-in card), `settings-panel`
(preferences screen), `pricing-tiers` (3-tier plan layout), `empty-state-cta`
(no-projects-yet panel), `billing-summary` (plan/usage card), `team-members`
(role-badged member list with a per-row actions menu), `notification-list`
(unread-count notification feed), `onboarding-checklist` (step checklist
with progress).

Run `dsgn list --recipes` (or `--recipes --json` for machine-readable
output) to see the full, always-current list from the registry itself.

## Tracking upstream changes

Every file `add` writes has its content hash recorded in
`dsgn.config.json`. That's what makes these two commands possible without
this package being a real runtime dependency:

```sh
npx @dhruvchoudhary/dsgn diff button      # see what changed upstream since install
npx @dhruvchoudhary/dsgn update button    # pull the current registry version in
```

If you've hand-edited a file since installing it, `update` skips it and
tells you to pass `--force` — it won't silently clobber your changes.

## Health check

```sh
npx @dhruvchoudhary/dsgn doctor
```

Reports installed files that are missing, files that have drifted from
what was installed (informational, not necessarily wrong), and flags a
couple of cheap, high-signal accessibility mistakes (`<img>` without
`alt`, a clickable `<div>`/`<span>` with no `role`/`tabIndex`).

## VS Code snippets

```sh
npx @dhruvchoudhary/dsgn snippets
```

Drops `.vscode/dsgn.code-snippets` into your project — one snippet per
registry component (`dsgn-button`, `dsgn-card`, `dsgn-dialog`, ...).

## Agent Skill

```sh
npx @dhruvchoudhary/dsgn skill --global    # ~/.claude/skills/dsgn — every project
npx @dhruvchoudhary/dsgn skill --project   # ./.claude/skills/dsgn — this project only
```

Installs the dsgn Claude Code Agent Skill: a router plus 7 style-persona
sub-agents (glass-dark-cyan, editorial-warm, brutalist-mono, soft-minimal,
neon-cyberpunk, corporate, startup), each grounded in the real philosophy docs, registry, and
token system — so Claude builds UI using this project's actual design
philosophy instead of invented conventions. Bundled directly in this
package, so it works offline. Full package, browsable and downloadable
without the CLI, at
[design.dhruvchoudhary.com/skill](https://design.dhruvchoudhary.com/skill).

### Other AI tools

The same router, personas, and reference docs, built as the real structure
each tool's own format actually supports — not one flattened file
everywhere:

```sh
npx @dhruvchoudhary/dsgn skill --cursor           # ./.cursor/rules/dsgn/ (router + 7 agents + 4 reference docs)
npx @dhruvchoudhary/dsgn skill --windsurf         # ./.windsurf/rules/dsgn-*.md (this project)
npx @dhruvchoudhary/dsgn skill --windsurf-global  # ~/.windsurf/global_rules.md (every workspace, condensed)
npx @dhruvchoudhary/dsgn skill --copilot          # ./.github/copilot-instructions.md + .github/instructions/dsgn-*.instructions.md
npx @dhruvchoudhary/dsgn skill --gemini           # ./GEMINI.md + ./.gemini/dsgn/ (this project)
npx @dhruvchoudhary/dsgn skill --gemini-global    # ~/.gemini/GEMINI.md + ~/.gemini/dsgn/ (every project)
npx @dhruvchoudhary/dsgn skill --agents-md        # ./AGENTS.md — Codex CLI, Amp, ... (single flattened file)
```

### Claude Code + AGENTS.md, bridged

Claude Code doesn't read `AGENTS.md` natively — it reads `CLAUDE.md`. Passing
`--project` and `--agents-md` together installs both and bridges them, instead
of making you pick one:

```sh
npx @dhruvchoudhary/dsgn skill --project --agents-md
```

This writes `.claude/skills/dsgn/` and `./AGENTS.md` exactly as the two flags
would separately, then makes sure `CLAUDE.md` starts with an `@AGENTS.md`
import — the same pattern this repo's own `apps/site/CLAUDE.md` uses. The
import is prepended above whatever's already in `CLAUDE.md`, never replaces
it, and running the command again is a no-op if the import is already there.
Every other AGENTS.md-aware tool (Codex CLI, Amp, Gemini CLI, Cursor, Zed,
Windsurf, Devin, ...) keeps reading `./AGENTS.md` directly, unaffected by the
bridge.

- **Cursor** reads each file's own `description` frontmatter and
  auto-attaches the relevant one automatically — the closest real
  equivalent to Claude Code's sub-agent dispatch any of these tools has.
  There's no `--cursor-global`: Cursor's only global mechanism is its
  Settings UI, not a file.
- **Windsurf** project rules merge into `.windsurf/rules/` alongside any
  rules you already have there. The global variant is a hand-written
  condensed summary, not the full skill — Windsurf caps `global_rules.md`
  at 6,000 characters, and the full skill can't fit.
- **Copilot** has no description-based routing, so all 7 style-voice
  instruction files apply together whenever their `applyTo` glob matches —
  delete the ones you don't want if you'd rather keep one voice active.
  There's no cross-editor global file (only JetBrains has an IDE-specific
  one, which isn't a fit for a generic installer).
- **Gemini CLI** gets real `@file.md` imports, not copy-pasted content —
  `GEMINI.md` imports the agent/reference files rather than inlining them.

Every target is non-destructive by default like every other `dsgn` install
command — pass `--overwrite` if a target already exists and you want it
replaced. Multi-file targets (Copilot, Gemini) check every file they'd
write *before* writing any of them, so an install never lands half-applied.

### dsgn-adopt — extract an existing codebase's own conventions

The reverse of everything above: instead of applying this repo's own
philosophy/registry/voices to a project, `dsgn-adopt` reads an **existing**
codebase's real, already-shipped UI conventions (component variant names,
the real primitive library, real design tokens) and writes them to a
portable skill file for that project — grounded in files it actually read,
never invented.

```sh
npx @dhruvchoudhary/dsgn skill --adopt          # this project only
npx @dhruvchoudhary/dsgn skill --adopt-global   # every project
```

Claude Code only for now, unlike the voice-router skill above (no Cursor/
Windsurf/Copilot/Gemini targets yet) — it's an on-demand procedure you run
once per unfamiliar repo, not always-active persistent context, which fits
Claude Code's Skill-invocation model more naturally than those other tools'
always-loaded-rules formats.

## Commands

| Command | What it does |
|---|---|
| `init` | Create `dsgn.config.json` in the current project |
| `add <component...>` | Copy one or more components into your project |
| `add recipe:<name>` | Copy a composed multi-component pattern |
| `list` / `list --recipes` | Show every component or recipe available in the registry |
| `list --json` | Same data as machine-readable JSON (combine with `--recipes`) |
| `diff <component...>` | Show how an installed component differs from the registry |
| `update <component...>` | Pull the current registry version into your project |
| `doctor` | Health-check installed files (missing, modified, a11y) |
| `snippets` | Add VS Code snippets for every registry component |
| `skill --global` / `--project` | Install the dsgn Claude Code Agent Skill |
| `skill --cursor` / `--windsurf[-global]` / `--copilot` / `--gemini[-global]` / `--agents-md` | Install the skill for another AI tool |
| `skill --project --agents-md` | Both, bridged — `CLAUDE.md` gets an `@AGENTS.md` import so Claude Code reads it too |
| `skill --adopt` / `--adopt-global` | Install the dsgn-adopt Skill — extracts an existing codebase's own real UI conventions |

## Options

| Flag | Effect |
|---|---|
| `--registry <url-or-path>` | Registry to read from (default: `https://design.dhruvchoudhary.com/r`) |
| `--overwrite` | Replace files that already exist (`add`/`skill`, default: skip them) |
| `--skip-install` | Don't run the package manager after copying files (`add` only) |
| `--force` | Overwrite locally-modified files (`update` only) |
| `--global` | Install to `~/.claude/skills/dsgn` (`skill` only) |
| `--project` | Install to `./.claude/skills/dsgn` (`skill` only) |
| `--cursor` | Install to `./.cursor/rules/dsgn/` — no global variant exists (`skill` only) |
| `--windsurf` | Install to `./.windsurf/rules/` (`skill` only) |
| `--windsurf-global` | Install condensed doc to `~/.windsurf/global_rules.md` (`skill` only) |
| `--copilot` | Install to `./.github/copilot-instructions.md` + `./.github/instructions/` (`skill` only) |
| `--gemini` | Install to `./GEMINI.md` + `./.gemini/dsgn/` (`skill` only) |
| `--gemini-global` | Install to `~/.gemini/GEMINI.md` + `~/.gemini/dsgn/` (`skill` only) |
| `--agents-md` | Install to `./AGENTS.md` (`skill` only) |
| `--adopt` | Install dsgn-adopt to `./.claude/skills/dsgn-adopt` (`skill` only) |
| `--adopt-global` | Install dsgn-adopt to `~/.claude/skills/dsgn-adopt` (`skill` only) |
| `-h, --help` | Show help |
| `-v, --version` | Show the installed CLI version |

## What's in the registry

Button, Card, Badge, Input, Command (⌘K palette), Textarea, Switch,
Tooltip, Tabs, Select, Dialog — see the full list, live, at
[design.dhruvchoudhary.com/components](https://design.dhruvchoudhary.com/components).

## Source

[github.com/dhruvch1244/design](https://github.com/dhruvch1244/design) —
the CLI (`packages/cli`), the component source (`packages/registry`), and
the portable cross-AI design philosophy (`philosophy/`) this registry is
built from all live in one repo.
