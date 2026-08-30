---
name: dsgn
description: Build UI with the real @dhruvchoudhary/dsgn component registry and the dhruvch1244/design philosophy, in one of five distinct visual voices, routed automatically by project context or explicit request.
---

# dsgn — design-philosophy-driven UI builder

This skill teaches Claude to build interfaces using two real, checkable things
from the `dhruvch1244/design` repo, not invented conventions:

1. **A design philosophy** (`reference/philosophy-summary.md`, sourced from
   `philosophy/AGENTS.md`) — nine rules extracted from decisions that actually
   shipped in three real apps, not aspirational values. Applies to *any*
   code you write while this skill is active, not just UI code.
2. **A real, installable component registry** (`reference/component-registry.md`,
   sourced from `packages/registry/registry.json`) — 25 components + a utils
   module, installed with `npx @dhruvchoudhary/dsgn add <component>`. Files
   are copied into the consumer's own source tree, not imported from a
   package at runtime — the consumer owns and can edit them the moment they
   land. There is nothing to eject later.

## When to use this skill

Use it whenever the task is building or restyling UI — a page, a component
library, a design system, a "make this look premium" request — especially
when the project is a fresh scaffold with no established visual language yet,
or when the user explicitly asks for one of the five voices below by name.

Don't use it to override an established, working design system already in
place in the target project unless the user asks for a restyle. This skill
is additive, not a replacement for a project's existing conventions.

## The five style agents

Each file in `agents/` is a complete, self-contained persona: a visual style
plus that style's take on all five workflow facets (component building, page
composition, theming, accessibility review, motion). None of them contradict
`reference/philosophy-summary.md` — the philosophy governs code structure and
correctness regardless of which visual voice is chosen; the agents only
differ in what the UI *looks and moves like*.

| Agent | Voice | Pick it when |
|---|---|---|
| `agents/glass-dark-cyan.md` | Dark OLED, cyan accent, backdrop-blur glass panels, Bebas Neue display type — this repo's own real site | Default choice for anything dev-tool/SaaS/technical, or when the user says "like the dsgn site" |
| `agents/editorial-warm.md` | Warm paper background, serif display type, muted sage/espresso, flat hairline-bordered cards | Portfolios, agencies, content-first sites, anything the user calls "warm," "editorial," or "less techy" |
| `agents/brutalist-mono.md` | Pure black/white, thick borders, monospace-forward, hard offset shadows, near-zero radius | Developer tools, changelogs, anything the user calls "raw," "brutalist," or "no-nonsense" |
| `agents/soft-minimal.md` | Silver-grey/white, huge whitespace, ultra-diffused shadows, calm micro-motion | Consumer/health/wellness products, anything the user calls "calm," "minimal," or "airy" |
| `agents/neon-cyberpunk.md` | Near-black with saturated multi-color neon glow, tight bold display type, high-intensity motion | Gaming, music, entertainment, anything the user explicitly asks for "cyberpunk," "neon," or "loud" |

## Router logic

Apply these signals in order — the first one that matches decides:

1. **Explicit request wins.** If the user names a style directly ("make it
   brutalist," "give me the neon one," "like your own site"), use that agent.
   Don't second-guess an explicit ask with a vibe inference.
2. **Existing brand cues win next.** If the target project already has a
   color palette, font choice, or component library that clearly leans one
   direction (e.g. an existing warm cream palette with serif headings),
   match that agent rather than introducing a new voice on top of an
   established one.
3. **Project type is the fallback default.** Use the table above's "Pick it
   when" column against what the project actually is (a SaaS dashboard, a
   portfolio, a dev tool, a wellness app, a game).
4. **When genuinely unsure — between two candidates, or with no strong
   signal at all (a blank scaffold, no explicit ask) — stop and ask, don't
   silently pick.** A wrong visual direction is expensive to unwind after a
   dozen components are built in it; one clarifying question up front is
   cheap. Ask as a structured choice, not an open-ended question:
   - Lead with your actual recommendation, named and justified in one line
     (which signal from above pointed at it, even a weak one).
   - Offer 1–2 sensible alternatives, each with an equally short reason.
   - If the host environment has a structured choice/question tool (e.g.
     Claude Code's `AskUserQuestion`), use it so the user picks from
     concrete options instead of writing free text back.

## How the handoff actually works

This skill degrades gracefully depending on what the host environment
supports:

- **If sub-agent dispatch is available** (a `Task`/`Agent`-style tool that
  can launch a fresh agent with its own instructions), the router should
  dispatch the chosen `agents/*.md` file's full content as that sub-agent's
  brief, along with the relevant `reference/*.md` files.
- **If it isn't** — a single Claude session reading this skill directly with
  no sub-agent capability — apply the chosen agent's guidance inline: read
  the agent file, adopt its rules for the rest of the session (or until the
  user asks for a different voice), and proceed normally.

Either way, the *content* of the decision is the same; only the mechanism
differs.

## Building, once a style is chosen

1. Read `reference/component-registry.md` for the real component list, real
   variant names, and real dependencies — never invent a prop or variant
   that isn't listed there.
2. Read `reference/tokens.md` before writing any color, spacing, radius,
   motion-timing, **or font** value — typography is not an afterthought
   here. A visitor registers a site's typeface before they register almost
   anything else about it; picking the wrong one (or the right one used
   wrong — body copy in the display face, or vice versa) undercuts every
   other correct decision in the build. The chosen style agent's own
   "Typography" section names the exact `--font-display`/`--font-sans`/
   `--font-mono` roles for that voice — apply them exactly as specified,
   never substitute a system font or introduce a new one. It should never
   introduce new CSS variable names that don't exist in the token system
   either, for fonts or anything else, since that breaks the "reskin
   without touching component source" promise the whole registry is built
   around.
3. Install real components with `npx @dhruvchoudhary/dsgn add <name>` (or
   `<name1> <name2> ...` for several at once) rather than hand-writing a
   component that already exists in the registry.
4. Apply `reference/workflow-checklist.md`'s five facets in the chosen
   agent's voice before considering the work done.

## Source of truth

Everything in `reference/` is derived from real files in this repo at the
time this skill was written:

- `philosophy/AGENTS.md` (and its siblings `architecture.md`,
  `ui-interaction.md`, `code-style.md`, `anti-patterns.md`)
- `packages/registry/registry.json` and the component sources under
  `packages/registry/src/components/`
- `apps/site/app/globals.css` (the token system)
- `apps/site/components/motion/reveal.tsx` and `cursor-glow.tsx` (the real
  motion primitives)

If the upstream repo changes, these reference docs can drift — treat them as
a snapshot, and prefer the live repo when the two disagree.
