# Component registry

Sourced from `packages/registry/registry.json` and the component source
under `packages/registry/src/components/`. 36 real UI components plus one
`utils` module — a mix of Radix UI primitives and plain styled native
elements (see the "Radix primitive?" column below), wrapped with
`class-variance-authority` (CVA) + a `cn()` helper (clsx + tailwind-merge)
where variants exist.

## Install

```
npx @dhruvchoudhary/dsgn add <component> [<component> ...]
```

Files are **copied** into the consumer's own source tree (typically
`components/dsgn/`), not imported from an npm package at runtime. The
consumer owns the file the moment it lands — editing it is expected, there is
nothing to "eject" later. `utils` (the `cn()` helper) installs automatically
as a dependency of any component that needs it.

## The 36 components

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
| `breadcrumb` | Slot only (`asChild` on `BreadcrumbLink`) | `@radix-ui/react-slot` |
| `pagination` | No — built on `button`'s own CVA variants | `class-variance-authority` |
| `alert-dialog` | Yes | `@radix-ui/react-alert-dialog` |
| `sheet` | Yes (on `@radix-ui/react-dialog`, no new dep) | `@radix-ui/react-dialog` |
| `combobox` | No — composes `button` + `popover` + `command` | (none new — reuses existing deps) |
| `toast` | Yes | `@radix-ui/react-toast` |
| `toggle-group` | Yes | `@radix-ui/react-toggle-group` |
| `slider` | Yes | `@radix-ui/react-slider` |
| `collapsible` | Yes | `@radix-ui/react-collapsible` |
| `toggle` | Yes | `@radix-ui/react-toggle` |
| `hover-card` | Yes | `@radix-ui/react-hover-card` |
| `scroll-area` | Yes | `@radix-ui/react-scroll-area` |
| `context-menu` | Yes | `@radix-ui/react-context-menu` |

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
`CommandGroup`, `CommandItem`, `CommandShortcut`. `CommandDialog` is a
modal — prefer it over a permanently-expanded inline `Command` for any
search/jump UI that isn't itself the main content of the view (an inline
`Command` auto-selects and scroll-into-views its first item on mount,
which is harmless when already on-screen but has caused a real page-load
scroll-jump bug when the widget sits below the fold — see
`apps/site/components/lazy-mount.tsx` and `section-search-button.tsx` for
the two fixes this repo landed for it).

**Breadcrumb**: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`,
`BreadcrumbLink` (`asChild` via Slot), `BreadcrumbPage`,
`BreadcrumbSeparator`, `BreadcrumbEllipsis` — plain semantic `nav`/`ol`
markup, no primitive-library dependency.

**Pagination**: `Pagination`, `PaginationContent`, `PaginationItem`,
`PaginationLink` (`isActive`, `size`), `PaginationPrevious`,
`PaginationNext`, `PaginationEllipsis` — built directly on `button`'s own
CVA `buttonVariants`, no primitive-library dependency.

**Alert Dialog**: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`,
`AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`,
`AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel` —
`Action`/`Cancel` render via Button's own `buttonVariants` (`destructive` /
`outline` respectively), not a separate className, so the confirm/cancel
pair looks identical to every other button pair in the registry.

**Sheet** (`side` on `SheetContent` only): `right` · `left` · `top` ·
`bottom` (default `right`) — `Sheet`, `SheetTrigger`, `SheetClose`,
`SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`,
`SheetDescription`.

**Combobox**: a single `Combobox` component (not a compound-component set),
props `options: {value, label}[]`, `value?`, `onValueChange?`,
`placeholder?`, `searchPlaceholder?`, `emptyText?`, `className?` — a
composed pattern (Button + Popover + Command), not variant-based. Matches
its Popover's width to the trigger via Radix's `--radix-popover-trigger-width`
CSS var.

