# Motion & animation — earn the frame, respect the override

A companion to the nine pillars in `AGENTS.md`, not a tenth pillar itself —
those nine are extracted from three external shipped apps (lyric-viewer,
file-viewer, review-grader), evidenced by a commit in a repo this project
doesn't own. This one is different on purpose: every claim below is sourced
from **this site** (`apps/site` in this repo) instead, because it's the one
place this project has a real, git-checkable animation decision to point at.
Same discipline as the rest of this philosophy — no invented "best
practices" — just a different, honestly-labeled source.

## Animation is not free — it must have a defined trigger, boundary, and off-switch

Every animated effect in this codebase answers three questions explicitly.
An effect that can't answer all three is a bug waiting to be found, not a
finished feature.

**1. What triggers it, and does the trigger fire exactly once per intent?**

`components/motion/reveal.tsx` fades/slides each section in the first time
it scrolls into view, driven by `IntersectionObserver`. The component's own
doc comment records a real failure mode found by direct testing, not
theorized: routing the "revealed" flag through React `state` on a page
mounting ~20 `Reveal`s at once (a component gallery) meant some of those
`setState` calls got scheduled at low priority and never actually
committed — content stayed invisible indefinitely on a fresh load, and only
"unstuck" after an unrelated click forced React to flush a render. The fix
was to stop modeling visibility as state entirely: toggle a CSS class
directly on the DOM node via a ref, removing React's scheduler from the
path. A single user interaction should never be a prerequisite for a page's
own content to appear.

```tsx
// Anti-pattern — visibility as React state. On a page mounting many of
// these at once, some setState calls can get scheduled and never commit.
const [revealed, setRevealed] = useState(false);
useEffect(() => {
  const obs = new IntersectionObserver(([e]) => e.isIntersecting && setRevealed(true));
  obs.observe(ref.current!);
}, []);
return <div className={revealed ? "reveal-in" : ""} ref={ref}>{children}</div>;
```

```tsx
// Fix — mutate the DOM node directly; no state, no scheduler in the path.
useEffect(() => {
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) ref.current!.classList.add("reveal-in");
  });
  obs.observe(ref.current!);
}, []);
```

**2. What is its actual paint/layout boundary — does it risk hiding real content?**

`components/motion/cursor-glow.tsx` confines a pointer-following glow to a
container by painting it on its own absolutely-positioned sibling layer,
never as the container's own background or a wrapper around the content.
The doc comment names the specific trap this avoids: an ancestor's opacity
can't be "undone" by setting a child's opacity back to 1 — so if the glow
and the real content shared a parent/child relationship instead of being
siblings, an animation bug in the glow's opacity could take the actual
content down with it. The boundary between "decorative effect" and "content
the user came here to read" has to be a real DOM boundary, not just a
visual one that happens to look separated today.

**3. Does it stay off the render thread, and does it respect the user's OS-level preference?**

`components/motion/magnetic.tsx` (the hover-pull effect on buttons/links)
mutates `style.transform` directly via a ref on every `pointermove`,
specifically to avoid a React re-render on each event — only `transform` is
touched, so the effect is compositor-only. And `app/globals.css` gates the
two motion features with real cost against `prefers-reduced-motion`:
`scroll-behavior: smooth` only applies under `(prefers-reduced-motion:
no-preference)`, and under `(prefers-reduced-motion: reduce)`, `.reveal`'s
transition duration collapses to 1ms and `.progress-bar` animations are
disabled outright. Reduced motion isn't a visual tweak to consider later —
it's the same class of correctness property pillar #9 (`AGENTS.md`)
describes for `async`: something that fails silently (a user set the OS
preference, the app ignored it) rather than loudly, so it has to be checked
for explicitly rather than assumed away.

## A seemingly-decorative effect can have a real layout cost — measure it like one

`app/globals.css` documents a scrollWidth bug found on this site: two
purely decorative background layers (`.mesh-gradient`, `.starfield`) are
`position: fixed` with a negative inset so their wash bleeds past the
viewport edge — the bled part is never actually visible. But Chromium still
counted that fixed element's full layout box toward
`document.documentElement.scrollWidth`, producing a real horizontal
scrollbar on every mobile width regardless of actual viewport width. The
comment records the wrong turns kept there deliberately so nobody re-walks
them: `overflow-x: hidden` fixed the scrollWidth bug but only when set on
**both** `html` and `body` — and doing that broke `position: sticky`
site-wide, because CSS's overflow spec forces the *other* axis to `auto`
too when one axis is set to `hidden`, turning `html`/`body` into their own
scroll container distinct from the viewport. Neither a viewport-exact
wrapper nor swapping the inset for an equivalent `transform: scale()`
worked either. `overflow-x: clip` on both `html` and `body` was the one
combination verified to fix both at once — `clip` explicitly forbids
scrolling (even programmatically), so it never triggers the
`hidden`-forces-the-other-axis-`auto` coupling that broke sticky. Verified,
not assumed: `scrollWidth` matches `clientWidth` at 360/375/390px in both
themes, and the sticky sidebar stays pinned across a 3000px scroll.

The generalizable rule: "it's just a decorative animation/background" is
not evidence that it has no layout cost. Measure the actual box model
consequence (`scrollWidth`, `clientWidth`, sticky-positioning behavior)
the same way pillar #4 (`AGENTS.md`) insists on measuring performance
claims — a vibe that something "looks contained" is not the same as
confirming it doesn't affect layout outside its visible bounds.

## The failure mode of an animation nobody asked to trigger

The most serious motion bug found on this site wasn't in a component this
project wrote — it was a default behavior of a dependency
(`cmdk`, the library behind `Command`) that this project didn't initially
account for. `cmdk` auto-selects a `Command`'s first item on mount and
calls `scrollIntoView({block: "nearest"})` on it. For a `Command` that's
already visible when it mounts, that's a no-op. For one mounted off-screen
(a demo sitting well down a long page, `Reveal`-wrapped so it mounts
immediately regardless of scroll position), that single `scrollIntoView`
call cascaded into the *entire page* scrolling itself thousands of pixels
down the moment the page loaded — confirmed by instrumenting
`Element.prototype.scrollIntoView` and tracing the call against a
production build, not guessed at. The fix (`components/lazy-mount.tsx`)
defers mounting that specific widget until it actually scrolls into view,
so the auto-select-and-scroll has nothing off-screen left to scroll toward.

The generalizable rule: an animation or auto-behavior you didn't write —
inherited from a UI library's own defaults — is still your bug once it
ships on your page. "It's the library's behavior" is not a reason it's
exempt from the same trigger/boundary/off-switch questions above; it's a
reason to audit a new interactive dependency's *default* mount behavior
specifically, not just its documented API.

## What this adds up to

The same three questions, asked of every effect in this codebase: what
triggers it, what's its actual paint/layout boundary, and does it respect
being turned off (by the OS preference, or by simply not being visible
yet). An effect that can answer all three is decoration in the good sense —
it never gets in the way of the content or the user's own accessibility
settings. One that can't is a bug with a delay timer on it.
