# Voice-Token Audit

Audited all 16 newly added components against the `[data-voice]` contract in
`apps/site/app/globals.css` (`--radius-scale`, `--shadow-*`, `--ease-fluid`),
plus `dialog`, `card`, and `button` as a pre-existing baseline for comparison.

**Components checked:** label, form, calendar, date-picker, data-table,
drawer, navigation-menu, menubar, multi-select, carousel, resizable,
input-otp, kbd, file-upload, stepper, timeline, dialog, card, button.

## Method

Grepped every component file for the violation patterns called out in the
brief: Tailwind arbitrary-value syntax (`rounded-[...]`, `shadow-[...]`,
`duration-[...]`, `ease-[...]`), inline `style={{ ... }}` setting
radius/shadow/timing, and component-local CSS reimplementing a voice token.

## Findings

**No hardcoded radius/shadow/duration arbitrary values or inline styles were
found in any of the 16 new components.** All corner radii use token-backed
utilities (`rounded-md`, `rounded-lg`, `rounded-2xl`, `rounded-full`), all
elevation uses `shadow-sm`/`shadow-lg`, and no component sets `style={{}}`
for any of these properties. Each of these resolves through `@theme inline`
to `--radius-scale`/`--shadow-ambient-raw`, so all 16 restyle correctly under
every `data-voice`.

The two arbitrary-value hits in the whole `src/components` tree are both
outside the new set and both legitimate:
- `button.tsx:18` — `shadow-[0_0_30px_-6px_var(--accent)]` on the `glow`
  variant. This is a decorative glow, not elevation — it already reads
  `var(--accent)` (voice/palette-aware color) and mirrors the same pattern
  `globals.css` itself uses for `--glow-accent` per voice. Intentionally not
  reshaped by `--shadow-ambient-raw`; left as-is.
- `scroll-area.tsx:12` — `rounded-[inherit]`. Deliberately inherits the
  parent's already-token-scaled radius rather than hardcoding a value; not a
  violation.

**One consistency fix applied** (not a hard contract violation, since
`--ease-fluid` isn't currently overridden per-`[data-voice]`, but it is the
token-backed easing curve every other timed transition in the registry uses
— accordion, breadcrumb, toast): `navigation-menu.tsx` had three
`transition-*` utilities using bare `duration-200` with the browser default
easing instead of the shared `ease-fluid` utility class:
- `navigation-menu.tsx:54` (chevron rotation)
- `navigation-menu.tsx:75` (content fade)
- `navigation-menu.tsx:111` (indicator fade)

All three now include `ease-fluid` alongside their existing `duration-*`,
matching the convention already established by sibling components.

## Intentional exceptions

- `button.tsx` glow shadow and `scroll-area.tsx` `rounded-[inherit]` (see
  above) — both left unchanged, with existing/no additional comment needed
  since the glow variant already documents its own single-CTA intent and
  `rounded-[inherit]` is self-explanatory (inherits an already-scaled value).

No component-local CSS files exist under any of the 16 new component
directories (all are pure `.tsx`), so there was no risk of a component
reimplementing a voice token in scoped CSS.