**Toast**: `toast({ title?, description?, variant?, action? })` (imperative,
callable from anywhere — not a hook-only API) plus a `<Toaster/>` mounted
once, near the app root, that renders the actual `Toast`/`ToastViewport`
elements as toasts get pushed. `variant`: `default` · `destructive`.
`useToast()` also exposes `.toasts` and `.dismiss(id?)` for reading current
state. `ToastViewport` is `position: fixed` and does not self-portal (it
assumes root-level mounting, matching upstream convention) — nesting a
`<Toaster/>` inside any ancestor with a non-`none` CSS `transform` (a
scroll-reveal wrapper, e.g.) breaks its fixed-to-viewport positioning, since
that transform creates a new containing block; portal it to `document.body`
explicitly if that's unavoidable in a given tree.

**Toggle Group** (`size` on `ToggleGroup`, inherited by every `ToggleGroupItem`
via context unless a given item overrides it): `default` · `sm` · `lg` — plus
whatever `type`/`value` props `@radix-ui/react-toggle-group`'s own `Root`
takes (`single` vs `multiple` selection).

**Slider**: a single `Slider` component — no custom props beyond Radix's
own `SliderPrimitive.Root` props (`value`/`defaultValue`, `min`, `max`,
`step`, etc.). Renders one `Thumb` per entry in `value`/`defaultValue`, so
the same component covers both a single-handle slider (`[60]`) and a range
slider (`[20, 80]`) without a separate API.

**Collapsible**: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` —
a bare, unstyled re-export of the Radix primitive (no CVA, no default
classes), since a single show/hide section has too many real layouts
(trigger button, plain link, chevron placement) to impose one look. Style
each part directly via `className`. Distinct from `accordion`, which
manages a set of items with only one (or a controlled few) open at a time.

**Toggle** (`variant` × `size`): `variant`: `default` · `outline`. `size`:
`default` · `sm` · `lg`. The singular sibling of `toggle-group` — a single
pressed/unpressed button (e.g. one toolbar key), not a set.

**Hover Card**: `HoverCard`, `HoverCardTrigger`, `HoverCardContent` — same
shape as `popover` but hover-triggered instead of click-triggered, with
Radix's own default `openDelay`/`closeDelay` (700ms / 300ms) rather than
opening instantly. Don't use it for anything a keyboard-only or touch user
must be able to reach — a hover-only trigger has no keyboard equivalent by
default, so it's best for supplementary previews, not required content.

**Scroll Area**: `ScrollArea` (wraps `Viewport` + `ScrollBar` + `Corner`
internally, pass a `className` with a fixed height like `h-48`), plus a
separately-exported `ScrollBar` (`orientation`: `vertical` · `horizontal`)
for a second scrollbar if a consumer needs horizontal scroll too.

**Context Menu**: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`,
`ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`,
`ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`,
`ContextMenuGroup`, `ContextMenuSub`, `ContextMenuRadioGroup` — right-click
triggered instead of click-triggered, otherwise the same compound shape and
same className conventions as `dropdown-menu`.

**Everything else listed as "Yes" under Radix primitive** follows the
standard Radix compound-component shape (`Root`/`Trigger`/`Content`, etc.) —
read the actual `packages/registry/src/components/<name>/<name>.tsx` file
before assuming a specific sub-part name; don't guess Radix API surface from
memory, since versions and wrapped prop names can differ from generic Radix
docs.

## Recipes (composed, multi-component patterns)

`npx @dhruvchoudhary/dsgn add recipe:<name>` installs a whole composed
pattern — the recipe file plus every component it depends on — in one shot.
Prefer installing a matching recipe over hand-composing the same components
from scratch. 8 recipes exist today, under `packages/registry/src/recipes/`:

| Recipe | Composed from |
|---|---|
| `auth-form` | Card + Input + Checkbox + Button |
| `settings-panel` | Card + Switch + Select + Separator + Button |
| `pricing-tiers` | Card + Badge + Button |
| `empty-state-cta` | EmptyState + Button |
| `billing-summary` | Card + Badge + Progress + Button |
| `team-members` | Table + Avatar + Badge + DropdownMenu + Button |
| `notification-list` | Card + Avatar + Badge |
| `onboarding-checklist` | Card + Progress + Checkbox |

This list can drift as new recipes ship — run
`npx @dhruvchoudhary/dsgn list --recipes` (or `--recipes --json`) for the
always-current list straight from the registry before assuming this table
is exhaustive.
