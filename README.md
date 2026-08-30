# dsgn

[![npm version](https://img.shields.io/npm/v/@dhruvchoudhary/dsgn)](https://www.npmjs.com/package/@dhruvchoudhary/dsgn)
[![npm downloads](https://img.shields.io/npm/dw/@dhruvchoudhary/dsgn)](https://www.npmjs.com/package/@dhruvchoudhary/dsgn)
[![license](https://img.shields.io/npm/l/@dhruvchoudhary/dsgn)](https://github.com/dhruvch1244/design/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/dhruvch1244/design)](https://github.com/dhruvch1244/design)
[![dsgn components](https://img.shields.io/endpoint?url=https://design.dhruvchoudhary.com/badge-data.json)](https://design.dhruvchoudhary.com/components)
[![dsgn recipes](https://img.shields.io/endpoint?url=https://design.dhruvchoudhary.com/badge-data-recipes.json)](https://design.dhruvchoudhary.com/examples)

A design philosophy, made usable — and made cross-AI.

This repo has two halves that reinforce each other:

1. **`philosophy/`** — a portable design-philosophy document any AI coding
   tool can read (Claude, GPT, Gemini, Copilot, Cursor, a local model,
   whatever comes next). Every rule in it was extracted from a decision that
   actually shipped in one of three real apps — named, so it stays
   falsifiable. Start at [`philosophy/AGENTS.md`](philosophy/AGENTS.md).
2. **A component registry + CLI** that put the philosophy's non-destructive,
   copy-don't-depend instincts into the tooling itself:
   `npx @dhruvchoudhary/dsgn add button` copies real component source into
   *your* project — you own the file the moment it lands, same as any
   shadcn/ui-style registry.

The site at `apps/site` (deployed to `design.dhruvchoudhary.com`) renders the
philosophy and doubles as the live component showcase — it's built using its
own `dsgn add` output, not a separate hand-maintained demo.

## Layout

```
philosophy/            The portable philosophy docs (read AGENTS.md first)
packages/registry/      Source-of-truth components (React + Tailwind + CVA)
packages/cli/            The dsgn CLI (npm: @dhruvchoudhary/dsgn) — copies registry components into a project
apps/site/                Next.js site: renders philosophy/, showcases components,
                            and serves the registry as static JSON at /r/*.json
skills/dsgn/               Claude Code Agent Skill — build/restyle UI in 7 voices
skills/dsgn-adopt/         Sibling skill — extract an existing repo's own real conventions
scripts/sync-registry.mjs  Builds the registry and copies it into apps/site/public/r
```

## Working on this repo

```sh
npm install                 # installs every workspace at once
npm run typecheck            # typechecks packages/registry
npm run dev                   # runs the site (auto-syncs the registry first)
npm run sync-registry          # rebuild packages/registry → apps/site/public/r by hand
```

`apps/site`'s own `predev`/`prebuild` scripts call `sync-registry` for you,
so the registry served by the site is never stale relative to
`packages/registry/src`.

## Using the CLI in another project

Once `apps/site` is deployed, this works in any React + Tailwind project,
no clone of this repo required:

```sh
npx @dhruvchoudhary/dsgn init                 # writes dsgn.config.json (paths + import alias)
npx @dhruvchoudhary/dsgn add button card       # copies component source + installs npm deps
```

`dsgn add` never overwrites a file that already exists unless you pass
`--overwrite` — the CLI itself follows the philosophy's non-destructive-by-
default pillar, not just the components it installs.

Point it at a different registry (this monorepo's own build, or a fork)
with `--registry <url-or-local-path>` or the `DSGN_REGISTRY` env var.

`dsgn skill` installs the philosophy + registry as native skill/rules files
for whichever AI tool you use — Claude Code's multi-file Agent Skill format
(`--global`/`--project`), Cursor's auto-attaching `.mdc` rules (`--cursor`),
Windsurf's rules (`--windsurf`/`--windsurf-global`), GitHub Copilot's
instructions (`--copilot`), Gemini CLI's real `@file.md` imports
(`--gemini`/`--gemini-global`), or a plain `AGENTS.md`. Built as the real
multi-file structure each format actually supports, not one flattened file
everywhere. See
[`packages/cli/README.md`](packages/cli/README.md#agent-skill) for the full
list and each tool's constraints (no Cursor global, Windsurf's 6,000-char
global cap, etc).

## Adding a new component to the registry

1. Add the component under `packages/registry/src/components/<name>/`.
2. Register it in `packages/registry/registry.json` (name, files, npm
   `dependencies`, and `registryDependencies` on any other registry item it
   needs — e.g. `utils`).
3. Run `npm run sync-registry` and check it on `/components` locally.

## Primitive layer: Radix, not Base UI

Every interactive component in `packages/registry` (`dialog`, `select`,
`tabs`, `dropdown-menu`, `accordion`, `popover`, `tooltip`, ...) is built on
`@radix-ui/react-*`, not [Base UI](https://base-ui.com) — even though
`shadcn init` has defaulted new projects to Base UI since July 2026. This is
a decision, not an oversight:

- **23 of the 25 shipped components are already Radix-shaped** (`breadcrumb`
  and `pagination` are plain semantic markup with no primitive dependency).
  Every Radix-based one, plus the eight recipes in
  `packages/registry/src/recipes`, would need to be rebuilt and re-verified
  against Base UI's different prop/slot API. That's real regression risk for
  zero user-facing benefit until Base UI's own ecosystem (docs, community
  examples, third-party registries built on it) matches what Radix already
  has.
- **`dsgn add` copies source, it doesn't pin a version.** Once a component
  lands in a consuming project, the primitive underneath it is that
  project's problem, not an upgrade this registry can force later. Migrating
  the source of truth doesn't retroactively move anyone who already ran
  `dsgn add`.
- **This is a tracked decision, not a default nobody looked at.** Revisit it
  if Base UI's accessibility/behavior parity with Radix becomes clearly
  superior, or if enough of the shadcn-compatible ecosystem (Kibo UI, 21st.dev,
  Cult UI) moves that Radix-based components start feeling like the outlier
  choice rather than the safe one. Until then, staying put is the considered
  call, made explicitly here so it doesn't read as staleness.

## Agent Skills

Two Claude Code Agent Skills live under `skills/`, for two different
situations:

- **`skills/dsgn/`** — build or restyle UI using this repo's own philosophy,
  registry, and one of 7 style voices (glass-dark-cyan, editorial-warm,
  brutalist-mono, soft-minimal, neon-cyberpunk, corporate, startup). Install
  via `npx @dhruvchoudhary/dsgn skill --project` (or `--global`,
  `--cursor`, `--windsurf`, `--copilot`, `--gemini`, `--agents-md` — see
  `packages/cli/README.md`). Best for a fresh scaffold, or a restyle the
  user actually asked for.
- **`skills/dsgn-adopt/`** — the opposite situation: a codebase that
  *already* has real, shipped UI conventions of its own. Extracts what's
  actually there (real component variant names, the real primitive library,
  real design tokens — never invented, every claim cites a file) into a
  portable skill file for that project, so new work matches the existing
  convention instead of silently introducing a competing one. Install via
  `npx @dhruvchoudhary/dsgn skill --adopt` (or `--adopt-global`) — Claude
  Code only for now (see `skills/dsgn-adopt/README.md` for why).

## Roadmap

The JS/TS version (this repo) is deliberately first and complete before
anything else: a real philosophy, a real registry, a real CLI, a real site.
Python and C# ports are a planned second phase, once this vertical has
proven itself rather than three ecosystems being designed at once.
