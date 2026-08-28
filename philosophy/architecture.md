# Architecture — physical boundaries and one scheduler

Expands pillars #1 and #2 from `AGENTS.md`. Read that file first.

## The boundary test

A "layered architecture" diagram is worthless if the layers can still import
each other. The only boundary that holds under deadline pressure is one the
build system enforces. Before calling a separation real, ask:

1. **Can the logic package build without the UI toolchain installed?** If
   your "core" library still needs WPF, React, or a browser DOM available to
   compile or test, the separation is a naming convention, not an
   architecture.
2. **Can the logic package's tests run in milliseconds, with no UI harness,
   no emulator, no headless browser?** file-viewer's `FileViewer.Core.Tests`
   runs as plain xUnit against a plain library — no `WPF` App, no window.
   That speed is a side effect of the boundary being real, and it's also
   what makes people actually run the tests instead of skipping them.
3. **If you deleted the entire UI layer, does the logic package still make
   sense on its own?** lyric-viewer's Rust side owns SMTC integration, all
   network/LLM calls, caching, and job scheduling — none of it references
   the WebView2 renderer. The renderer could be swapped for a different
   drawing surface entirely without touching Rust.

Where this shows up in practice, by stack:

- **Desktop (.NET/WPF, Tauri/Rust+Web, Electron)**: put parsing, indexing,
  business logic, and persistence in a project/crate/package with zero
  reference to the UI framework's assemblies or the webview. The UI project
  depends on the logic project; never the reverse.
- **Web (React/Angular/etc.)**: logic that doesn't need to render — API
  clients, validation, data transforms, business rules — lives in plain
  TypeScript modules with no framework import (no `useEffect`, no
  `@Injectable`-as-a-crutch, no signal in the file). Components call into
  them; they don't reach back into component state.
- **Mobile**: the same split, one level more important, because a UI
  framework migration (UIKit → SwiftUI, Views → Compose) is a when-not-if on
  a long-lived app, and only survives cleanly if the logic never depended on
  the old framework to begin with.

## The one narrow exception, and how to document it

lyric-viewer has exactly one deliberate crossing of its Rust/renderer
boundary: a synchronous JS DSP fallback for local file playback, used only
when native analysis isn't available yet. That exception is allowed to exist
because it's:

- **Narrow** — one specific, named code path, not a general escape hatch.
- **Documented at the point of use** — the doc comment says why it's there
  (native async analysis wasn't ready) and what keeps it from becoming the
  common case (keeping native analysis reliably async is what keeps this
  fallback off the hot path).
- **Not a template** — nobody reading it should conclude "oh, we do this
  sometimes," they should conclude "this one thing is special and here's
  exactly why."

If you need an exception to a boundary rule, hold it to this bar: name it,
justify it in a comment at the crossing point, and make it something a
reviewer would immediately recognize as unusual rather than something that
blends in.

## One scheduler, sized to the actual resources it contends for

The mistake ad-hoc concurrency makes isn't "using threads" — it's each call
site inventing its own answer to identical questions: what happens if this
work is requested twice, what happens if the context that requested it goes
away, what happens if ten of these want to run at once. Centralizing that
into one engine means you solve each question exactly once.

lyric-viewer's job engine shape, as a template for any app with more than one
kind of background work:

- **Lanes matched to contention, not to task type.** I/O-bound work
  (network, disk) gets a semaphore sized for reasonable concurrency (8, in
  lyric-viewer's case) — the resource being protected is *external*
  responsiveness (rate limits, disk contention), so the limit is about
  politeness and stability, not CPU. CPU-bound work (analysis, transforms)
  gets a worker pool sized to `N-1` cores, leaving one core for the UI/main
  thread to stay responsive. A resource that can only safely support one
  concurrent user (an out-of-process model, a hardware device) gets a
  semaphore of exactly 1 — don't let two callers pretend they can share it.
- **Dedup by content, not by caller.** A `dedup_key` means "fetch lyrics for
  track X" requested from two different triggers collapses into one job, not
  two racing network calls that might return in either order and stomp each
  other's result.
- **Cancellation is a tree, not a flag someone forgets to check.** A
  `CancelToken` tree means cancelling a parent (the user changed tracks)
  cancels every child job transitively, without every leaf job author having
  to remember to check a boolean at every yield point.
- **Priority resolved at dispatch time, not submit time.** `Now`/`Next`/`Idle`
  priority is decided when a lane actually frees up. This matters because the
  *right* answer to "what's most important" can change between when work was
  queued and when a slot opens — freezing the decision at submit time would
  make the queue stale the moment user intent changes.
- **Crash survival, if you need it, is a separate concern layered on top**
  (lyric-viewer's SQLite-backed journal), not baked into the scheduler's core
  logic. Keep "how do I recover after a crash" separable from "how do I
  decide what runs next" — they're different problems and conflating them
  makes both harder to reason about.

## When one scheduler isn't warranted yet

If your app has exactly one kind of background operation and no realistic
near-term second kind, a full job-engine is premature machinery — pillar #2
is about *not inventing a new answer to concurrency at every call site*, not
about mandating a specific amount of infrastructure regardless of app size. A
single well-documented async queue is a legitimate "one scheduler" for a
small app. The line to watch for is the moment a second *kind* of background
work shows up — that's the signal to generalize before a second ad-hoc
mechanism gets written next to the first one.
