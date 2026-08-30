# Code style — current idioms, std-first, and why-comments

Expands pillars #6, #7, and #8 from `AGENTS.md`. Read that file first.

## Writing down version-specific footguns, not just version numbers

A version pin in a manifest file tells a reader *what* is installed. It
doesn't tell them what breaks, how it breaks, or what error message they'll
see when it does. When a project deliberately sits behind or ahead of the
ecosystem's default assumption, pair the pin with the failure mode:

Template for this kind of note:

```
**<Feature/API>** requires <version X.Y+> and will <specific failure — hard
parse error, silent no-op, wrong runtime behavior> on this project's <version
Z>. <What triggers it in practice — a specific API, a specific dependency
category, a specific pattern>. <The fix or workaround, stated as an action>.
```

Compare the two forms directly:

- Weak: "We use Angular 17."
- Load-bearing: "`@let` template syntax requires Angular 18.1+ and will
  hard-fail to parse on this app's Angular 17.3. Some npm packages (icon
  libraries in particular) ship newer releases that emit `@let` in their
  compiled templates — pin to a version that predates it if a dependency
  bump starts failing with 'Incomplete block "let ..."'."

The second version is searchable by the exact error text a developer or
agent will actually see, which is the point — nobody hits this footgun by
searching for the words "Angular 17."

Also write down footguns that fail *silently*, not just ones that throw —
those are more dangerous precisely because nothing tells you to go look.
NG0600 (`effect()` writing to a signal without `allowSignalWrites: true`)
throws internally but the effect just stops running past that point; from
the outside it looks like "the feature does nothing," not like a crash. The
note that saves the next person isn't "don't write to signals in effects,"
it's "if an effect seems to have silently stopped working, check the
browser console before assuming the logic is wrong."

## std-first: the actual decision procedure

"Prefer the standard library" isn't a blanket rule against dependencies —
frameworks, HTTP clients, and anything with a real spec (dates with
timezones, TLS, cryptography) are correctly delegated to a library written by
people who specialize in getting the edge cases right. The rule is narrower
and applies to a specific shape of problem. Ask, in order:

1. **Is the whole problem expressible in a screen or two of code?** (A hash
   function for a cache key. Epoch-day arithmetic for a streak counter. A
   simple debounce.) If not, stop here — use a library.
2. **Once written, will it ever need a patch for reasons outside your
   control** (a security advisory, a spec update, a new edge case defined by
   someone else)? If yes, that's a sign the problem has more surface area
   than it looks like — use a library.
3. **If both answers favor hand-rolling: write it, with a comment stating
   the specific need it satisfies** (not a general-purpose version — the
   exact one your call site needs), so a future reader knows it's
   intentionally minimal rather than an abandoned attempt at something
   bigger.

lyric-viewer's `track_key` (djb2 hash of `lower(artist)|lower(title)`) and
weekday math for streaks both pass this test: small, fully understood, never
going to need a CVE patch. A hand-rolled date-time library with its own
timezone database would fail it immediately at step 2.

The payoff this buys, concretely: fewer transitive dependencies to audit, no
version to bump when the maintainer changes an API you didn't need, and one
less thing that can break in a way that has nothing to do with your actual
feature work.

## Comments and docs: the removal test

Before writing a comment, apply this test: **if I deleted this comment,
would a competent reader of the code lose information, or would they lose
nothing because the code already says it?**

- `// increment i` above `i++` — deleting it loses nothing. Delete it
  preemptively; don't write it in the first place.
- A comment recording that an approach was tried and rejected, with the
  reason — deleting it means the next person re-tries the rejected approach,
  hits the same wall, and burns the time that comment was there to save.
  Keep it.
- A comment recording a measured number ("varies 3-4x run to run on this
  hardware, hence the perf harness") — deleting it means a future contributor
  trusts a single benchmark run they shouldn't. Keep it.

Illustrative example of the mistake, and the fix:

```ts
// Anti-pattern — restates what the code already says. Deleting this
// comment loses nothing a competent reader wouldn't already know.
// increment i
i++;
```

```ts
// Fix — records information the code can't say on its own. Deleting
// this one means the next person burns time re-discovering the same wall.
// Retried with exponential backoff first; abandoned because the upstream
// API rate-limits by IP, not by key, so backoff alone never converges.
i++;
```

This applies at doc-file granularity too, not just line comments.
lyric-viewer's own `docs/JOB-ENGINE.md` contains a section describing a
SQLite migration that was planned but never happened — and rather than
silently delete or "fix" that section to match reality, the project's own
conventions flag it explicitly as historical/aspirational. That's the same
instinct at a different scale: information about *why the current state
differs from an earlier plan* is exactly the kind of thing that's expensive
to reconstruct once lost, so it's worth the awkwardness of an admittedly
stale doc section over a doc that quietly claims to be fully current when
it isn't.

Applying the removal test consistently also keeps documentation trustworthy
as a category — the moment a reader catches one comment that's pure noise,
they start skimming past all of them, including the ones that would have
saved them real time.
