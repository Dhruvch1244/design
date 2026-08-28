# Design Philosophy — root file

This is the portable, single-file version of this philosophy. It is written to be
read by any AI coding tool — Claude, GPT, Gemini, Copilot, Cursor, a local model,
whatever comes next — not just ones that support multi-file imports. If nothing
else in this repo gets loaded, this file alone should still change how an agent
writes code.

Longer treatments of each pillar live in the sibling files in this directory
(`architecture.md`, `ui-interaction.md`, `code-style.md`, `anti-patterns.md`).
Read this file first; it stands on its own.

## Why this file exists

Most "design philosophy" documents are aspirational: values nobody actually
enforced under deadline. Every rule below was extracted from a decision that
shipped, in a real app, usually after the naive version broke something. Where
useful, the rule names the app it came from so it stays falsifiable — you can go
look at the commit, not just take the principle on faith.

The three source projects, referenced by short name throughout:

- **lyric-viewer** — a Tauri 2 + Rust desktop app that detects whatever's playing
  system-wide and renders synced lyrics with an audio-reactive visual backdrop.
- **file-viewer** — a .NET/WPF desktop app for opening and editing multi-GB
  Bloomberg data files without loading them fully into memory.
- **review-grader** — an Angular 17 signals-based web app.

## How to use this file (for AI agents specifically)

1. **Treat framework version as a fact to verify, not a fact to recall.** Your
   training data almost certainly contains more RxJS/NgModule Angular than
   signals-based Angular 17, more resident-process background-job patterns than
   per-process-sidecar ones, more "validate everything" data-entry UIs than
   "show reality" ones. When a repo's own AGENTS.md/CLAUDE.md contradicts your
   prior, the file wins — it was written by someone who watched the wrong
   pattern fail.
2. **A rule with no worked example in this file is a rule you should be
   suspicious of** — including ones you're tempted to add yourself. Don't
   invent new "best practices" prose; extend this file only from a decision
   that actually got made in actual code.
3. **When a principle below and a direct user instruction conflict, say so
   before picking one.** These are defaults for the ambiguous cases, not a
   override for explicit direction.

## The pillars

### 1. Separation of concerns is physical, not just logical

Don't just organize logic into differently-named functions inside one module —
put the thing that must never depend on your UI framework into a package that
*cannot* import your UI framework, so a bad import is a build error, not a code
review comment.

- **file-viewer**: `FileViewer.Core` (format parsing, indexing, editing,
  sorting/filtering, export) has zero dependency on WPF or any UI framework.
  It's a plain library. The payoff isn't hypothetical reuse — it's that the
  indexing and editing logic can be unit-tested with `dotnet test` in
  milliseconds, with no UI harness, and a future front end (web, CLI) is a
  matter of writing a new thin layer, not extracting logic that's currently
  tangled through `MainWindow.xaml.cs`.
- **lyric-viewer**: Rust owns the window, OS integration, all network/LLM
  calls, local-file decode, and all cached state. The renderer
  (`src/renderer/`, plain JS, no framework) **draws only** — it reacts to
  events and never originates a network call, cache write, or CPU-heavy pass
  itself. One narrow, explicitly documented exception exists (a synchronous
  JS DSP fallback for local playback when native analysis isn't available
  yet) — and the doc comment on it says *why* it's there and *why* it's
  supposed to stay off the hot path, so nobody "cleans it up" into the wrong
  shape later.

The test for whether you've actually achieved this: can the logic layer be
built and tested without the UI toolchain installed at all? If not, the
separation is aspirational.

**Anti-pattern this rules out**: a "service" class that's logic in name only,
importing `HttpClient`/`fetch`/a signal from the UI layer because it was
easier to reach for at the time. The dependency direction is the whole point;
convenience imports erase it silently.

### 2. One deliberate scheduler for concurrent/background work, never ad-hoc

The moment an app has more than one kind of background work (network calls,
CPU-heavy analysis, a slow external process), decide once — in one place — how
work is queued, prioritized, deduplicated, and cancelled. Do not let every call
site spawn its own thread/task and invent its own answer to "what if this
happens twice" or "what if the user navigated away."

