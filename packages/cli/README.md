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

## Commands

| Command | What it does |
|---|---|
| `init` | Create `dsgn.config.json` in the current project |
| `add <component...>` | Copy one or more components into your project |
| `list` | Show every component available in the registry |

## Options

| Flag | Effect |
|---|---|
| `--registry <url-or-path>` | Registry to read from (default: `https://design.dhruvchoudhary.com/r`) |
| `--overwrite` | Replace files that already exist |
| `--skip-install` | Don't run the package manager after copying files |
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
