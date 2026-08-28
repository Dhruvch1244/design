# Anti-patterns — quick lookup

Every anti-pattern named across the philosophy docs, collected here for fast
reference. Each links back to the pillar it violates. If you're reviewing
code (your own or an agent's) and something feels off, check it against this
list before writing a new rule from scratch — it's probably already named.

## Convenience imports across a logic/UI boundary
**Violates**: Architecture #1 (physical separation).
A "service" or "core" module that imports a UI framework primitive (a signal,
a component base class, `fetch`/`HttpClient` used as a shortcut) because it
was reachable, not because the boundary was reconsidered. Symptom: the logic
package can no longer build or test without the UI toolchain installed.
Fix: move the import to the UI layer; pass data across the boundary as plain
values, not framework-flavored ones.

## Ad-hoc concurrency at every call site
**Violates**: Architecture #2 (one scheduler).
Each new background operation spawns its own thread/task/promise and
reinvents cancellation, dedup, and error handling slightly differently than
the last one. Symptom: cancelling "the current operation" doesn't actually
stop everything that operation started; two rapid requests for the same
thing race instead of collapsing into one.
Fix: route new background work through the existing scheduler; if none
exists yet, that's the moment to build a minimal one — see the architecture
doc's note on when a full job engine isn't warranted yet.

## Mutate-then-hope-for-undo
**Violates**: UI/interaction #3 (non-destructive by default).
Edits are applied directly to the in-memory (or persisted) model, and undo is
implemented afterward by recording inverse operations. Symptom: undo works
for simple edits and silently breaks (or is never implemented) for anything
lossy — a destructive transform, a delete that drops data needed to
reconstruct the row.
Fix: model edits as an overlay over an untouched original; undo becomes
"don't apply this overlay entry" instead of "compute and apply an inverse."

## Content gatekeeping disguised as validation
**Violates**: UI/interaction #5 (trust the data).
A validation layer silently drops, coerces, or blocks a row because its
content doesn't match an assumption the validation's author made — not
because the file/record is structurally malformed. Symptom: users report
"my data disappeared" or "some rows are missing" with no error, because the
app decided on their behalf that those rows didn't count.
Fix: validate structure (is this a well-formed instance of the format?);
never gate on content plausibility. Surface unusual values as information
(a flag, a filter), never as a silent removal.

## Version pin with no failure mode documented
**Violates**: Code style #6 (idiom currency, documented).
`package.json`/`*.csproj`/`Cargo.toml` pins a version behind or ahead of the
ecosystem default, with no note explaining what breaks and how. Symptom:
every new contributor (human or AI) independently rediscovers the same
footgun, usually as a confusing error with no obvious link to the version
that caused it, and burns time re-diagnosing something already known.
Fix: pair every deliberate version pin with a note in the project's
AGENTS.md/CLAUDE.md naming the specific API, the specific failure (parse
error vs. silent no-op vs. wrong behavior), and the fix — see the template
in `code-style.md`.

## Small dependency for a screen of code
**Violates**: Code style #7 (std-first).
A package (and its transitive tree, and its update cadence) is added for
something that's ten well-understood lines — a hash function, simple date
math, a debounce. Symptom: dependency count grows for no functional gain,
and an unrelated breaking change in a transitive dependency shows up in a
`npm audit`/Dependabot alert for code that didn't need to be a dependency at
all.
Fix: apply the three-question test in `code-style.md` — size, ongoing
maintenance burden, and whether hand-rolling it can be commented as
intentionally minimal.

## Comments that restate the code
**Violates**: Code style #8 (why, not what).
`// increment i` above `i++`; a doc file that describes what a function does
in prose that's already obvious from its name and signature. Symptom: once a
reader catches one comment that's pure noise, they start skimming past all
comments in the file — including the ones recording a real trade-off or a
rejected alternative that would have saved them time.
Fix: apply the removal test — if deleting the comment loses no information a
competent reader wouldn't already have, don't write it.

## Silent doc drift
**Violates**: Code style #8 (why, not what) — the honesty corollary.
A doc file describes a plan or architecture that changed, and instead of
being corrected or flagged, it's left to quietly mislead the next reader (or
worse, "corrected" by deleting the history of what was tried and rejected).
Symptom: a new contributor implements something *based on the doc* that
contradicts what the code actually does, because the doc never caught up.
Fix: when a doc goes stale, either update it or explicitly flag the stale
section as historical/aspirational — don't leave it silently wrong, and
don't erase the record of what was actually decided and why.

## Treating an async annotation as a style nit
**Violates**: Code style — async as correctness (`AGENTS.md` pillar #9).
A command/handler that does blocking I/O or CPU work is written as a plain,
non-async function "for now," on the assumption the annotation can be added
later if it turns out to matter. Symptom: in any runtime where this silently
degrades to blocking a shared thread (a UI main thread, an event loop)
instead of failing loudly, the bug doesn't show up until someone hits the
slow path in production — and by then it looks like "the app just freezes
sometimes," disconnected from the specific commit that caused it.
Fix: decide the async-ness of a handler at the moment you write it, based on
what it actually does (network call, non-trivial disk read, spawning a
process, heavy CPU work), not based on whether it's convenient to add the
keyword right now.
