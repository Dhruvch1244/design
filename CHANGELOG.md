# Changelog

All notable changes to `@dhruvchoudhary/dsgn` (the CLI, published on npm) are
documented here, in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format. The registry and site aren't independently versioned — they're
covered under **Registry** below, dated by when they actually shipped.

## [0.9.3] — 2026-09-05

### Fixed

- `rewriteAlias` (used by `add`, `diff`, and `update`) only ever rewrote
  `@/lib/utils` imports, and its early-return check looked only at `alias`/
  `utilsDir` — never `componentsDir`. Any multi-file registry item that
  imports a sibling component (`combobox`, `alert-dialog`, `pagination`, and
  all 8 recipes — 11 items total) shipped with a broken
  `@/components/dsgn/<name>` import the moment a project customized
  `componentsDir` in `dsgn.config.json`: the file itself landed at the new
  location, but its own import of another registry component still pointed
  at the untouched default path. Reproduced directly (`dsgn add combobox`
  into a project with `componentsDir: "src/ui"` produced a
  `combobox.tsx` that imported `@/components/dsgn/button`, which never
  existed) before fixing. Now rewrites `@/components/dsgn/<name>` too,
  independently of the `@/lib/utils` rewrite, whenever either `alias` or
  `componentsDir` differs from default.

## [0.9.2] — 2026-09-02

### Fixed

- An unrecognized flag (e.g. `dsgn add badge --yes`) used to fall through
  silently to positional args, so the CLI tried to fetch a registry item
  literally named after the flag and failed with a confusing 404
  (`Registry request failed (404): .../r/--yes.json`) instead of a clear
  error. Reproduced directly against the CLI before fixing, found while
  dogfooding a showcase build. Now rejected immediately as
  `Unknown option: --yes`, exit code 1.

## [0.9.1] — 2026-08-31

### Added

- `-v, --version` — prints the installed CLI version and exits. Missing
  entirely before this; an unknown-flag or bare invocation now reads as
  exactly that (falls through to the unknown-command path or the help
  screen) rather than being silently swallowed. Found while dogfooding a
  showcase build — verified directly rather than taken at face value: the
  build's own claim that the *old* unknown-command fallback exited `0`
  didn't reproduce (`--version` before this change already exited `1`, as
  expected for an unrecognized command) — the missing flag itself was the
  only real gap.

## [0.9.0] — 2026-08-30

### Added

- `dsgn skill --adopt` / `--adopt-global` — installs `dsgn-adopt`, the
  sibling skill that extracts an *existing* codebase's own real UI
  conventions into a portable skill file for that project, instead of a
  new voice silently competing with the style it already committed to.
  Claude Code only for now, same non-destructive-by-default install
  mechanism as every other `skill` target.

## [0.8.0] — 2026-08-30

### Added

- `dsgn list --json` — same component/recipe data as `list` and
  `list --recipes`, as machine-readable JSON instead of the human-readable
  table, for scripting against the registry.

## [0.7.0] — 2026-08-29

### Added

- `dsgn skill --project --agents-md` now installs a bridged combo instead of
  rejecting the pair as two targets: `.claude/skills/dsgn/` and `./AGENTS.md`
  both land as usual, and `CLAUDE.md` is made to start with an `@AGENTS.md`
  import (prepended above any existing content, never overwriting it) — the
  same pattern this repo's own `apps/site/CLAUDE.md` already uses. Closes
  the gap where Claude Code, still the one major AGENTS.md holdout, and the
  rest of the AGENTS.md-reading ecosystem needed two separate installs
  driven by two different source files.

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
- **2026-08-29** — `/components` gained real second examples for the 6
  sections that previously showed only one static case: Card (a compact
  stat-tile composition alongside the original), Command (an actual
  working jump-to-section palette instead of descriptive text), Tooltip
  (all 4 `side` positions), Dialog (a destructive-confirm variant next to
  the original), Separator (vertical orientation), and Progress (3
  values). `/best-practices` added to the main nav.