- **lyric-viewer**'s job engine (`src-tauri/src/jobs/mod.rs`) is the *one*
  scheduler for every background task in the app — lyrics/artwork/mood/genre
  lookups, waveform/beat/key/structure/loudness analysis, sidecar
  transcription. Three lanes matched to the actual resource each kind of work
  contends for (I/O semaphore, CPU rayon pool sized to `N-1` threads, a
  single-slot inference lane for the model sidecar), every job deduplicated
  by a `dedup_key`, every job cancellable through a `CancelToken` tree, and
  priority (`Now`/`Next`/`Idle`) resolved when a lane actually frees up — not
  frozen at submit time, which matters because a track change should cancel
  everything still queued for the *previous* track, not race it.
- The rule this produces: **never reach for a bare `std::thread::spawn`
  (or your language's equivalent) once a scheduler like this exists.** Every
  new kind of background work is a new job type through the existing engine,
  not a new ad-hoc concurrency primitive. Consistency here is what makes
  cancellation, backpressure, and crash-survival (lyric-viewer's SQLite
  journal) apply uniformly instead of needing to be re-solved per call site.

**Anti-pattern this rules out**: "I'll just spawn a quick thread for this one
thing" repeated ten times across a codebase, each with a slightly different
answer for cancellation, error handling, and what happens if it's still
running when the next request comes in.

### 3. Non-destructive by default — never mutate the source of truth in place

If an operation can be undone, model it as a layer on top of the original,
not as an in-place mutation you hope you can reverse later.

- **file-viewer**: edits (cell edits, row add/duplicate/delete, bulk delete)
  are tracked as an **overlay** on top of the original file. The source file
  is never touched until an explicit export. Undo isn't a command-pattern
  stack bolted onto mutable state; it's a direct consequence of the fact that
  the original was never mutated in the first place — "undo" is just "don't
  apply this overlay entry."
- This generalizes past file editors: a settings screen that stages changes
  before "Save," a draft that doesn't touch the published version, a job
  queue that appends new work rather than rewriting a shared position — all
  the same shape.

**Anti-pattern this rules out**: editing state in place and trying to bolt
undo on afterward by recording inverse operations. It works until an edit
doesn't have a clean inverse (a lossy transform, a delete that drops data
needed to reconstruct the row), at which point undo silently degrades instead
of being structurally guaranteed.

### 4. Respect scale from day one — virtualize, cache, and measure instead of assuming

Don't write the version that works on the demo file and hope it holds up.
Decide up front what the actual ceiling is (file size, list length, concurrent
users) and design the data path for that ceiling, then prove it with a number.

- **file-viewer** targets files up to 2 GB and stays responsive by indexing on
  a background thread with progress reporting, decoding only the rows
  currently on screen (virtualized scrolling) backed by an unmanaged,
  non-GC-heap row index, with an LRU cache for decoded rows. None of that is
  "premature optimization" — 2 GB was the stated target from the start, and a
  naive "load it all into a `List<Row>`" implementation was never going to
  reach it.
- **lyric-viewer**'s perf harness (`scripts/perf/`) exists because this
  project's standing rule is: **claims about performance are measured against
  the real running app over the real DevTools protocol, never guessed or
  extrapolated from a vibe.** The harness's own doc notes that identical runs
  can vary 3-4x on the same hardware — which is exactly why "I made an
  optimization, it feels faster" is not evidence, and a repeated, controlled
  measurement is the only thing that counts.

**Anti-pattern this rules out**: optimizing (or worse, skipping optimization
of) something based on intuition about where the bottleneck "probably" is.
Measure first, on the real thing, under the real target load, or the effort
spent optimizing is a coin flip.

### 5. Trust the data — gatekeep structure, not content

Don't design a UI that rejects, flags, or "validates" data the user is trying
to look at, unless the underlying format is actually broken. Showing someone
their own data as it exists is usually more valuable than protecting them from
a value your app's author didn't anticipate.

