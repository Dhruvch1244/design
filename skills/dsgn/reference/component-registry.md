# Component registry

Sourced from `packages/registry/registry.json` and the component source
under `packages/registry/src/components/`. 23 real UI components plus one
`utils` module, all Radix UI primitives or plain styled native elements
wrapped with `class-variance-authority` (CVA) + a `cn()` helper (clsx +
tailwind-merge) where variants exist.

## Install

```
npx @dhruvchoudhary/dsgn add <component> [<component> ...]
```

Files are **copied** into the consumer's own source tree (typically
`components/dsgn/`), not imported from an npm package at runtime. The
consumer owns the file the moment it lands — editing it is expected, there is
nothing to "eject" later. `utils` (the `cn()` helper) installs automatically
as a dependency of any component that needs it.

## The 23 components

| Component | Radix primitive? | npm deps |
|---|---|---|
| `button` | Slot only (`asChild`) | `class-variance-authority`, `@radix-ui/react-slot` |
| `card` | No — plain styled divs | — |
| `badge` | No | `class-variance-authority` |
| `input` | No — plain `<input>` | — |
| `textarea` | No — plain `<textarea>` | — |
| `command` | No (uses `cmdk`) | `cmdk` |
| `switch` | Yes | `@radix-ui/react-switch` |
| `tooltip` | Yes | `@radix-ui/react-tooltip` |
| `tabs` | Yes | `@radix-ui/react-tabs` |
| `select` | Yes | `@radix-ui/react-select` |
| `dialog` | Yes | `@radix-ui/react-dialog` |
| `alert` | No | `class-variance-authority` |
| `avatar` | Yes | `@radix-ui/react-avatar` |
| `checkbox` | Yes | `@radix-ui/react-checkbox` |
| `radio-group` | Yes | `@radix-ui/react-radio-group` |
| `separator` | Yes | `@radix-ui/react-separator` |
| `progress` | Yes | `@radix-ui/react-progress` |
| `accordion` | Yes | `@radix-ui/react-accordion` |
| `popover` | Yes | `@radix-ui/react-popover` |
| `dropdown-menu` | Yes | `@radix-ui/react-dropdown-menu` |
| `table` | No — plain styled `<table>` | — |
| `skeleton` | No — a `div` with `animate-pulse` | — |
| `empty-state` | No — composed pattern | — |

## Real variant/prop signatures — don't invent props not listed here

**Button** (`variant` × `size`, plus `asChild`, `leftIcon`, `rightIcon`):
- `variant`: `primary` · `secondary` · `accent` · `glow` (permanently-glowing
  accent, for the one CTA per view that should read as "the" action) ·
  `soft` (tinted fill, a step down from `accent` without dropping to a bare
  outline) · `outline` · `ghost` · `link`
- `size`: `xs` · `sm` · `md` · `lg` · `xl` · `icon` · `icon-sm` · `icon-lg`
- `asChild`: renders via Radix `Slot` (e.g. `<Button asChild><Link
  href="/x">...</Link></Button>`) — `leftIcon`/`rightIcon` have no effect
  when `asChild` is set, since Slot needs its single child untouched.

**Badge** (`variant` only): `primary` · `secondary` · `accent` · `outline` ·
`destructive`

**Alert** (`variant` only): `default` · `destructive`

**Table**: composed from `Table`, `TableHeader`, `TableBody`, `TableFooter`,
`TableRow`, `TableHead`, `TableCell`, `TableCaption` — styled native `<table>`
elements, no Radix dependency.

**Skeleton**: a single `Skeleton` component, `div` with `animate-pulse
rounded-md bg-muted` — size it with `className` (`h-4 w-20`, etc.).

**Empty State**: `EmptyState` takes `icon`, `title`, `description`, `action`
props — a dashed-border composed pattern, not variant-based.

**Command** (built on `cmdk`, not a Radix primitive): `Command`,
`CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`,
`CommandGroup`, `CommandItem`, `CommandShortcut`.

**Everything else listed as "Yes" under Radix primitive** follows the
standard Radix compound-component shape (`Root`/`Trigger`/`Content`, etc.) —
read the actual `packages/registry/src/components/<name>/<name>.tsx` file
before assuming a specific sub-part name; don't guess Radix API surface from
memory, since versions and wrapped prop names can differ from generic Radix
docs.

## Recipes (composed, multi-component patterns)

If `packages/cli` has shipped a `recipe:` install mode by the time this skill
is used (`npx @dhruvchoudhary/dsgn add recipe:<name>`), prefer installing a
matching recipe over hand-composing several components from scratch — check
`packages/registry/` for a `recipes` directory or `registry.json` entries
with a `recipe` type before assuming one doesn't exist.