- **2026-08-29** — 2 more composed recipes added (`empty-state-cta`,
  `billing-summary`), installable via `dsgn add recipe:<name>` (5 recipes
  total). Root README now states explicitly why the registry stays on
  Radix primitives rather than following `shadcn init`'s July 2026 switch
  to Base UI as its default, instead of leaving the choice unstated.
- **2026-08-30** — `team-members` recipe added (Table + Avatar + Badge +
  DropdownMenu + Button — a role-badged member list with a per-row actions
  menu), installable via `dsgn add recipe:team-members` (6 recipes total).
  Root README also gained a GitHub stars badge alongside the existing npm
  version/downloads badges.
- **2026-08-30** — Two new primitive components, `breadcrumb` and
  `pagination` (25 components total) — both plain semantic markup with no
  Radix dependency, `pagination` built on Button's own variants. Two more
  recipes, `notification-list` and `onboarding-checklist` (8 recipes
  total). `/components` and `/examples` each gained a real, always-visible
  jump-to-section search at the top of the page (previously the only
  working one was buried mid-page in `/components`' Command demo, and
  `/examples` had no text search at all — only a desktop-only static
  sidebar). The site nav's `⌘K` search trigger is now reachable from the
  mobile menu too, not just the desktop pill. `generate-badge-data.mjs` now
  also writes a live `dsgn recipes` count badge alongside the existing
  `dsgn components` one, both embedded on the homepage and in the root
  README. CI (`ci.yml`) now runs the CLI's own 47-test suite on every pull
  request — previously it only ran at publish time, so a PR could break
  `add`/`skill`/`diff`/`update`/`doctor` without CI catching it.
