# dsgn

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
(preferences screen), `pricing-tiers` (3-tier plan layout).

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

## Commands

| Command | What it does |
|---|---|
| `init` | Create `dsgn.config.json` in the current project |
| `add <component...>` | Copy one or more components into your project |
| `add recipe:<name>` | Copy a composed multi-component pattern |
| `list` | Show every component available in the registry |
| `diff <component...>` | Show how an installed component differs from the registry |
| `update <component...>` | Pull the current registry version into your project |
| `doctor` | Health-check installed files (missing, modified, a11y) |
| `snippets` | Add VS Code snippets for every registry component |

## Options

| Flag | Effect |
|---|---|
| `--registry <url-or-path>` | Registry to read from (default: `https://design.dhruvchoudhary.com/r`) |
| `--overwrite` | Replace files that already exist (`add` only) |
| `--skip-install` | Don't run the package manager after copying files (`add` only) |
| `--force` | Overwrite locally-modified files (`update` only) |
| `-h, --help` | Show help |

## What's in the registry

Button, Card, Badge, Input, Command (⌘K palette), Textarea, Switch,
Tooltip, Tabs, Select, Dialog — see the full list, live, at
[design.dhruvchoudhary.com/components](https://design.dhruvchoudhary.com/components).

## Source

[github.com/dhruvch1244/design](https://github.com/dhruvch1244/design) —
the CLI (`packages/cli`), the component source (`packages/registry`), and
the portable cross-AI design philosophy (`philosophy/`) this registry is
built from all live in one repo.
