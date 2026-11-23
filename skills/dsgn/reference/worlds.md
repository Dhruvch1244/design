# Worlds — building one content model in several presentations

Practical companion to pillar #10 (`reference/philosophy-summary.md`,
sourced from `philosophy/worlds.md`). Read this when the brief asks for
"themes," "modes," "skins" or "worlds" that should feel *different*, not
just recolored — or when you pick one of the five world agents
(`agents/terminal-phosphor.md`, `agents/arcade-synth.md`,
`agents/iron-poster.md`, `agents/pit-lane.md`, `agents/night-shift.md`).

A **voice** changes what the UI looks and moves like. A **world** is a
voice **plus** a presentation metaphor **plus** a copy dictionary, over one
content model nobody forks.

## Build order

1. **Content model first.** Put every fact in typed data. Add the fields
   presenters will need to *derive* visuals — in the reference site that
   meant `year`, `kind`, and one headline `stat` per project. If a world
   needs a number, it becomes a field here, not a literal in a component.
2. **Fill the metaphor map** for each world before any CSS — every content
   type the product actually has (entity list, entity headline, profile,
   timeline, metric, call to action, interaction). See each world agent's
   "Presentation metaphor" section for a filled-in example.
3. **Write the copy dictionary**: one record per world, keyed by the content
   model's ids. Paraphrase facts in voice; never introduce new ones.
4. **Token block per world** under `[data-world="…"]` (or `[data-voice]`),
   re-pointing the raw values in `reference/tokens.md` — `--void`,
   `--surface`, `--ink*`, `--rule`, `--radius-scale`,
   `--shadow-ambient-raw`, `--glow-accent`. No new token names.
5. **One presenter component per world** for each page that changes shape;
   the default presentation stays the conventional one.
6. **Mechanics**: pre-paint script (URL `?world=` → storage → default), a
   persisted choice, a picker rendered through a **portal to `<body>`**,
   world fonts loaded on demand, optional per-world backdrop that respects
   `prefers-reduced-motion`.

## Skeleton

```ts
// content.ts — facts, once
export type Project = { slug: string; name: string; year: number; kind: Kind; stat: string; stack: string[] };

// copy.ts — voice, keyed by the same slug
export const commitLine: Record<string, string> = { selecta: 'feat(planner): prompt -> beatmatched set' /* … */ };
export const teamRadio: Record<string, string> = { selecta: 'Copy, building the set now. Drop in 32 bars.' /* … */ };

// WorldPage.tsx — presenter per world, default keeps the original page
const PAGES: Partial<Record<WorldId, ComponentType<{ page: 'home' | 'projects' }>>> = {
  terminal: TerminalWorld, arcade: ArcadeWorld /* … */
};
```

```html
<!-- index.html: apply before first paint, same idea as a theme script -->
<script>
  var w = new URLSearchParams(location.search).get('world');
  try { if (!(w in FONTS)) w = localStorage.getItem('world'); } catch (e) {}
  if (w in FONTS) { document.documentElement.dataset.world = w; /* inject FONTS[w] stylesheet */ }
</script>
```

## Derivations that worked (and stayed honest)

| Visual | Derived from |
|---|---|
| Arcade TECH bar | `stack.length / 8` |
| Arcade NEW bar | `year - 2022` |
| Iron plates on the bar / sets in the log | one per entry in `stack` |
| Pit Lane tyre compound | `kind` (desktop app = soft, platform = hard, …) |
| Night Shift paws | `stack.length`, clamped 3-5 |
| Any "screens" badge | number of real screenshots for the entity |

Gaps between cars, lap numbers and car numbers in Pit Lane are cosmetic
*labels*, not claims — they never sit next to a unit that implies a
measurement of the project.

## Checks before calling a world done

- [ ] Every fact on screen traces to the content model; `grep` the
      presenter for numeric literals near units
- [ ] Every content type in the metaphor map is actually re-presented
- [ ] Metaphor interactions resolve to the same routes/links as the default
- [ ] `?world=<id>` opens the world directly; reload keeps it; no flash
- [ ] Overlays (picker, lightbox) are portalled — test on iOS Safari or
      emulate with a `transform` on the nav, since Chromium hides the bug
- [ ] ~390px width checked per world; reduced motion stops backdrops
- [ ] Contrast holds in each world's own palette (light worlds especially)