- **2026-08-30** — Fixed a real production bug found while verifying the
  above on a phone-width production build: `/components` and `/examples`
  were loading pre-scrolled up to ~3000px down the page on mobile, before
  any of my changes this session — confirmed by tracing `scrollIntoView`
  calls against the static export. Cause: `cmdk` auto-selects a `Command`'s
  first item on mount and calls `scrollIntoView({block:"nearest"})` on it;
  for the pre-existing `Command` demos sitting off-screen (`/components`'
  "Command" section, `/examples`' "Component search" example), that
  cascaded into the whole page scrolling itself down on load. Fixed with a
  new `LazyMount` component (`apps/site/components/lazy-mount.tsx`) that
  defers mounting those two demos until they actually scroll into view —
  the new always-visible top-of-page search bars below don't need it, they
  were already confirmed harmless by the same trace.
- **2026-08-30** — The top-of-page search on `/components` and `/examples`
  replaced with `SectionSearchButton`, a compact pill (matching Nav's own
  search-trigger style) that opens a modal, instead of a permanently
  expanded inline list.
- **2026-08-30** — `/components` split into real per-component pages
  (`/components/button`, `/components/pagination`, ...) with a persistent,
  live-filtering sidebar in the spirit of Angular Material's docs site —
  25 static pages, sitemap updated, prev/next navigation between
  components. The index page keeps its gallery grid, now linking to real
  pages instead of same-page anchors.
- **2026-08-30** — Philosophy moved to the end of the site nav (was first).
  Added a new philosophy doc, `philosophy/motion.md` ("Motion & Animation"),
  explicitly sourced from this repo's own site rather than the three
  external case-study apps the 9 core pillars come from — it's the one
  place this project has a real, git-checkable animation decision to point
  at (`Reveal`'s state-vs-DOM-mutation bug, `CursorGlow`'s sibling-layer
  requirement, the `overflow-clip` scrollWidth investigation, and the
  `cmdk` scroll-jump bug fixed above). Not one of the core pillars —
  those stay strictly evidenced from lyric-viewer/file-viewer/review-grader
  by design.
- **2026-08-30** — Two new style voices, `corporate` (Apple/Google/Next.js-
  inspired: neutral, restrained, near-invisible shadows) and `startup`
  (dark, gradient-accented, oversized confident type) — 7 voices total.
  Added as real `skills/dsgn/agents/*.md` files (bundled into every skill
  install target: Claude, Cursor, Windsurf, Copilot, Gemini, AGENTS.md) and
  as a live, switchable "Voice" control on the site itself (`VoicePicker`,
  in both `AppearanceMenu` and `RemixPanel`) — `[data-voice="..."]` CSS
  blocks in `globals.css` re-skin background/surface/text/border/radius/
  shadow/glow per voice, orthogonal to the existing accent-color picker.
- **2026-08-30** — The site moved off GitHub Pages to Vercel. Removed
  `output: "export"` from `next.config.ts` (every route was already
  static/SSG, so this is a strict capability increase — route handlers,
  on-demand rendering, ISR all become available if ever needed — not a
  behavior change for anything that exists today), deleted the now-dead
  `.github/workflows/deploy-site.yml` (Vercel deploys via its own git
  integration, not a GitHub Action) and `apps/site/public/CNAME` (a
  GitHub-Pages-specific custom-domain file Vercel doesn't use), and
  switched `playwright.config.ts`'s e2e smoke suite from serving the old
  static `out/` export to `next start` against the real production build —
  the same server Vercel actually runs. `trailingSlash: true` stays, since
  every existing indexed URL and internal link already assumes it.
- **2026-08-30** — Fixed a real registry component bug, found live on
  `/examples`' "Component search" demo via the Chrome extension: `cmdk`
  auto-selects a `Command`'s first item the instant it mounts (the same
  behavior behind the scroll-jump bug fixed earlier), so `CommandItem`'s
  solid `bg-accent`/`text-accent-foreground` "selected" block was on-screen
  before any real user interaction, every time — reading as a stray
  highlighted row rather than a keyboard-nav state. Softened to a
  `bg-accent/12`/`text-accent` tint (matching the existing "soft" button
  variant), in both `packages/registry/src/components/command/command.tsx`
  (the shipped registry source) and the site's own installed copy —
  verified visually via the Chrome extension against the dev server.
- **2026-08-30** — New sibling skill, `skills/dsgn-adopt/`, for the reverse
  situation from `skills/dsgn/`: instead of building UI from this repo's
  own philosophy/registry/voices, it extracts an *existing* codebase's own
  real, already-shipped UI conventions (component variant names, primitive
  library, styling approach, design tokens) into a portable skill file for
  that project — grounded in real files it actually read, never invented,
  the same discipline `philosophy/AGENTS.md` holds itself to. Verified by
  hand against a real, unrelated Next.js + Base UI + shadcn codebase (not
  one of this repo's own dependencies): correctly identified Base UI over
  Radix, the repo's real 6-variant Button vocabulary (no `accent` variant),
  its `data-slot` convention, and its OKLCH token system — all things a
  training-data-default guess would have gotten wrong. Not yet bundled
  through the CLI's `skill` command (that command's targets and
  `scripts/sync-skill.mjs`'s per-tool builds are scoped to the voice-router
  skill specifically) — copy the directory directly for now. Also fixed two
  stale "five voices" references missed in the corporate/startup pass
  earlier this session: `skills/dsgn/SKILL.md`'s own frontmatter
  `description`, and `skills/dsgn/README.md` (which also still claimed "no
  automated sync" despite `scripts/sync-skill.mjs` existing).
- **2026-08-30** — Six new components closing the gaps found by the prior
  gap-analysis pass: `alert-dialog` (destructive-confirm, built on
  `@radix-ui/react-alert-dialog`, its `Action`/`Cancel` reusing Button's own
  `destructive`/`outline` variants rather than duplicating button styles),
  `sheet` (a 4-side slide-in panel on the existing `@radix-ui/react-dialog`
  dependency, no new package needed), `combobox` (Button + Popover +
  Command composed into a real searchable-select, matching trigger width
  via Radix's `--radix-popover-trigger-width`), `toast` (an imperative
  `toast()` API plus a `<Toaster/>`, on `@radix-ui/react-toast`, hand-rolled
  transition classes rather than pulling in the `tailwindcss-animate`
  plugin this project doesn't otherwise depend on — matching the precedent
  `accordion` already set), `toggle-group`, and `slider` — 31 components
  total. Fixed a real `position: fixed` containing-block bug surfaced while
  verifying `toast` live: any ancestor with a non-`none` CSS `transform`
  (including `translateY(0)`) creates a new containing block for `fixed`
  descendants, and the site's own scroll-`Reveal` wrapper around every
  component demo does exactly that — unlike `Dialog`/`Sheet`/`AlertDialog`,
  which already escape it via Radix's own internal `Portal`, `ToastViewport`
  doesn't self-portal (matching upstream convention that assumes root-level
  mounting), so the site's `ToastDemo` now portals its own `<Toaster/>` to
  `document.body` directly rather than changing the shipped registry
  component's behavior for every consumer.
- **2026-08-30** — Five more components, from a follow-up gap-analysis pass
  scoped specifically to real Radix primitives this registry didn't already
  cover, each adding zero new non-Radix dependencies: `collapsible` (a
  single show/hide section, shipped as a bare unstyled re-export since a
  single collapsible has too many real layouts to impose one look — distinct
  from `accordion`'s multi-item model), `toggle` (the singular sibling of
  `toggle-group`, same CVA size/variant shape), `hover-card` (same shape as
  `popover` but hover-triggered, using Radix's real default 700ms/300ms
  open/close delay rather than an invented instant one), `scroll-area`
  (custom-styled scrollbars for a fixed-height panel), and `context-menu`
  (right-click triggered, same compound shape as `dropdown-menu`) — 36
  components total. Explicitly did not build a Date Picker, Data Table,
  Resizable Panels, or Input OTP in this pass: none have a real Radix
  primitive, and each would need its own new third-party dependency
  (`react-day-picker`, `@tanstack/react-table`, `react-resizable-panels`,
  `input-otp`) this registry doesn't currently carry.
- **2026-08-30** — Fixed a real, live bug: `alert-dialog`, `combobox`, and
  `pagination` each imported a sibling component by its `src/` location
  (e.g. combobox's `from "../button/button"`), and
  `build-registry.mjs`'s `rewriteImportsForConsumers` only ever rewrote the
  recipe shape (`../components/<name>/<name>`), never the plain
  component-to-component shape. `packages/registry`'s own `tsc --noEmit`
  never caught it — it typechecks `src/`, where those relative imports are
  still correctly resolvable on disk; the bug only exists once the build
  step flattens every component into one `components/dsgn/` directory for
  a consumer. Confirmed live and broken on the deployed registry before the
  fix (`curl https://design.dhruvchoudhary.com/r/combobox.json` shipped the
  unresolved import verbatim) — any real `npx @dhruvchoudhary/dsgn add
  alert-dialog`, `add combobox`, or `add pagination` got a file that
  couldn't build. Found by dogfooding: installing dsgn into a real,
  separate showcase project via the actual CLI, not the internal site.
  Fixed the regex, and added a new permanent check,
  `scripts/lint-registry-imports.mjs` (wired into `ci.yml` right after
  `build:registry`), that scans the *built* `dist/r/*.json` output —
  not `src/` — for any remaining unresolved relative import, so this
  specific failure class can't ship silently again.
- **2026-08-30** — Five more real, live bugs surfaced by the same dogfooding
  session, all fixed: `combobox`'s popover used Tailwind v3's bare
  `w-[--radix-popover-trigger-width]` custom-property shorthand, which
  compiles to invalid CSS (`width: --radix-popover-trigger-width`, no
  `var()`) under this project's Tailwind v4 — confirmed in the site's own
  compiled output — so the popover never actually matched its trigger's
  width; fixed to the explicit `var(...)` form already used correctly by
  `select`. `Progress`'s indicator assumed `value` was already a 0–100
  percentage and ignored `max` entirely, so a non-default `max` silently
  rendered the wrong fill; now scales by `value / max`. `Slider` spread
  `aria-label` onto `Root`, but Radix puts `role="slider"` on each `Thumb`,
  so the label never reached assistive tech — fixed for single-thumb
  sliders automatically, and added a new `thumbLabels?: string[]` prop for
  range sliders, since one shared name can't describe two independent
  handles (the `/examples` range-slider demo now passes
  `thumbLabels={["Minimum price", "Maximum price"]}` instead of one
  ambiguous `aria-label`). `Checkbox`'s indeterminate state rendered as a
  plain unfilled box with a full checkmark showing anyway — Radix renders
  `Indicator`'s children for both `checked` and `indeterminate` — now
  filled the same as checked, with a dash icon swapped in instead of the
  checkmark via a `[[data-state=indeterminate]_&]` selector. `CommandDialog`
  had no `role`/`aria-modal` on its actual dialog surface; added
  `role="dialog"` `aria-modal="true"` plus a new optional `label` prop
  (defaults to "Command palette") for `aria-label` — confirmed `dsgn
  doctor`'s a11y heuristic flag count on a fresh install dropped from 2 to
  1, the remaining one being the backdrop's own click-to-dismiss `div`,
  which doesn't need to be keyboard-focusable since Escape already closes
  it. Also fixed a real doc-drift gap: `component-registry.md` listed
  Button's variants but omitted `destructive`, which `AlertDialogAction`
  actually depends on.
- **2026-08-31** — New skill workflow step, "Before building: confirm the
  brief" (`skills/dsgn/SKILL.md`, plus a condensed version in
  `global-summary.md` and `/skill`'s preview) — before installing anything,
  restate the request as a structured brief (what's being built, its scope,
  the voice chosen and why, any stated constraints, anything genuinely
  unclear) and wait for confirmation, rather than building straight from a
  possibly-underspecified first message. Skipped only when the user's own
  request already reads like a full spec, so it doesn't add friction to
  requests that don't need it. Propagated to every skill target (Claude
  Code, Cursor, Windsurf, Copilot, Gemini, the flattened AGENTS.md doc) via
  `sync-skill.mjs`; confirmed the Windsurf global summary still fits its
  hard 6,000-character cap after the addition. Also fixed a stale "25
  components" count in `global-summary.md`, missed in an earlier pass since
  that file isn't derived from `registry.json` the way the other reference
  docs are.
- **2026-09-02** — Fixed a real, cross-validated accessibility bug:
  `badge`, `button`, `input`, `select`, `slider`, `tabs`, and `textarea` all
  wrote `ring-offset-2` without also setting an explicit ring-offset color,
  so they inherited Tailwind's hardcoded `#fff` default — a bright white
  halo around every focused control on any dark voice (six of the seven
  style voices, including this site's own flagship). `checkbox`,
  `radio-group`, and `switch` already had this right (`ring-offset-background`
  alongside `ring-offset-2`); the other seven now match that pattern.
  Confirmed via the compiled CSS output, not just the source diff. Found
  independently twice — once as a fix a showcase build made unprompted in
  its own installed copies, once as a dogfooding report with a
  `getComputedStyle` reproduction — before landing here. Also documented a
  real, A/B-tested gap: `accordion` (and, more mildly, `breadcrumb`) ships
  components that reference `--ease-fluid`/`--animate-accordion-*` tokens
  `dsgn add` never injects, so a fresh consumer's accordion silently loses
  its expand/collapse animation entirely unless those are added by hand.
  `registry.json`'s descriptions and `component-registry.md`'s Accordion/
  Breadcrumb entries now spell out the exact required CSS, not just point
  at this site's own `globals.css` to go copy from.
- **2026-09-02** — Fixed a real, live bug in `toast`: `ToastClose` renders
  with `opacity-0 group-hover:opacity-100`, but the `Toast` root never
  declared itself as the `group` — so a mouse user hovering a toast saw no
  dismiss button at all, only `focus:opacity-100` worked (keyboard-only).
  This wasn't voice- or consumer-specific: the same missing class shipped
  in this site's own mirrored copy and was live on every toast here too,
  confirmed by checking the actual toaster wiring for a `group` className
  injected some other way (there wasn't one) before fixing. One word
  (`group` added to the root's base class list) fixes it in both
  `packages/registry/src/components/toast/toast.tsx` and
  `apps/site/components/dsgn/toast.tsx`. Found independently by the
  showcase #5 (VOLTGATE, developer console) build while dogfooding; verified
  directly via a Playwright hover test against the live component before
  landing here, not taken on the showcase's own report alone.
