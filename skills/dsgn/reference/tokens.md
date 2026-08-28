# Design tokens

Sourced from `apps/site/app/globals.css`. This site's token system is a
two-layer indirection deliberately built for reskinning:

```
raw hex value (--void, --cyan, ...)
  → semantic alias (--background, --accent, ...), often var(...)-referencing a raw value
    → Tailwind v4 @theme inline token (--color-background, ...), referencing the semantic alias
```

**Why this matters for a style agent**: to reskin the whole site, change the
*raw values* in the first layer (or override the semantic aliases directly
under a different `data-theme`/`data-accent` selector) — never rename or add
new variables at the Tailwind-token layer. Every component in the registry is
written against the semantic names (`bg-accent`, `text-muted-foreground`,
`border-border`), so changing what those semantic names *point to* reskins
every component with zero component-source edits. This is the real mechanism
behind the site's own claim: "Reskin all of it for your own brand."

## Raw values — dark (default)

```
--void: #07080c            /* page background */
--surface: #0d0f16         /* card background */
--ink: #f2f4f8              /* primary text */
--ink-soft: #a8afc0         /* secondary text */
--ink-faint: #666e82        /* tertiary/disabled text */
--rule: #1d2130              /* borders */

--cyan: #28e0ec              /* default accent */
--cyan-soft: #7aecf4
--warm: #f2b45e
--magenta: #ff2e7e
--violet: #9a6bff

--glass: #07080c99           /* translucent panel fill */
--glass-strong: #0d0f16e0
```

## Raw values — light (`[data-theme="light"]` override)

```
--void: #f7f5f2
--surface: #ffffff
--ink: #14151a
--ink-soft: #43454f
--ink-faint: #6c6f7c
--rule: #e0ded8

--cyan: #0e8b96              /* darkened for AA contrast on a light bg */
--cyan-soft: #0a6a73
--magenta: #d21266
--violet: #6a3ce0

--glass: #ffffffe6
--glass-strong: #fffffff2
```

Note the accent hues themselves shift darker in light mode (not just the
background) — a straight color swap without also adjusting lightness for
contrast is a common mistake when reskinning; check actual contrast ratio,
don't assume the dark-mode hue works unchanged on a light background.

## Accent presets (`[data-accent="..."]`)

Four swappable accent presets exist, each just repointing `--accent`:
`cyan` (default), `violet`, `magenta`, `warm`. Both `data-theme` and
`data-accent` are set on `<html>` before first paint via an inline script
reading `localStorage`, avoiding a flash of the wrong theme.

## Semantic aliases (theme-independent names components use)

```
--background → --void        --foreground → --ink
--card → --surface            --card-foreground → --ink
--primary → --ink             --primary-foreground → --void
--secondary → #151822 (dark)  --secondary-foreground → --ink
--accent → --cyan (or whichever preset is active)
--accent-foreground → --void
--muted → #12141c (dark)      --muted-foreground → --ink-soft
--destructive → #ff5470 (dark)
--border → --rule
--ring → color-mix(in srgb, var(--accent) 55%, transparent)
```

## Radius scale

```
--radius-scale: 1              /* the one knob — everything below multiplies it */
--radius-sm:  calc(0.25rem * var(--radius-scale))
--radius-md:  calc(0.5rem  * var(--radius-scale))
--radius-lg:  calc(0.75rem * var(--radius-scale))
--radius-xl:  calc(1rem    * var(--radius-scale))
--radius-2xl: calc(1.25rem * var(--radius-scale))
--radius-3xl: calc(1.5rem  * var(--radius-scale))
```

A style that wants near-zero corners (e.g. a brutalist voice) should override
`--radius-scale` toward `0`, not hand-edit every individual radius value.

## Motion

```
--ease-fluid: cubic-bezier(0.32, 0.72, 0, 1)
```

Every transition in the real site uses this single custom easing curve
(300ms–900ms range depending on element weight), never the CSS defaults
(`ease`, `ease-in-out`) and never `linear`.

## Fonts

```
--font-sans: var(--font-hanken)      /* Hanken Grotesk — body */
--font-display: var(--font-bebas)    /* Bebas Neue — headings, uppercase, wide tracking */
--font-mono: var(--font-jetbrains)   /* JetBrains Mono — code, meta, keyboard hints */
```

## Shadows

```
--shadow-ambient: <ambient inset highlight + soft drop shadow recipe>
--shadow-glow: <1px ring at 25% accent opacity + soft accent-colored glow>
```

Both are composited from `color-mix(in srgb, var(--accent) N%, transparent)`
so they automatically follow whichever accent preset is active — never
hardcode a shadow color, derive it from `var(--accent)` the same way.