- **file-viewer** has an explicit, named design decision: "No content
  validation gate. The app shows records as they are in the file; it doesn't
  reject or flag rows for looking 'malformed' — only structural file-format
  issues (e.g. a missing section marker) are surfaced as diagnostics." A row
  with a value the app's author never expected is not an error; a file
  missing a section the *format itself* requires is.

This is a narrower rule than it looks: it's specifically about content vs.
structure. Structural integrity is still enforced — you're allowed (expected)
to refuse to open a corrupt file. What you're not allowed to do is decide, on
the user's behalf, that a value inside a well-formed file is "wrong" and hide
or block it.

**Anti-pattern this rules out**: a "helpful" validation layer that silently
drops, coerces, or blocks rows because they don't match an assumption the
validation author made — turning a viewer into a filter the user didn't ask
for and may not know is happening.

### 6. Prefer the framework's current idiom over the one you remember

When a framework has moved (RxJS/NgModule Angular → standalone components and
signals; class components → hooks; whatever the next shift is), write in the
new idiom on purpose, and — critically for AI-assisted codebases — document
the specific places an assistant's stale training data will get it wrong.

- **review-grader** is Angular 17.3, standalone components only, built around
  `signal()`/`computed()`/`effect()`/`input()`/`output()` rather than
  RxJS/Zone patterns for component state. Its AGENTS.md doesn't just say "use
  signals" — it names the two specific footguns an LLM (or a developer
  fluent in older Angular) will hit:
  - **NG0600**: `effect()` throws if it writes to a signal unless created
    with `{ allowSignalWrites: true }` — and it fails *quietly*, the effect
    just stops running past the throw, so a broken effect looks like
    "nothing happens" rather than a visible crash. The fix isn't just "know
    the rule," it's "check the browser console when an effect seems to have
    stopped."
  - **`@let` requires Angular 18.1+** and hard-fails to parse on 17.3 — and
    some npm packages (icon libraries especially) ship newer compiled
    templates that emit `@let`, so a routine dependency bump can break the
    build in a way that looks unrelated to the version you actually asked
    for.

The generalizable rule: when your project pins a version behind the
ecosystem's current default assumption, or ahead of what most training data
reflects, **write down the specific failure mode**, not just the version
number. "We use Angular 17" doesn't stop anyone from writing `@let`; "`@let`
hard-fails to parse below 18.1, here's the error message it produces" does.

**Anti-pattern this rules out**: a version pin in `package.json` with no
accompanying note, so every new contributor (human or AI) rediscovers the
same footgun from scratch, usually as a confusing runtime or parse error with
no obvious connection to the version mismatch that caused it.

### 7. Reach for the standard library before a dependency, for anything small

If the need is small and well-defined (hash a string into a stable key, do
epoch-day arithmetic for a streak counter), write the ten lines by hand before
adding a package for it. This isn't NIH-syndrome — it's a bet that the
maintenance cost of a dependency (version churn, transitive vulnerabilities,
supply-chain surface, an API that outlives its usefulness) usually exceeds the
cost of a small, well-tested, private function that never needs to change.

- **lyric-viewer**'s `track_key` (a hand-rolled djb2 hash of
  `lower(artist)|lower(title)`, used as the cache filename for per-track
  data) and its weekday math for streak tracking in `stats.rs` are both
  explicitly "std first" — the project's own convention doc says to follow
  that instinct before reaching for a new dependency for something small.

Where the line is: this is about *small, stable, well-understood* problems —
hashing, date arithmetic, simple parsing. It is not license to hand-roll a
TLS stack, a date-time library with timezone rules, or anything where
correctness depends on a large, evolving spec. Use the judgment a senior
engineer would: "is this a function I can fully understand and will never
need to patch for a CVE" vs. "is this a whole subsystem I'm about to own
badly."

**Anti-pattern this rules out**: `npm install left-pad`-class dependencies —
pulling in a package, its transitive tree, and its update cadence for
something that's a screen's worth of code you could write once and never
think about again.

