# Changelog

All notable changes to `@dhruvchoudhary/dsgn` (the CLI, published on npm) are
documented here, in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format. The registry and site aren't independently versioned — they're
covered under **Registry** below, dated by when they actually shipped.

## [0.6.0] — 2026-08-29

### Changed

- `dsgn skill`'s non-Claude targets no longer install one flattened file —
  each now gets the real multi-file structure its own format supports:
  - `--cursor` installs `.cursor/rules/dsgn/` (router.mdc + 5 agents/*.mdc +
    4 reference/*.mdc), each with its own `description` frontmatter Cursor
    reads to auto-attach the relevant file — the closest real equivalent to
    Claude Code's sub-agent dispatch any of these tools has.
  - `--windsurf` installs 10 flat `dsgn-*.md` files into `.windsurf/rules/`,
    merging alongside any rules already there rather than treating the
    whole directory as a conflict.
  - `--gemini` installs `GEMINI.md` + `.gemini/dsgn/{agents,reference}/`,
    using Gemini CLI's real `@file.md` import syntax rather than
    copy-pasted content.
  - `--copilot` installs `.github/copilot-instructions.md` (router +
    inlined reference docs) plus 5
    `.github/instructions/dsgn-<voice>.instructions.md` files — Copilot has
    no description-based routing, so all 5 apply together whenever their
    `applyTo` glob matches; documented rather than papered over.
  - `AGENTS.md` alone stays single-file, since that convention genuinely is
    single-file by design — not a shortcut applied to the others.
  - Every per-tool file has its internal `agents/*.md`/`reference/*.md`
    cross-references rewritten to that tool's actual paths (Cursor's
    `.mdc`, Windsurf's flat `dsgn-*.md`, Gemini's `dsgn/` subdirectory,
    Copilot's inlined sections) instead of pointing at files that don't
    exist in that install.

### Added

- `--windsurf-global` (`~/.windsurf/global_rules.md`) and `--gemini-global`
  (`~/.gemini/GEMINI.md` + `~/.gemini/dsgn/`) — global installs for the two
  tools that have a real file-based global mechanism. Cursor and Copilot
  don't (Cursor's global is Settings-UI-only; Copilot's only file-based
  global is JetBrains-specific), so no `--cursor-global`/`--copilot-global`
  exist — documented as a real constraint, not an oversight.
- A hand-written condensed doc (`skills/dsgn/global-summary.md`, under
  6,000 characters) for `--windsurf-global` — Windsurf's global slot is
  hard-capped at 6,000 characters, so the full skill (~40k characters)
  cannot fit there regardless of file layout.
- Multi-file targets (`--copilot`, `--gemini[-global]`) now check every
  file they'd write for conflicts *before* writing any of them, so a
  blocked install never lands half-applied.
- The router logic in `SKILL.md` (and every per-tool build derived from it)
  now tells the agent to *ask* when it's genuinely unsure which style voice
  to use — leading with an actual recommendation and 1-2 alternatives, via
  a structured choice tool (e.g. `AskUserQuestion`) where the host supports
  one — instead of only saying "ask" with no guidance on how.
- Typography now gets explicit, checkable weight in the skill instead of
  being folded silently into "theming": `SKILL.md`'s build workflow lists
  font alongside color/spacing/radius/motion as something to read
  `reference/tokens.md` for before writing any UI, `workflow-checklist.md`
  gained an explicit typography checkpoint in both the Component Builder
  and Theming Specialist facets, and the two style-voice pre-output
  checklists that had no font line at all (`soft-minimal`,
  `neon-cyberpunk` — the other three already did) now do.

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
- **2026-08-29** — `/examples` gained 5 more real compositions (delete
  confirmation, FAQ, feedback form, install-flow progress/empty states,
  tooltip+popover toolbar), covering the 10 registry components that had no
  example yet. `/theming` gained a real palette generator: 3 new curated
  accent presets (Emerald, Blue, Rose) plus a fix for `--warm`'s light-mode
  value, which had no override at all and was landing at 1.68:1 contrast
  (now 5.43:1) — both caught by the generator's own live WCAG contrast
  math, not by hand. A new `/best-practices` page surfaces the real
  Do/Don't + pre-output checklist from each of the 5 style-voice skill
  files.
- **2026-08-29** — `/examples` gained a sticky "on this page" sidebar
  (same scrollspy `TableOfContents` component `/components` and
  `/philosophy` already use) now that the page has 12 sections. Also fixed
  two real site bugs found this session: a horizontal-scroll bug on every
  mobile width (decorative background elements bleeding past the viewport
  edge inflated `document.documentElement.scrollWidth`) and a stale
  `favicon.ico` left over from the original scaffold that read as
  Vercel's logo.
