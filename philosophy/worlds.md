# Worlds — one content model, many presentations

Pillar #10 in `AGENTS.md`, expanded. Sourced from **dhruvchoudhary.com**
(`src/worlds/`, `src/data/worlds.ts`, `src/worlds.css`), where six worlds
present the same projects, experience and contact data — and from the bugs
that shipped while building it, which are the reason several rules below
exist at all.

A *voice* (the seven in `skills/dsgn/agents/`) decides what UI **looks and
moves like**. A *world* goes one level deeper: it is a voice **plus** a
presentation metaphor **plus** a copy dictionary. Same facts, different
shape.

## The three layers

| Layer | Lives in | Changes per world? | Example |
|---|---|---|---|
| Content model | typed data (`data/content.ts`) | **never** | `{ slug: 'file-viewer', year: 2026, kind: 'desktop app', stat: 'search 2M rows: 1827ms -> 79ms', stack: [...] }` |
| Copy dictionary | one file keyed by entity id (`worlds/copy.ts`) | yes — one column per world | Terminal: `perf(search): reject rows on raw bytes`; Pit Lane: "Purple sector. 79 milliseconds on a 2 GB lap." |
| Presenter + tokens | one component per world + a `[data-world]` token block | yes | Terminal renders `ls -la`; Pit Lane renders a timing tower |

If a fact appears in a presenter or in the copy dictionary as a literal —
a number, a date, a name that isn't the entity's own — it's in the wrong
layer.

## The metaphor map

Before writing a presenter, fill this table for the world. Every content
type the site actually has needs a row; a world that maps only the project
list and falls back to the default layout for the rest reads as a costume.

| Content type | Terminal | Arcade | Iron | Pit Lane | Night Shift |
|---|---|---|---|---|---|
| Entity list | `ls -la` + each `README.md` | level select of cartridges | program sheet + session cards | race classification / timing tower | polaroid wall |
| One entity's headline | commit message | stage + boss | lift + coach's note | team radio | journal entry + cat's verdict |
| Profile | `whoami`, `cat about.txt` | PLAYER 1 card | athlete card | driver card | "hi, I'm…" note |
| Timeline | `cat experience.log` | HI-SCORES | training history | career | "where I am by day" |
| Metric | `# comment` on the `ls` row | ★ win condition | PR | fastest lap / gap | paws |
| Call to action | `contact --list`, `sudo hire-me` | CONTINUE? 9… | book a session | box, box | leave a note |
| Interaction | a working prompt | ▶ START | — | pick a car → onboard | — |

The same exercise works for any brief. A recipe site's worlds might be
"cookbook", "kitchen ticket rail", "grandma's index cards" — the table is
the design; the CSS comes after.

## Rules

### Derived visuals encode real fields

A stat bar is a chart. In the portfolio, Arcade's TECH bar is
`stack.length / 8`, NEW is `year - 2022`, Iron loads one plate per
technology in the real stack, Pit Lane's tyre compound comes from `kind`.
None of them are typed in per project. If a number can't be derived from a
field, add the field to the content model (that's how `year`, `kind` and
`stat` came to exist) — don't invent it in the presenter.

### Copy is a dictionary, and the fact stays in the content model

`copy.ts` holds `commitLine[slug]`, `arcadeStage[slug]`, `teamRadio[slug]`,
… — one record per world, keyed by the same slug as the content model.
Copy is allowed to *paraphrase* a fact in voice ("79 milliseconds on a 2 GB
lap"), never to introduce a new one. Whimsy is fine when it's obviously
whimsy (the cat's verdict); a fabricated metric is not.

### Interaction maps to real navigation

Terminal's `open selecta` calls the same router navigation the default
Projects card links to; `world arcade` calls the same setter the world
picker uses; unknown input says so (`command not found (try help)`). A
metaphor's interaction is a second way to reach the same place, never a
dead end that only exists inside the joke.

### Opt-in, persistent, shareable, flash-free

- The conventional presentation stays the default; worlds are a choice.
- The choice is applied **before first paint** by an inline script that
  reads the URL (`?world=…`) first, then storage — the same pattern as a
  dark-mode pre-paint script. Without it, every load flashes the default.
- A world is a link: `?world=pitlane` opens it for someone else.
- World-only fonts load on demand (the inline script injects that world's
  stylesheet), so visitors who never switch download none of them.

### Overlays render in a portal, not where they're triggered

Shipped bug: the world picker rendered inside the nav. On phones the nav is
a sticky bar with `backdrop-filter`, and in iOS Safari a `backdrop-filter`
ancestor becomes the containing block for `position: fixed` descendants —
the "fullscreen" dialog was trapped in the top bar, cut off and untappable.
Chromium didn't reproduce it, so desktop testing passed. Fix: render every
overlay (pickers, lightboxes, sheets) through a portal to `<body>`. The
same trap applies to `transform`, `filter`, `perspective` and `contain`
ancestors, so "it's not inside a filtered element today" isn't a reason to
skip the portal.

### Every world passes the same checks

A world is not exempt from the rest of this philosophy or from
`motion.md`: `prefers-reduced-motion` stops its backdrop and blinking
cursors; a narrow phone width (~390px) gets its own layout pass (the
timing tower moves the onboard view below and scrolls to it on pick);
contrast holds in the world's own palette (a light world like Iron needs
its own heatmap/opacity values — the dark-tuned defaults vanish on cream).

## Anti-patterns

- **The costume.** Recolor + new font, same layout, same copy. That's a
  voice; call it one.
- **The fork.** A second copy of the content with tweaked wording per
  theme. The first edit makes them disagree.
- **The decorative number.** A meter, a score, a "level" that isn't
  computed from anything.
- **The dead-end gimmick.** A terminal that only accepts the commands
  shown in the demo, or a picker whose result can't be linked to.