### 8. Documentation explains *why*, never *what*

A comment or doc file that restates what the code already says in its own
names is pure maintenance liability — it can drift from the code and nobody
notices, because nobody was relying on it for information. A comment that
records a trade-off, a rejected alternative, or a measured result is
load-bearing: removing it would lose information the code itself can't
express.

- **lyric-viewer**'s own convention doc states this directly: "Doc comments
  explain *why*, not what — trade-offs considered, what was measured, what
  was rejected and why. This is load-bearing for understanding the code, not
  decoration; read them before changing behavior they justify." Its
  `docs/JOB-ENGINE.md` even documents its own drift honestly — a section
  describing a SQLite migration that never actually happened, flagged as
  historical/aspirational rather than silently left to mislead the next
  reader.
- This document (and every AGENTS.md/CLAUDE.md/SKILL.md pattern in general)
  is itself an instance of the rule: it exists specifically because an AI
  agent's default assumptions need correcting with *why*, not just a
  restated rule.

**Anti-pattern this rules out**: `// increment i` above `i++`, and its
higher-stakes cousin — a design-decision doc that states the current rule
without the failure it was written in response to, so the next person (human
or AI) who feels the itch to "clean it up" has no way to know they'd be
reintroducing a bug that already happened once.

### 9. Async is a correctness property, not a performance nice-to-have

In any runtime where "forgetting `async`" silently degrades to blocking the
main/UI thread instead of failing loudly, treat that keyword as load-bearing
correctness, not an optional performance annotation to add later if it turns
out to matter.

- **lyric-viewer**: a `#[tauri::command]` handler without the `async` keyword
  runs on Tauri's main thread — any blocking I/O or CPU work inside it
  freezes the *entire* UI, every other command and all rendering, for the
  full duration. This isn't hypothetical: `analyze_local_file` and
  `read_local_file` were shipped without it and froze the app for 40-85
  seconds during local playback before being fixed. The project's rule now
  is explicit: check what a new command actually does — network request,
  non-trivial `fs` read, spawning a child process, audio decode/DSP — before
  assuming a plain `fn` is fine.

**Anti-pattern this rules out**: assuming a missing `async`/equivalent
annotation is purely a style nit to fix "when we get to it," when in the
runtime you're actually targeting it's a silent, user-visible freeze waiting
for someone to hit the slow path in production.

## What these pillars produce together

No single pillar here makes an app feel "next level." Together, they produce
a specific, recognizable quality:

- **It stays fast under real load**, because scale was a day-one constraint
  (#4) enforced by measurement, not vibes.
- **It never surprises the user by silently discarding or hiding their
  data** (#3, #5) — actions are reversible, and content isn't gatekept by
  assumptions the author baked in.
- **It doesn't rot when a dependency or framework moves out from under it**,
  because the boundary between "our logic" and "someone else's framework" is
  a real build boundary (#1), background work has one throat to choke (#2),
  and version-specific footguns are written down where the next
  contributor — human or AI — will actually see them (#6).
- **Its own documentation is trustworthy**, because it was written to capture
  decisions that would otherwise be silently re-broken (#8), including
  admitting where reality has drifted from an earlier plan.

That combination — fast, honest with the user's data, resilient to churn,
honestly documented — is the actual definition of "design philosophy" this
repo is trying to operationalize. Everything else (the component registry,
the CLI, the site) exists to make these pillars easy to *apply*, not just easy
to read.

## Where to go next

- `architecture.md` — the physical-separation and scheduling pillars (#1, #2),
  expanded with more shapes the boundary can take.
- `ui-interaction.md` — the non-destructive and trust-the-data pillars (#3,
  #5), expanded into concrete interaction patterns.
- `code-style.md` — the idiom-currency, std-first, and documentation pillars
  (#6, #7, #8) as line-level conventions.
- `anti-patterns.md` — every anti-pattern named above, collected in one place
  with the failure mode spelled out, for quick lookup.
