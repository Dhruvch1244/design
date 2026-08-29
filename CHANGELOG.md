# Changelog

All notable changes to `@dhruvchoudhary/dsgn` (the CLI, published on npm) are
documented here, in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format. The registry and site aren't independently versioned — they're
covered under **Registry** below, dated by when they actually shipped.

## [0.5.0] — 2026-08-29

### Added

- `dsgn skill` now installs for AI tools beyond Claude Code:
  `--agents-md` (plain `AGENTS.md`), `--cursor` (`.cursor/rules/dsgn.mdc`),
  `--windsurf` (`.windsurf/rules/dsgn.md`), `--copilot`
  (`.github/copilot-instructions.md`), and `--gemini` (`GEMINI.md`). Each
  installs `skill/flat/dsgn.md` — the same router, five style personas, and
  reference docs as the Claude Code skill, flattened into one file for tools
  that read a single instructions file instead of a multi-file skill package
  with sub-agent dispatch. Built by `scripts/sync-skill.mjs` from the same
  `skills/dsgn/` source as the Claude skill, so the two can't drift apart.
- A GitHub Actions workflow (`.github/workflows/publish-cli.yml`) that tags
  and publishes `packages/cli` to npm automatically whenever a version bump
  in `packages/cli/package.json` lands on `main` — the same "bump, commit,
  merge" flow already used for every release so far, just without the manual
  `npm publish` + `git tag` steps after.

### Fixed

- `packages/cli/README.md` — the file npm actually renders on the package
  page — had no version/downloads/license badges, unlike the repo's root
  README. Added the same three badges there.

## [0.4.0] — 2026-08-29

### Added

- `dsgn list --recipes` — list composed recipes separately from individual
  components. Plain `dsgn list` now also prints a footer hint about
  `dsgn skill`.
- A real automated test suite (29 tests, `node:test`) covering
  `add`/`diff`/`update`/`doctor`/`list`/`skill`/`resolveItems` — the
  package had zero regression protection before this.

### Fixed

- `resolveItems` could install a recipe's own file before one of its
  dependencies, violating its own documented "a dependency is always
  installed before the item that needs it" contract — the memoization
  pre-inserted a placeholder for the parent before recursing, silently
  locking in the wrong order. Found by the new test suite, not by hand.
- `dsgn list` (no flag) was showing all 27 raw registry entries,
  including the internal `utils` lib and the 3 recipes under their raw
  keys, instead of the 23 real UI components.

## [0.3.0] — 2026-08-29

### Added

- `dsgn skill --global` / `dsgn skill --project` — installs the dsgn Claude
  Code Agent Skill (a router plus 5 style-persona sub-agents), bundled
  directly in the package so it works fully offline, no network fetch
  beyond `npm install` itself.

## [0.2.0] — 2026-08-28

### Added

- `dsgn diff <component...>` / `dsgn update <component...>` — every file
  `add` writes now has its content hash recorded in `dsgn.config.json`,
  which is what makes it possible to tell "never touched since install"
  from "user edited this" without the CLI being a real runtime dependency.
- `dsgn add recipe:<name>` — install a composed multi-component pattern
  (`auth-form`, `settings-panel`, `pricing-tiers`) plus every component it
  depends on, in one shot.
- `dsgn doctor` — health-check installed files for drift (informational)
  and a couple of cheap, high-signal accessibility mistakes (`<img>`
  without `alt`, a clickable `<div>`/`<span>` with no `role`/`tabIndex`).
- `dsgn snippets` — drops `.vscode/dsgn.code-snippets` into a project, one
  snippet per registry component.

## [0.1.1] — 2026-08-28

### Fixed

- Windows: `dsgn add`'s install step used `spawn(cmd, args, { shell: true
  })` to resolve npm's `.cmd` shim, which Node now flags (`DEP0190`) since
  it relies on naive arg-to-shell-string concatenation instead of proper
  escaping. Replaced with `cross-spawn`, which resolves `.cmd` shims
  correctly without ever setting `shell: true`.

## [0.1.0] — 2026-08-28

### Added

- Initial publish as `@dhruvchoudhary/dsgn` (the unscoped name `dsgn` was
  already taken on npm).
- `dsgn init`, `dsgn add <component...>`, `dsgn list`.
- Non-destructive by default: `add` never overwrites an existing file
  unless `--overwrite` is passed.

---

## Registry

The component registry isn't versioned like the CLI — it's served live
from the deployed site (`design.dhruvchoudhary.com/r`), so growth here
doesn't require a CLI release to take effect for `dsgn add`.

- **2026-08-28, ~11:40** — Initial registry: Button, Card (2 components).
- **2026-08-28, ~17:48** — Badge, Input added (4).
- **2026-08-28, ~19:29** — Command palette added (5).
- **2026-08-28, ~20:11** — Textarea, Switch, Tooltip, Tabs, Select, Dialog
  added (11).
- **2026-08-28, ~21:02** — Alert, Avatar, Checkbox, Radio Group, Separator,
  Progress, Accordion, Popover, Dropdown Menu added (20).
- **2026-08-28, ~22:02** — Table, Skeleton, Empty State added, alongside a
  theming guide page on the site (23).
- **2026-08-28, ~23:49** — 3 composed recipes added (`auth-form`,
  `settings-panel`, `pricing-tiers`), installable via `dsgn add
  recipe:<name>`.
