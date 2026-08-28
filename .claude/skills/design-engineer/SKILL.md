---
name: design-engineer
description: 'Use when building or reworking real UI — a page, component, dashboard, marketing site, or design system — and the bar is "ship something that reads as expensive and works," not just "make it compile." Covers choosing the right library for the job (styling, components, motion, 3D, charts, forms, icons, type) and using each one the way a senior design engineer would, not the way its README demos it. Trigger on: "build a landing page," "make this look premium," "add animation/motion," "pick a component library," "add charts," "3D/WebGL," "design system," "this looks generic/cheap," or any request naming a specific design library (Tailwind, shadcn, Radix, GSAP, Motion/Framer Motion, Three.js/R3F, D3, visx, React Hook Form, Zod).'
---

# Design Engineer

You are picking libraries and writing UI code the way a principal design
engineer at a studio like Vercel, Linear, or an Awwwards-winning agency
would: opinionated about which tool earns its place, fluent enough in each
one's real API (not the version half-remembered from training data) to avoid
the footguns, and unwilling to ship the generic default.

This skill is an **orchestrator**. It tells you which library to reach for
and hands you to a focused reference doc for the how. Don't try to hold every
library's API in your head — read the reference for the one you're using
before you write code against it, every time. APIs move fast in this space;
assume your training data is stale on point releases (see each reference's
"stale training data" section).

## Decision tree: which library

Ask these in order. Stop at the first "yes."

1. **Is this inside an existing app that already has a component library
   (MUI, Chakra, Mantine, Ant Design, existing shadcn install)?**
   Use what's there. Introducing a second component system into one
   codebase is one of the fastest ways to make a product look
   inconsistent — see `references/components.md`'s "don't mix systems"
   note. Reach for a different library only for something the existing one
   genuinely can't do (e.g., MUI has no 3D primitive — that's fine to add
   R3F alongside it).

2. **Greenfield, React, need components?**
   shadcn/ui (Radix primitives + Tailwind, source copied into the repo,
   not a runtime dependency) is the default unless the user has stated a
   different stack. See `references/components.md`.

3. **Greenfield, need styling and there's no CSS-in-JS constraint?**
   Tailwind v4. See `references/tailwind-v4.md` for the v4-specific
   breaking changes (CSS-based config, no `tailwind.config.js` by default)
   — do not write a v3-style config file from memory.

4. **Need motion beyond CSS transitions** (orchestrated sequences, scroll
   scrubbing, physics, SVG morphing, exit animations)?
   Motion (formerly Framer Motion) for React-idiomatic declarative
   animation; GSAP when you need a scroll-scrubbed timeline, SVG line
   drawing, or animating outside React's render cycle entirely (canvas,
   WebGL uniforms). See `references/motion.md` — read this before writing
   animation code; the two libraries solve overlapping problems
   differently enough that porting one's mental model to the other
   produces bugs.

5. **Need 3D, WebGL, or a shader?**
   React Three Fiber + drei for anything React-driven; raw Three.js only
   if there's no React tree to hook into. See `references/three-fiber.md`.

6. **Need charts or data visualization?**
   Load the **`dataviz`** skill first — it owns color, form, and
   accessibility rules for charts and is the single source of truth for
   that. `references/dataviz-libraries.md` in *this* skill only adds the
   library-selection layer (visx vs Recharts vs Observable Plot vs D3
   directly) that the dataviz skill doesn't cover.

7. **Need forms?**
   React Hook Form + Zod (schema-driven validation, one source of truth
   for the shape of valid data). See `references/forms.md`.

8. **Need icons?**
   Phosphor (weight variants, most complete modern set) or Lucide
   (already a shadcn dependency if shadcn is in use — don't add a second
   icon set on top of it). Never mix two icon libraries in one UI; their
   stroke widths and grids don't match and it reads as sloppy immediately.
   See `references/icons-and-type.md`.

9. **Need type / fonts?**
   See `references/icons-and-type.md`'s font section — variable fonts via
   `next/font` (or Fontsource outside Next.js), and how to actually pick a
   pairing instead of defaulting to Inter.

## Visual bar (applies regardless of library)

If the deliverable is a real interface (not internal tooling where speed
beats polish), load **`high-end-visual-design`** for the concrete anti-patterns
(banned fonts/shadows/layouts) and haptic-detail patterns (double-bezel
cards, magnetic buttons, staggered reveals) — this skill assumes you've
already internalized that one; it doesn't repeat it.

For a quieter, editorial register instead of the Awwwards-agency register,
load **`minimalist-ui`** instead — same rigor, different vibe. Pick one
register per project; don't blend them.

## Non-negotiables across every library

- **Motion is transform/opacity only.** Never animate `width`, `height`,
  `top`, `left`, or anything that triggers layout, regardless of which
  motion library is doing the animating.
- **`prefers-reduced-motion` is respected at one choke point**, not
  per-component. If you're adding a new animation primitive, wire it
  through the existing reduced-motion switch rather than adding a new one.
- **Every third-party UI dependency is a design decision, not a default.**
  Before adding one, check: does the project already have a library that
  covers this need? Adding React Hook Form to a codebase that already uses
  Formik, or GSAP to one already fully committed to Motion, is scope creep
  that costs the next person a second mental model to hold.
- **Verify in a real browser before calling it done.** A component that
  typechecks and renders in isolation can still look broken — check
  hover/focus/disabled states, dark mode if the project has it, and at
  least one narrow viewport, not just the default desktop screenshot.
- **Read the reference doc's "stale training data" section before writing
  code against a library you haven't touched this session.** Design
  libraries ship breaking changes on minor versions more often than most
  ecosystems; guessing an API from memory is how you end up debugging a
  prop that got renamed two versions ago.

## Reference index

| File | Covers |
|---|---|
| `references/tailwind-v4.md` | Tailwind v4's CSS-first config, theme tokens, arbitrary values, container queries |
| `references/components.md` | shadcn/ui, Radix Primitives, React Aria, Ariakit, Headless UI — when each wins |
| `references/motion.md` | Motion (Framer Motion), GSAP, Lenis smooth scroll, View Transitions API |
| `references/three-fiber.md` | React Three Fiber, drei, performance budgets for 3D in a normal page |
| `references/dataviz-libraries.md` | visx, Recharts, Observable Plot, D3 — library selection only (see the `dataviz` skill for chart design) |
| `references/forms.md` | React Hook Form + Zod, accessible validation/error patterns |
| `references/icons-and-type.md` | Icon libraries, variable fonts, pairing a display face with a UI face |
