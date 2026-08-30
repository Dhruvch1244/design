# dsgn — design philosophy (condensed global summary)

Global summary of the `dhruvch1244/design` philosophy + component registry,
loaded into every Windsurf workspace. This is a condensed excerpt — for the
full router, seven style-persona voices, and reference docs, run
`npx @dhruvchoudhary/dsgn skill --windsurf` in a specific project to install
the complete `.windsurf/rules/dsgn-*.md` set.

## The philosophy — nine pillars, condensed from philosophy/AGENTS.md

1. Separation of concerns is physical — code that must never depend on the
   UI framework goes in a package that cannot import it.
2. One deliberate scheduler for concurrent/background work, never an ad hoc
   thread/task per feature.
3. Non-destructive by default — never mutate the source of truth in place;
   model undo as an overlay, not an in-place mutation.
4. Respect scale from day one — measure real performance; never guess from
   a vibe.
5. Trust the data — gatekeep structure, not content a user is trying to
   view.
6. Prefer the framework's current idiom over the one you remember from
   training data.
7. Reach for the standard library before a dependency, for anything small
   and well-understood.
8. Documentation explains *why*, never *what* — a comment restating the
   code is a liability.
9. Async is a correctness property in UI runtimes, not a performance
   nice-to-have.

## The component registry

25 real React + Tailwind + CVA components, installed with
`npx @dhruvchoudhary/dsgn add <name>` — copied into your project's own
source tree, not a runtime dependency. Full list: `npx @dhruvchoudhary/dsgn
list`.

## Seven style voices — pick one when building or restyling UI

- **glass-dark-cyan** — dark OLED, cyan accent, glass panels. Default for
  dev-tool/SaaS/technical UI.
- **editorial-warm** — warm paper background, serif display type. For
  portfolios, agencies, content-first sites.
- **brutalist-mono** — pure black/white, thick borders, monospace-forward.
  For developer tools and changelogs.
- **soft-minimal** — silver-grey, huge whitespace, ambient shadow instead
  of borders. For consumer/wellness products.
- **neon-cyberpunk** — near-black with saturated multi-color glow. For
  gaming, music, entertainment.
- **corporate** — near-white/near-black neutral, one restrained accent,
  near-invisible shadows. For enterprise SaaS and developer platforms.
- **startup** — dark saturated background, gradient accent, oversized
  confident type, overshoot motion. For launches and marketing sites.

Pick order: explicit user request, then existing project brand cues, then
project type, then ask if genuinely unsure — a wrong visual direction is
expensive to unwind after components are already built in it.

Install the project-level rules above for the full detail behind each
voice, the real component variant names, and the token system.
