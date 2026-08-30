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

export interface CaseStudyCodeSnippet {
  lang: string;
  filename: string;
  snippet: string;
}

export interface CaseStudySection {
  heading: string;
  body: string;
  quote?: string;
  // Verbatim excerpts pulled live from the linked public repo — never
  // paraphrased or invented. If a claim in `body` couldn't be verified
  // against real, current source, this is left empty rather than faked;
  // see this file's own header comment on why that line isn't crossed.
  code?: CaseStudyCodeSnippet[];
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
        code: [
          {
            lang: "markdown",
            filename: "CLAUDE.md",
            snippet:
              '`src-tauri/` (Rust) owns the window, OS integration (SMTC, tray, wallpaper\nmode, power-state watchers), all network/LLM calls, local-file decode, and\nall cached state. `src/renderer/` (plain JS, no framework/bundler) is a\nWebView2 page that **draws only** — it reacts to Tauri events\n(`mood`, `genre`, `lyrics`, `attribution`, `beatmap`, `track`, `tick`, ...)\nvia `src/renderer/tauri-shim.js` and never originates a network call, cache\nwrite, or CPU-heavy analysis pass itself, with one narrow exception: local\nfile playback has a synchronous JS DSP fallback in `analyze.js` for when\nnative analysis is unavailable (see the async-command note below — this\nfallback path is also *slow*, so keeping native analysis correctly async is\nwhat keeps it from ever being needed on the hot path).',
          },
        ],
      },
      {
        heading: "One scheduler, sized to what it actually contends for",
        body:
          "The job engine (src-tauri/src/jobs/mod.rs) doesn't give every kind of background work the same treatment. I/O-bound work gets a dedicated concurrency lane sized for the actual fan-out — the resource being protected is external responsiveness, not CPU. CPU-bound analysis gets a worker pool sized to N-1 cores, leaving one core for the UI thread. A resource that can only safely support one concurrent user gets a lane of exactly 1. A dedup_key means two triggers requesting lyrics for the same track collapse into one job instead of two racing network calls. Cancellation is a CancelToken tree, so cancelling a parent (the user changed tracks) cancels every child job transitively. Priority (Now/Next/Idle) is resolved when a lane actually frees up, not frozen at submit time. Crash survival — a SQLite-backed journal — is layered on top as a separate concern, not baked into the scheduling logic itself.",
        code: [
          {
            lang: "rust",
            filename: "src-tauri/src/jobs/mod.rs",
            snippet:
              "let cpu_threads = std::thread::available_parallelism()\n    .map(|n| n.get().saturating_sub(1).max(1))\n    .unwrap_or(1);\n\nlet mut lanes = Vec::with_capacity(Lane::ALL.len());\nfor lane in Lane::ALL {\n    let (threads, below_normal, limit, name) = match lane {\n        // 6 concurrent network calls is enough to fan out to every\n        // lyric and artwork source at once without looking like abuse\n        // to any of them.\n        Lane::Io => (6, false, 6, \"job-io\"),\n        Lane::Cpu => (cpu_threads, true, cpu_threads, \"job-cpu\"),\n        Lane::Inference => (1, true, 1, \"job-infer\"),\n    };\n    lanes.push(spawn_lane(\n        Pool::new(threads, below_normal, name),\n        limit,\n        Arc::clone(&registry),\n    ));\n}",
          },
          {
            lang: "rust",
            filename: "src-tauri/src/jobs/mod.rs",
            snippet:
              "fn submit(&self, job: Box<dyn Runnable>, priority: Priority) -> bool {\n    let key = job.dedup_key();\n    let track = job.track();\n    let cancel = CancelToken::default();\n\n    // Register before queueing. Doing it the other way round would let two\n    // submissions of the same key both pass the check and both queue.\n    {\n        let mut reg = self.registry.lock().unwrap_or_else(|e| e.into_inner());\n        if reg.inflight.contains_key(&key) {\n            return false;\n        }\n        reg.inflight.insert(key.clone(), cancel.clone());\n        if let Some(track) = &track {\n            reg.by_track.entry(track.clone()).or_default().insert(key.clone());\n        }\n    }\n\n    let lane = self.lanes[job.lane().index()].tx[priority.index()].clone();\n    if lane.send(Envelope { job, cancel }).is_err() {\n        release(&self.registry, &key, track.as_deref());\n        return false;\n    }\n    true\n}",
          },
        ],
      },
      {
        heading: "Measure, don't guess",
        body:
          "A perf harness (scripts/perf/) exists specifically because informal benchmarking wasn't trustworthy enough to make claims from. One comment in the codebase records that results \"vary 3-4x run to run on this hardware\" — the kind of measured, specific number that's expensive to reconstruct once lost, so it stayed in the code as a comment instead of getting cleaned up as noise.",
        code: [
          {
            lang: "markdown",
            filename: "CLAUDE.md",
            snippet:
              'Drives the real app over the Chrome DevTools Protocol — this project\'s\nstanding rule is **measure the real thing, never guess or extrapolate from\n"observed" frame rate** (repeated identical runs vary 3-4x on this hardware).\n\n```sh\nnpm run perf                    # steady-state scenario harness (dev build)\nnpm run perf:build-release       # build an instrumented release binary (own CARGO_TARGET_DIR, never bundled)\nnpm run perf -- --build release  # run the harness against it\nnpm run perf:startup             # from-launch startup-burst measurement\n```',
          },
        ],
      },
      {
        heading: "Standard library first, for the parts that actually qualify",
        body:
          "track_key is a hand-rolled djb2 hash of lower(artist)|lower(title); the streak counter uses hand-rolled weekday math. Both pass the actual test for hand-rolling something instead of reaching for a dependency: the whole problem fits in a screen or two of code, and neither will ever need a patch for reasons outside this project's control (no security advisory, no spec update, no external edge case). A hand-rolled timezone-aware date library would fail that same test immediately — which is exactly why this project doesn't have one.",
        code: [
          {
            lang: "rust",
            filename: "src-tauri/src/commands/lyrics_cmds.rs",
            snippet:
              "/// Filename-safe cache key for a track (djb2 hash of normalised artist+title).\npub(crate) fn track_key(artist: &str, title: &str) -> String {\n    let base = format!(\"{}|{}\", artist.to_lowercase().trim(), title.to_lowercase().trim());\n    let mut hash: u64 = 5381;\n    for b in base.bytes() {\n        hash = hash.wrapping_mul(33).wrapping_add(b as u64);\n    }\n    format!(\"{hash:016x}\")\n}",
          },
          {
            lang: "rust",
            filename: "src-tauri/src/stats.rs",
            snippet:
              "fn current_streak(days: &HashSet<i64>, today: i64) -> i64 {\n    let mut cursor = if days.contains(&today) {\n        today\n    } else if days.contains(&(today - 1)) {\n        today - 1\n    } else {\n        return 0;\n    };\n    let mut streak = 0i64;\n    while days.contains(&cursor) {\n        streak += 1;\n        cursor -= 1;\n    }\n    streak\n}",
          },
        ],
      },
      {
        heading: "Honest about drift, not just about the present",
        body:
          "The project's own docs/JOB-ENGINE.md tracks status per phase rather than describing one static architecture — including which pieces shipped differently than planned (a JS file slated for deletion that's still there on purpose, a phase whose proposed fixes were rejected once the numbers came back). Rather than silently rewrite history to match current reality, drift gets named explicitly. A doc that quietly claims to be fully current when it isn't is worse than one that admits where it moved — the first one costs the next reader (human or AI) real time re-discovering the gap themselves.",
        code: [
          {
            lang: "markdown",
            filename: "docs/JOB-ENGINE.md",
            snippet:
              "**Status:** Phase 1 landed except the SQLite journal, which moved into Phase 3 and is done (§7.1, §7.7). Phase 2 landed except the local-folder `Idle` backfill, which moved to Phase 7 (§7.2). **Phase 3 is complete**... Deleting `whisper.js` was the one item dropped rather than done, deliberately: §7.10 explains why the WebView path stays as the vocal-isolation fallback. Phase 4 closed — profiled, and the fixes it proposed were rejected on the measurements (§7.9).",
          },
        ],
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
        code: [
          {
            lang: "xml",
            filename: "src/FileViewer.Core/FileViewer.Core.csproj",
            snippet:
              '<Project Sdk="Microsoft.NET.Sdk">\n\n  <PropertyGroup>\n    <AllowUnsafeBlocks>true</AllowUnsafeBlocks>\n  </PropertyGroup>\n\n  <ItemGroup>\n    <InternalsVisibleTo Include="FileViewer.Core.Tests" />\n  </ItemGroup>\n\n</Project>',
          },
        ],
      },
      {
        heading: "Edits as an overlay, not a mutation",
        body:
          "Cell edits, row add/duplicate/delete, and bulk delete are all represented as entries in an ordered overlay over the original file contents — the original stays untouched in memory for the whole session. The view renders original + overlay, never a mutated copy. Undo is \"remove the last overlay entry,\" not \"compute and apply an inverse\" — which is why it's structurally guaranteed to work rather than best-effort: there's no edit that lacks an inverse, because the inverse is simply not applying it. The overlay only gets materialized into a new file at an explicit Save/Export — closing without saving is trivially correct, since it's just discarding the overlay.",
        code: [
          {
            lang: "csharp",
            filename: "src/FileViewer.Core/Overlay/EditOverlay.cs",
            snippet:
              "public void Undo()\n{\n    lock (_gate)\n    {\n        if (_rowOps.Count == 0) return;\n        RowOp op = _rowOps[^1];\n        _rowOps.RemoveAt(_rowOps.Count - 1);\n        ApplyReversalNoLock(op);\n    }\n}",
          },
        ],
      },
      {
        heading: "Scale as a day-one constraint, not a later optimization",
        body:
          "The app targets files up to 2 GB and stays responsive by indexing on load rather than holding the whole file in memory or re-scanning it per interaction — the kind of decision that has to be made in the data-access design from the start, because retrofitting indexing onto code written as if files were small is a rewrite, not a patch.",
        code: [
          {
            lang: "csharp",
            filename: "src/FileViewer.Core/Indexing/FileIndex.cs",
            snippet:
              "/// Owns a read-only handle onto a DIF file plus the unmanaged row index and sort-key arrays built\n/// by <see cref=\"FileIndexer\"/>. The source file is never mutated — <see cref=\"GetRowBytes\"/> reads\n/// a row's bytes on demand via <see cref=\"RandomAccess\"/> rather than through a persistent\n/// memory-mapped view of the whole file: mapping the entire file into one contiguous view up front\n/// is an all-or-nothing commitment that can fail on Windows (ERROR_NOT_ENOUGH_MEMORY) depending on\n/// how much memory/page-file space happens to be free on the machine at that moment — a real failure\n/// this project hit in practice, independent of the file's actual size (see git history). Reading\n/// each row on demand instead means opening the file never requires reserving space for the whole\n/// thing at once.",
          },
        ],
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
        code: [
          {
            lang: "markdown",
            filename: "AGENTS.md",
            snippet:
              "`apps/web` is Angular 17.3, standalone components only (no NgModules), built\naround signals (`signal()`, `computed()`, `effect()`, `input()`, `output()`)\nrather than RxJS/Zone-based patterns for component state. Two things that\ndiffer from older training data and are easy to get wrong:\n\n- **NG0600**: `effect()` throws if it writes to a signal (directly, or\n  indirectly - e.g. calling a service method that does) unless the effect\n  is created with `effect(fn, { allowSignalWrites: true })`. ...\n- **`@let` template syntax requires Angular 18.1+** and will hard-fail to\n  parse on this app's Angular 17.3. ...",
          },
        ],
      },
      {
        heading: "NG0600 — a footgun that fails silently",
        body:
          "effect() throws internally if it writes to a signal without { allowSignalWrites: true } — but the effect just stops running past that point. From the outside, this looks like \"the feature does nothing,\" not like a crash. The note that actually saves the next person isn't \"don't write to signals in effects\" in the abstract — it's \"if an effect seems to have silently stopped working, check the browser console before assuming the logic itself is wrong.\" Silent failures are the ones worth documenting most, precisely because nothing else tells you to go look.",
        code: [
          {
            lang: "typescript",
            filename: "apps/web/src/app/shared/question-session.component.ts",
            snippet:
              "      .finally(() => {\n        if (!cancelled) this.loading.set(false);\n      });\n    // Angular disallows signal writes inside effect() by default (NG0600);\n    // this effect intentionally writes loading/questions/ratings as it fetches.\n  }, { allowSignalWrites: true });",
          },
        ],
      },
      {
        heading: "@let and the version-behind-default trap",
        body:
          "@let template syntax requires Angular 18.1+ and hard-fails to parse on this app's 17.3. The trap: some npm packages (icon libraries especially) ship newer compiled templates that emit @let, so a routine, unrelated dependency bump can break the build with an error — 'Incomplete block \"let ...\"' — that has no obvious connection to the version pin that actually caused it. Writing \"we use Angular 17\" in a doc doesn't stop anyone from hitting this; writing the exact error text and the exact trigger does, because that's what a developer or agent will actually search for.",
        code: [
          {
            lang: "markdown",
            filename: "AGENTS.md",
            snippet:
              '- **`@let` template syntax requires Angular 18.1+** and will hard-fail to\n  parse on this app\'s Angular 17.3. Some npm packages (icon libraries in\n  particular) ship newer releases that emit `@let` in their compiled\n  templates - pin to a version that predates it if a dependency bump starts\n  failing with "Incomplete block \\"let ...\\"".',
          },
        ],
      },
    ],
  },
];

export function findCaseStudyBySlug(slug: string) {
  return CASE_STUDIES.find((study) => study.slug === slug);
}
