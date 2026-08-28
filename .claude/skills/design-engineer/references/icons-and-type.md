# Icons and type

## Icon libraries

| Library | Character | Reach for it when |
|---|---|---|
| **Phosphor** | Six weights (thin/light/regular/bold/fill/duotone) of the same ~1,200-icon set. | You need weight consistency with a specific type of stroke (thin/light pairs well with a serif-editorial identity; regular/bold with a grotesk-heavy one) — the weight choice is a brand decision, make it deliberately. |
| **Lucide** | Fork of Feather Icons, single consistent stroke weight, ~1,500 icons, already a shadcn/ui dependency. | shadcn is already in the project — its default icon set is Lucide, and adding a second icon library on top reads as inconsistent (different stroke widths on the same grid read as sloppy immediately, even to non-designers). |
| **Radix Icons** | Small (~300), matched precisely to Radix Primitives' visual language, 15×15 grid. | Building directly on Radix Primitives without shadcn's styling layer and want icons that match its default affordances exactly. |
| **Heroicons** | Tailwind Labs' set, outline + solid variants, ~300 icons. | Project already uses Headless UI (same team, docs use these together) — otherwise Phosphor/Lucide have wider coverage. |

**Never mix two icon libraries in one interface.** Different sets use
different stroke widths, corner radii, and grid sizes — a Lucide icon next
to a Heroicons icon at the same font-size reads as visually "off" even to
someone who can't articulate why. If a specific icon is missing from the
project's chosen set, either pick the closest match within that set or add
one custom SVG matched to that set's stroke width — don't reach for a
second library for one icon.

## Fonts

### Loading

- **Next.js**: `next/font/google` or `next/font/local` — self-hosts the
  font at build time (no runtime request to Google Fonts, no layout shift
  from a late-loading `@font-face`, no third-party cookie/privacy concern).
  Always prefer this over a `<link>` to `fonts.googleapis.com` in a Next.js
  project.
- **Outside Next.js**: Fontsource (`@fontsource/fraunces` etc.) — same
  self-hosting benefit, works with plain Vite/CRA/any bundler via a single
  CSS import.
- **Variable fonts** (one file, continuous weight/optical-size/etc. axes)
  over static weight files where available — smaller total payload if
  you're using more than ~2 weights of a family, and lets you use
  fractional weights (`font-weight: 550`) or optical-size axes
  (`font-variation-settings: "opsz" 40`) that a static-weight file can't
  express. When loading via `next/font/google`, variable-capable families
  accept an `axes` option to opt into the non-default axes (e.g. Fraunces'
  `opsz`/`SOFT`/`WONK`) — check the specific family's available axes
  rather than assuming every variable font exposes the same set.

### Pairing (the part that actually makes type read as "designed")

The single biggest lever for "does this look premium or does this look
like a template": **do not default to a single sans-serif for everything.**
Pick two families with a clear job split:

- **Display face** (H1s, hero text, pull quotes) — something with
  personality: a variable serif (Fraunces, Newsreader), a wide/geometric
  grotesk (Bricolage Grotesque, Space Grotesk), or a condensed display face.
  Used large, often italic or with an unusual optical-size setting.
- **UI face** (body text, labels, buttons, nav) — a clean, highly legible
  sans at small sizes: Plus Jakarta Sans, Geist, General Sans, Söhne. This
  is where legibility at 14px matters more than character.
- **Mono face** (code, terminal-style UI, numeric/tabular data) — JetBrains
  Mono, Berkeley Mono, IBM Plex Mono. Tabular figures
  (`font-variant-numeric: tabular-nums`) for any table of numbers that
  needs columns to align.

**Banned as a display face** (reads as the un-styled default, instantly):
Inter, Roboto, Arial, Helvetica, system-ui with no font specified, Open
Sans. These are fine as a *UI* face in the right context (Inter at 14px in
a dense dashboard is a legitimate choice) — the failure mode is using one
of them at 64px as a hero headline, which is what every unstyled template
does by default.

### Checking a pairing before committing

Two families in the same category (two sans, two serif) rarely pair well —
contrast is the point. A quick gut-check: if you removed all styling except
font-family and size, could you tell the display text and body text apart
by *shape*, not just size? If not, the pairing isn't doing its job.
