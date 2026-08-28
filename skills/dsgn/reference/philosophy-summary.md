# Philosophy summary

Condensed from `philosophy/AGENTS.md`, the portable root file of the
`dhruvch1244/design` philosophy. That file's own framing: every rule here was
extracted from a decision that actually shipped, in a real app, usually after
the naive version broke something — not an aspirational value list. Three
source projects are referenced throughout: **lyric-viewer** (Tauri 2 + Rust),
**file-viewer** (.NET/WPF), **review-grader** (Angular 17, signals).

This governs code structure and correctness for *any* code written while the
`dsgn` skill is active — it applies regardless of which of the five visual
style agents is chosen. The style agents only differ in what the UI looks and
moves like; they don't get to violate any of the nine rules below.

## The nine pillars

1. **Separation of concerns is physical, not just logical.** The thing that
   must never depend on your UI framework goes in a package that *cannot*
   import it, so a bad import is a build error, not a review comment. Test:
   can the logic layer build and test without the UI toolchain installed at
   all?

2. **One deliberate scheduler for concurrent/background work, never ad-hoc.**
   The moment an app has more than one kind of background work, decide once
   how it's queued, prioritized, deduplicated, and cancelled. Never let a new
   feature spawn its own thread/task with its own bespoke answer to "what if
   this happens twice."

3. **Non-destructive by default — never mutate the source of truth in
   place.** Model undoable operations as an overlay on top of the original,
   not an in-place mutation you hope to reverse later. Undo should be a
   structural consequence of the design, not a bolted-on inverse-operation
   stack.

4. **Respect scale from day one — virtualize, cache, and measure instead of
   assuming.** Decide the actual ceiling (file size, list length, concurrent
   users) up front and design for it. Performance claims are measured against
   the real running thing, never guessed from a vibe — identical runs can
   vary 3-4x on the same hardware, so "it feels faster" is not evidence.

5. **Trust the data — gatekeep structure, not content.** Don't design a UI
   that rejects or "validates" data the user is trying to look at unless the
   underlying *format* is actually broken. A value the app's author didn't
   anticipate is not an error; only structural format issues are diagnostics.

6. **Prefer the framework's current idiom over the one you remember.** When a
   framework has moved, write in the new idiom on purpose, and document the
   *specific* footguns an assistant's stale training data will hit — not
   just "we use version X," but the exact failure mode and error message.

7. **Reach for the standard library before a dependency, for anything
   small.** If a problem is small, stable, and well-understood (a hash
   function, date arithmetic), write it by hand rather than adding a package
   whose version churn and transitive surface will outlast its usefulness.
   Not license to hand-roll TLS or timezone-aware date math — use the
   judgment of "can I fully understand this and never need to patch it for a
   CVE" vs. "am I about to own a whole subsystem badly."

8. **Documentation explains *why*, never *what*.** A comment restating what
   the code already says is pure liability — it drifts and nobody notices,
   because nobody relied on it for information. A comment recording a
   trade-off, a rejected alternative, or a measured result is load-bearing.
   Honest docs admit drift rather than silently misleading the next reader.

9. **Async is a correctness property, not a performance nice-to-have.** In
   any runtime where "forgetting async" silently blocks the main/UI thread
   instead of failing loudly, treat it as load-bearing correctness. Check
   what a new operation actually does — network call, non-trivial I/O, a
   spawned process — before assuming a synchronous path is fine.

## What these produce together

Fast under real load (measured, not assumed), never surprises the user by
silently discarding their data, doesn't rot when a dependency or framework
moves out from under it, and its own documentation is trustworthy because it
admits where reality has drifted from an earlier plan.

## Further reading in the source repo

- `philosophy/architecture.md` — pillars #1–2, expanded with more shapes the
  physical-separation boundary can take.
- `philosophy/ui-interaction.md` — pillars #3, #5, expanded into concrete
  interaction patterns.
- `philosophy/code-style.md` — pillars #6–8 as line-level conventions.
- `philosophy/anti-patterns.md` — every anti-pattern named above, collected
  for quick lookup with its failure mode spelled out.
