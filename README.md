# dsgn

[![npm version](https://img.shields.io/npm/v/@dhruvchoudhary/dsgn)](https://www.npmjs.com/package/@dhruvchoudhary/dsgn)
[![npm downloads](https://img.shields.io/npm/dw/@dhruvchoudhary/dsgn)](https://www.npmjs.com/package/@dhruvchoudhary/dsgn)
[![license](https://img.shields.io/npm/l/@dhruvchoudhary/dsgn)](https://github.com/dhruvch1244/design/blob/main/LICENSE)

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

`dsgn skill` installs the philosophy + registry as an AI-tool skill/rules
file — `--global`/`--project` for Claude Code's native multi-file Agent
Skill format, or `--agents-md`/`--cursor`/`--windsurf`/`--copilot`/`--gemini`
for a flattened single-file version other tools read natively. See
[`packages/cli/README.md`](packages/cli/README.md#agent-skill) for the full
list.

## Adding a new component to the registry

1. Add the component under `packages/registry/src/components/<name>/`.
2. Register it in `packages/registry/registry.json` (name, files, npm
   `dependencies`, and `registryDependencies` on any other registry item it
   needs — e.g. `utils`).
3. Run `npm run sync-registry` and check it on `/components` locally.

## Roadmap

The JS/TS version (this repo) is deliberately first and complete before
anything else: a real philosophy, a real registry, a real CLI, a real site.
Python and C# ports are a planned second phase, once this vertical has
proven itself rather than three ecosystems being designed at once.
