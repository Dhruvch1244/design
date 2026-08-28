# Tailwind CSS v4

## Stale training data warning

If your training data predates ~early 2025, your instinct for Tailwind is
v3. v4 changed the config model, not just utility classes. The single most
common mistake: writing a `tailwind.config.js` with a `theme.extend` block
from memory. **v4 does not use that file by default.** Check for
`tailwind.config.js`/`.ts` in the repo first — if it's absent, config lives
in CSS.

## Config lives in CSS

```css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.6 0.2 260);
  --font-display: "Fraunces", serif;
  --ease-fluid: cubic-bezier(0.32, 0.72, 0, 1);
  --radius-squircle: 1.75rem;
}
```

Every key in `@theme` under a known namespace (`--color-*`, `--font-*`,
`--spacing-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--breakpoint-*`,
`--animate-*`, …) generates matching utilities automatically —
`--color-brand-500` gives you `bg-brand-500`, `text-brand-500`,
`border-brand-500`, etc. for free. You do not hand-write utility mappings.

### The `@theme inline` trap (dark mode / runtime-variable themes)

If a token's value needs to change at runtime (dark mode via
`prefers-color-scheme` or a `.dark` class, not just a static value), you
need **two** variables: a raw one that changes, and a theme-namespaced one
that references it.

```css
:root {
  --background: #fbf9f5;      /* raw, changes under media query below */
}
@media (prefers-color-scheme: dark) {
  :root { --background: #14100d; }
}

@theme inline {
  --color-background: var(--background);  /* theme token, references the raw var */
}
```

**Do not give the raw variable and the theme token the same name** —
`--color-background: var(--color-background)` is a self-reference and
silently breaks (the utility resolves to nothing, no build error). This is
an easy mistake to make when refactoring; if a color/shadow/ease utility
compiles to nothing in the output CSS, check for this first.

Static tokens (an easing curve, a font stack, a radius scale) don't need
this indirection — just `--ease-fluid: cubic-bezier(...)` directly, `inline`
or not, since there's no runtime variation to defer.

### Verifying a custom token actually generated a utility

Don't trust that it worked just because the build didn't error — Tailwind
silently omits utilities for malformed tokens. After adding a theme token,
grep the built CSS for the class:

```sh
grep -o "\.ease-fluid{[^}]*}" path/to/output.css
```

If that comes back empty, the token name or namespace is wrong.

## Plugins

`@plugin` in CSS, not a JS `plugins: []` array:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

## Native CSS features v4 leans on

- **`color-mix()`** for opacity/tint math instead of hand-rolled rgba:
  `color-mix(in srgb, var(--ink-900) 10%, transparent)`.
- **Container queries** are built in, no plugin: `@container` on a parent,
  `@sm:`/`@md:` variants on children scoped to that container instead of
  the viewport.
- **`:has()`**-based variants like `has-checked:`, `group-has-*:` for
  parent-aware styling without JS.

## Arbitrary values vs. theme tokens

Arbitrary values (`w-[137px]`, `bg-[#1a1614]`) are an escape hatch, not the
default. If a value is used more than once, promote it to a `@theme` token
— that's what makes a rebrand a one-line CSS edit instead of a find-replace
across every component file.

## Native optional-dependency gotcha (not Tailwind-specific, but bites v4 users constantly)

`@tailwindcss/oxide` and `lightningcss` (v4's Rust-based engine) ship
platform-specific native binaries as **optional** npm dependencies
(`@tailwindcss/oxide-win32-x64-msvc`, `lightningcss-win32-x64-msvc`, etc.).
If a lockfile was generated on a different OS, or an install was
interrupted, these can be silently missing even though `npm ls` shows the
parent package resolved fine. Symptom: a build error deep in a stack trace
about `Cannot find module '../lightningcss.win32-x64-msvc.node'` or
`@tailwindcss/oxide-<platform>`, thrown from inside PostCSS/Turbopack's CSS
evaluation, not from your code. Fix: delete `node_modules` and reinstall
clean (`npm ci`) rather than patching around it; if that doesn't pick up
the platform binary, install it explicitly by name once
(`npm install lightningcss-<platform> @tailwindcss/oxide-<platform>`) and
commit that nothing changed in the lockfile's *dependency graph*, only the
installed set.
