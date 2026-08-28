// Case study content, curated from philosophy/*.md rather than re-derived
// independently — those docs already did the work of verifying which file,
// which decision, which failure mode, per app. Restating that work here
// risks drifting from what the philosophy docs actually say; this module
// is deliberately downstream of them, not a parallel source of truth.
//
// No commit hashes are included: none of the philosophy docs cite one, and
// inventing one to look more "proof-like" would violate the falsifiability
// standard this whole site is built on (`philosophy/AGENTS.md`'s own
// framing — every rule traces to something real, named). The repo + file
// path is the real, checkable reference instead.

export interface CaseStudySection {
  heading: string;
  body: string;
  quote?: string;
}

export interface CaseStudy {
  slug: string;
  name: string;
  tagline: string;
  stack: string;
  repo: string;
  sections: CaseStudySection[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "lyric-viewer",
    name: "lyric-viewer",
    tagline: "Fullscreen, beat-aware synced lyric overlay for Windows.",
    stack: "Tauri 2 + Rust, WebView2 renderer",
    repo: "https://github.com/dhruvch1244/lyric-viewer",
    sections: [
      {
        heading: "Physical separation, with one named exception",
        body:
          "The Rust side owns SMTC (Windows media session) integration, every network/LLM call, caching, and job scheduling — none of it references the WebView2 renderer. Delete the whole UI layer and the Rust side still makes sense on its own; the renderer could be swapped for a different drawing surface without touching it. There's exactly one deliberate crossing of that boundary: a synchronous JS DSP fallback for local file playback, used only when native analysis isn't available yet. It's allowed to exist because it's narrow (one named code path, not a general escape hatch), documented at the point of use (why it's there, what keeps it from becoming the common case), and unmistakably an exception rather than a pattern to copy.",
      },
      {
        heading: "One scheduler, sized to what it actually contends for",
        body:
          "The job engine (src-tauri/src/jobs/mod.rs) doesn't give every kind of background work the same treatment. I/O-bound work gets a semaphore sized for reasonable concurrency (8) — the resource being protected is external responsiveness, not CPU. CPU-bound analysis gets a worker pool sized to N-1 cores, leaving one core for the UI thread. A resource that can only safely support one concurrent user gets a semaphore of exactly 1. A dedup_key means two triggers requesting lyrics for the same track collapse into one job instead of two racing network calls. Cancellation is a CancelToken tree, so cancelling a parent (the user changed tracks) cancels every child job transitively. Priority (Now/Next/Idle) is resolved when a lane actually frees up, not frozen at submit time. Crash survival — a SQLite-backed journal — is layered on top as a separate concern, not baked into the scheduling logic itself.",
      },
      {
        heading: "Measure, don't guess",
        body:
          "A perf harness (scripts/perf/) exists specifically because informal benchmarking wasn't trustworthy enough to make claims from. One comment in the codebase records that results \"vary 3-4x run to run on this hardware\" — the kind of measured, specific number that's expensive to reconstruct once lost, so it stayed in the code as a comment instead of getting cleaned up as noise.",
      },
      {
        heading: "Standard library first, for the parts that actually qualify",
        body:
          "track_key is a hand-rolled djb2 hash of lower(artist)|lower(title); the streak counter uses hand-rolled weekday math. Both pass the actual test for hand-rolling something instead of reaching for a dependency: the whole problem fits in a screen or two of code, and neither will ever need a patch for reasons outside this project's control (no security advisory, no spec update, no external edge case). A hand-rolled timezone-aware date library would fail that same test immediately — which is exactly why this project doesn't have one.",
      },
      {
        heading: "Honest about drift, not just about the present",
        body:
          "The project's own docs/JOB-ENGINE.md contains a section describing a SQLite migration that was planned but never happened. Rather than silently delete it or rewrite it to match current reality, it's explicitly flagged as historical/aspirational. A doc that quietly claims to be fully current when it isn't is worse than one that admits where it's stale — the first one costs the next reader (human or AI) real time re-discovering the gap themselves.",
      },
    ],
  },
  {
    slug: "file-viewer",
    name: "file-viewer",
    tagline: "Opening and editing multi-GB files without the app falling over.",
    stack: ".NET / WPF desktop",
    repo: "https://github.com/dhruvch1244/File-Viewer",
    sections: [
      {
        heading: "A boundary fast enough that the tests actually get run",
        body:
          "FileViewer.Core has zero reference to WPF. Its test suite, FileViewer.Core.Tests, runs as plain xUnit against a plain library — no WPF App, no window, no UI harness. That speed isn't incidental: it's the direct, measurable consequence of the boundary being real rather than a naming convention, and it's also what makes the tests something people actually run instead of skip under deadline pressure.",
      },
      {
        heading: "Edits as an overlay, not a mutation",
        body:
          "Cell edits, row add/duplicate/delete, and bulk delete are all represented as entries in an ordered overlay over the original file contents — the original stays untouched in memory for the whole session. The view renders original + overlay, never a mutated copy. Undo is \"remove the last overlay entry,\" not \"compute and apply an inverse\" — which is why it's structurally guaranteed to work rather than best-effort: there's no edit that lacks an inverse, because the inverse is simply not applying it. The overlay only gets materialized into a new file at an explicit Save/Export — closing without saving is trivially correct, since it's just discarding the overlay.",
      },
      {
        heading: "Scale as a day-one constraint, not a later optimization",
        body:
          "The app targets files up to 2 GB and stays responsive by indexing on load rather than holding the whole file in memory or re-scanning it per interaction — the kind of decision that has to be made in the data-access design from the start, because retrofitting indexing onto code written as if files were small is a rewrite, not a patch.",
      },
    ],
  },
  {
    slug: "review-grader",
    name: "review-grader",
    tagline: "An Angular 17.3, signals-based web app.",
    stack: "Angular 17.3, standalone components",
    repo: "https://github.com/dhruvch1244/Review-Grader",
    sections: [
      {
        heading: "The current idiom, on purpose, with the footguns named",
        body:
          "Standalone components only, built around signal()/computed()/effect()/input()/output() rather than RxJS/Zone.js patterns for component state — the framework's current idiom, chosen deliberately rather than defaulted into. Its own AGENTS.md doesn't just say \"use signals,\" it names the two specific ways an LLM (or a developer fluent in older Angular) will get it wrong on this exact version.",
      },
      {
        heading: "NG0600 — a footgun that fails silently",
        body:
          "effect() throws internally if it writes to a signal without { allowSignalWrites: true } — but the effect just stops running past that point. From the outside, this looks like \"the feature does nothing,\" not like a crash. The note that actually saves the next person isn't \"don't write to signals in effects\" in the abstract — it's \"if an effect seems to have silently stopped working, check the browser console before assuming the logic itself is wrong.\" Silent failures are the ones worth documenting most, precisely because nothing else tells you to go look.",
      },
      {
        heading: "@let and the version-behind-default trap",
        body:
          "@let template syntax requires Angular 18.1+ and hard-fails to parse on this app's 17.3. The trap: some npm packages (icon libraries especially) ship newer compiled templates that emit @let, so a routine, unrelated dependency bump can break the build with an error — 'Incomplete block \"let ...\"' — that has no obvious connection to the version pin that actually caused it. Writing \"we use Angular 17\" in a doc doesn't stop anyone from hitting this; writing the exact error text and the exact trigger does, because that's what a developer or agent will actually search for.",
      },
    ],
  },
];

export function findCaseStudyBySlug(slug: string) {
  return CASE_STUDIES.find((study) => study.slug === slug);
}
