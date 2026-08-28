# Motion libraries

## Motion (formerly Framer Motion)

Renamed from "Framer Motion" to "Motion" — the npm package is now `motion`
(the old `framer-motion` package still exists and re-exports for backwards
compatibility, but new code should `import { motion } from "motion/react"`,
not `from "framer-motion"`). If you see `framer-motion` in a training
example, mentally translate the import.

- **Declarative, React-idiomatic.** You describe states (`animate`,
  `whileHover`, `whileTap`, `whileInView`), not imperative timelines. This
  is the right default for "this element animates in on scroll," "this
  card lifts on hover," "this list reorders."
- **`AnimatePresence`** is how you animate something *out* — React can't
  animate a component that's already unmounted, so `AnimatePresence` keeps
  it mounted during its exit animation and removes it after. Any
  "toast/modal/list-item exit animation doesn't play" bug is almost always
  a missing `AnimatePresence` wrapper or a missing `key` on the child.
- **`layout` prop** gives you automatic FLIP-style animation when an
  element's position/size changes due to layout (a reordering list, a
  card expanding) — powerful, but expensive if applied broadly; scope it
  to the elements that actually reflow, not a whole page.
- **`whileInView`** replaces hand-rolled `IntersectionObserver` scroll-entry
  code for the common case — `viewport={{ once: true, margin: "-10%" }}` is
  the equivalent of the manual-observer pattern (see
  `high-end-visual-design`'s scroll-interpolation section). Prefer this
  over a custom observer hook unless you need to *not* pull in the
  library's runtime cost.
- **Independent of Tailwind/CSS transitions.** You choose per-element
  whether it's CSS-driven or Motion-driven; don't mix both on the same
  property on the same element (a `transition-transform` class fighting a
  Motion `animate={{ x: ... }}` produces jank).

## GSAP

As of the Webflow acquisition, **GSAP and all its plugins (ScrollTrigger,
SplitText, MorphSVG, DrawSVG, etc.) are free** — older references to a paid
"Club GreenSock" tier for premium plugins are stale.

- **Imperative timeline model**, not declarative — you build a `gsap.timeline()`
  and sequence `.to()`/`.from()`/`.fromTo()` calls with explicit
  positions/overlaps (`"-=0.2"` etc.). Right tool when the animation is a
  *choreographed sequence* (a hero intro with 6 elements entering in a
  precise order) rather than a per-component state response.
- **`ScrollTrigger`** is the standard for scroll-scrubbed animation
  (progress tied directly to scroll position, "pin" a section while a
  timeline plays) — this is not naturally expressible in Motion's
  `whileInView` model, which is trigger-once/in-view, not
  progress-scrubbed. If the brief is "this animation's progress should
  track the scrollbar exactly," reach for GSAP + ScrollTrigger, not Motion.
- **Works outside React's render cycle** — GSAP mutates the DOM/canvas/WebGL
  uniforms directly, so it's the right choice for animating something
  Motion can't reach cleanly (canvas 2D context values, Three.js material
  uniforms, SVG path `d` attributes via MorphSVG).
- **In React**, always drive GSAP from `useGSAP()` (the official
  `@gsap/react` hook) or a `useEffect` with explicit cleanup
  (`ctx.revert()` via `gsap.context()`) — GSAP has no idea about React's
  unmount lifecycle on its own, and skipping cleanup is the #1 cause of
  "animation replays/doubles on navigation" bugs in React + GSAP code.

## Lenis (smooth scroll)

The current standard for buttery inertial scroll (replaced older libraries
like `locomotive-scroll` for most new projects). Wrap the scrollable root,
sync its `scroll` event to `ScrollTrigger.update()` if combined with GSAP
(`lenis.on('scroll', ScrollTrigger.update)`), and register
`gsap.ticker.add` for the RAF loop instead of running two separate
`requestAnimationFrame` loops. Skip it entirely for content-heavy/prose
pages (philosophy docs, articles) — inertial scroll fights a reader's
expectation of scroll = 1:1 with wheel input, and hurts accessibility for
anyone using scroll-jump keyboard navigation.

## View Transitions API

Native browser API (no library) for animating between two DOM states —
`document.startViewTransition(() => { /* DOM update */ })` — or, in
Next.js App Router, the `<ViewTransition>` experimental component. Best for
page-to-page navigation transitions (a shared element "expanding" from a
list into a detail view) where you want native performance and don't want
to pull in a library just for a route-change crossfade. Not yet supported
in every browser — check current support before relying on it as the only
transition mechanism for a production feature; provide a no-op fallback
(the DOM update just happens instantly) rather than blocking on it.

## Which one for scroll-entry reveals (the "fade up as it enters viewport" pattern)

Three valid approaches, in order of preference by dependency cost:

1. **Raw `IntersectionObserver`** in a small client component (no new
   dependency) — right choice if this is the *only* motion need on the
   page, as it was for reveal animations on a mostly-static content site.
2. **Motion's `whileInView`** — right choice if Motion is already a
   dependency for other interactions on the page; don't add it solely for
   this.
3. **GSAP ScrollTrigger's `toggleActions`** — right choice only if GSAP is
   already driving a more complex scroll-scrubbed sequence elsewhere on
   the same page; overkill as a standalone reveal mechanism.

Never use a raw `scroll` event listener for any of this — it fires on every
frame and forces layout reads unless very carefully throttled; every
option above already solves the throttling problem for you.
