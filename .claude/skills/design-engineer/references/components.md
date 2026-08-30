# Component & primitive libraries

## The landscape

| Library | What it actually is | Reach for it when |
|---|---|---|
| **shadcn/ui** | A CLI that copies styled component *source* (Radix + Tailwind + CVA) into your repo. Not an npm runtime dependency. | Greenfield React + Tailwind, and you want to own/edit every component's source from day one. |
| **Radix Primitives** | Unstyled, fully-accessible behavior (focus trap, roving tabindex, portal, ARIA wiring) for ~30 patterns (Dialog, Popover, Select, Tabs, …). shadcn is built on top of this. | You want the accessibility engineering without shadcn's visual opinions — building a fully custom design system. |
| **React Aria (Adobe)** | Same category as Radix — unstyled, accessible hooks — but broader coverage (date pickers, tables, drag-and-drop) and framework-agnostic core (`@react-aria/*` hooks + optional `react-aria-components`). | Radix doesn't cover the pattern you need (date range picker, grid/table interactions), or you need React Native parity via React Spectrum's underlying hooks. |
| **Ariakit** | Similar unstyled-primitives category, smaller API surface, composable "store" pattern. | Team already invested in it; not usually a first choice over Radix for new work. |
| **Headless UI** | Tailwind Labs' own unstyled set, smaller (~10 components), tightly matched to Tailwind's docs examples. | Very small component need and want minimal API surface — but Radix/React Aria have wider coverage for the same effort. |
| **MUI / Chakra / Mantine / Ant Design** | Full styled systems with their own theming engines, opinionated visuals. | The project already uses one. **Never introduce a second full system alongside one of these** — see below. |

## Don't mix systems

The single most common way an AI-assisted change makes a codebase look
inconsistent: adding a shadcn Button into a codebase that already has MUI's
`<Button>`, because shadcn was "the default" without checking first. Before
adding any component library, grep `package.json` for the ones above. If one
is already there, build inside it — its theming API, its spacing scale, its
button variants — even if you'd have chosen differently on a blank repo.

The one exception: adding a **narrow, non-visual** primitive (a Radix
`Portal`, a `use-debounce` hook) alongside an existing full system is fine;
adding a second component *kit* is not.

## shadcn/ui specifics

- It is a **CLI + registry**, not a package. `npx shadcn add button` copies
  `button.tsx` into your project; you now own that file. There is no
  version to bump — updates are re-running `add` with `--overwrite` (or
  diffing manually) if the upstream registry changes.
- Components are built with **class-variance-authority (CVA)** for variant
  props (`variant="outline"`, `size="lg"`) and **`cn()`** (a
  `clsx` + `tailwind-merge` helper) so a caller's `className` cleanly
  overrides the component's own classes instead of fighting Tailwind's
  cascade order.
- **`asChild`** (via Radix's `Slot`) lets a component render as its child
  instead of its default tag — `<Button asChild><Link href="/x">Go</Link></Button>`
  renders a single `<a>` with the button's classes, instead of nesting an
  `<a>` inside a `<button>` (invalid HTML) or duplicating styles onto the
  `<Link>` by hand. Any shadcn-style component that composes with links
  should support this.
- A **registry** (what shadcn's CLI reads from) is just two JSON shapes per
  item — an index entry and a full item with embedded file content — served
  as static files or read from a local directory. Building your own private
  registry (internal design system, a personal component set) is a small
  amount of code: a build script that reads a manifest and a `name.json`
  per component, no framework required.

## Radix Primitives specifics

- Radix ships **unstyled** — you get `data-state`, `data-disabled`, etc.
  attributes to style against, not classes. Style via
  `[data-state=open]:` (Tailwind arbitrary variant) or CSS attribute
  selectors.
- Composition is explicit: `<Dialog.Root><Dialog.Trigger/><Dialog.Portal><Dialog.Overlay/><Dialog.Content>...` —
  every piece is a separate primitive you assemble, not a single component
  with props for everything. This is what makes it possible to insert a
  custom animation wrapper (Motion's `<AnimatePresence>`, a CSS transition
  class) around `Dialog.Content` without fighting the library.
- Radix handles focus return, scroll lock, and portal mounting for you —
  don't hand-roll these for a modal/dialog/popover; that's the entire value
  of reaching for Radix instead of a `position: fixed` div.

## Stale training data warning

- Some Radix packages were consolidated into scoped `@radix-ui/react-*`
  imports per-primitive years ago (`@radix-ui/react-dialog`, not a single
  `radix-ui` package with everything) — but a newer unified `radix-ui`
  meta-package also now exists for some setups. Check the installed
  `package.json` for which pattern this repo already uses before adding an
  import style that doesn't match.
- shadcn's CLI and registry format have changed across major versions
  (registry schema, `components.json` shape). If a `components.json`
  already exists in the repo, read it before assuming default paths/aliases
  — don't overwrite a customized `aliases.components` value with the
  default.
