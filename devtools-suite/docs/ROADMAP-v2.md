# Dev Tools Suite — v2.0 Blueprint

Taking the suite from three tools to a complete local developer workbench, tuned for a
Java / Angular / Hadoop / AWS working day: a SQL workspace with saved queries and stored
sample outputs, a notes system, a folder tree that organises everything, and HTML/Markdown
export throughout.

---

## 1. Where the project stands today

### Shipped in v1.0.0 (commit `08dd65f`)

The last commit on `claude/design-philosophy-ai-repo-jmwo7j` introduced the whole suite in one
drop — a Spring Boot 3.3.4 / Java 17 backend and a Vite + React + Tailwind + Framer Motion
frontend, packaged as a single offline jar behind a `run.bat` launcher.

| Area | What landed |
| --- | --- |
| **File Search** | Single-term grep over an uploaded file, regex + case-sensitivity toggles, line numbers, 20k match cap |
| **JSON / XML** | Pretty-print, validate, tree visualiser, JSON ↔ escaped-string conversion, SOAP handling |
| **List Converter** | `a,b,c` → `('a','b','c')` quoted and unquoted tuple output |
| **History** | H2 file database, one `history_entry` table, per-tool history panel with reuse |
| **Shell** | Sidebar nav, 7 themes, 3 ligature coding fonts, settings popover |

### Uncommitted work in progress

Your working tree holds an unfinished **multi-term search** upgrade:

- `FileSearchService` takes a `List<String>` of terms and returns per-term groups via a new
  `TermMatches` DTO; `FileSearchResult` swapped `matchCount`/`matches`/`truncated` for
  `totalMatches`/`termResults`.
- The controller accepts a newline-delimited `terms` param instead of a single `term`.
- `FileSearchPage.tsx` gained a term textarea, a live counter, and per-term result cards.
- `themes.ts` picked up more palettes.

Finish and commit this before v2 begins — the search enhancements below build on it.

### The two real defects

1. **The 40GB problem.** Every search uploads the whole file from the browser to a backend on the
   same machine. `application.properties` caps this at 200MB in three places, which is why large
   files fail. Raising the numbers is not the fix — copying 40GB over HTTP into a Tomcat temp file
   on every search is architecturally wrong for a local tool.
2. **Unbounded line buffering.** `BufferedReader.readLine()` caps nothing. A multi-GB file with no
   newlines exhausts the heap regardless of any file-size limit. Hadoop part-files and single-line
   JSON dumps hit this routinely.

---

## 2. Target architecture

### Backend packages — feature-first

At three tools the current `controller/service/dto` split is fine; at twenty it is unnavigable.

```
backend/src/main/java/com/dhruv/devtools/
├── DevtoolsSuiteApplication.java
├── common/
│   ├── error/            ApiExceptionHandler, ApiError, DevtoolsException
│   ├── export/           ExportService, HtmlRenderer, MarkdownRenderer
│   ├── storage/          WorkspaceRoot, BlobStore, PathGuard
│   └── web/              CorsConfig, JacksonConfig, MultipartConfig
├── search/               FileSearchService (streaming), PathSearchService (zero-copy),
│                         ArchiveSearchService (.gz/.zip/.tar.gz/.snappy)
├── format/               JsonService, JsonPathService, JsonDiffService, XmlService,
│                         XPathService, XsdValidator, YamlService, CsvService, AvroService
├── sql/                  ConnectionService, CredentialVault, QueryExecutionService,
│                         ResultPager, SnippetService, ParameterBinder,
│                         SchemaIntrospectionService
│   └── model/            SavedQuery, QueryRevision, QueryRun, SampleOutput, DbConnection
├── notes/                NoteService, NoteLinkResolver  ·  model/ Note, NoteRevision
├── workspace/            FolderService, TreeBuilder, TagService  ·  model/ Folder, Tag, ItemRef
├── java/                 StackTraceService, JvmFlagService, JarInspectService,
│                         PomTreeService, ClassDecodeService
├── web/                  JwtService, HarAnalysisService, BundleStatsService, CorsCheckService
├── bigdata/              HdfsPathService, ParquetReadService, AvroSchemaService,
│                         OrcStatsService, SparkPlanService, HiveDdlService
├── cloud/                S3BrowseService, CloudWatchQueryService, IamPolicyService,
│                         ArnParseService, SqsInspectService, DynamoQueryService
├── convert/              ListConverterService, EncodeService, TimeService, RegexService
└── history/              HistoryService, FavouriteService  ·  model/ HistoryEntry
```

### Frontend layout

```
frontend/src/
├── app/                  App.tsx, router.tsx, shortcuts.ts, command-palette.tsx
├── tools/
│   ├── search/           SearchPage, TermCard, MatchList, PathPicker, ProgressBar
│   ├── json-xml/         JsonXmlPage, JsonTree, DiffView, JsonPathBar, SchemaGen
│   ├── sql/              SqlPage, Editor, ResultGrid, SchemaTree, SavedQueries,
│   │                     RunHistory, SampleOutputPanel, ParamBar
│   ├── notes/            NotesPage, NoteEditor, BacklinkPanel
│   ├── java/             StackTracePage, JarInspectPage, PomTreePage
│   ├── bigdata/          ParquetPage, AvroPage, HdfsPage, SparkPlanPage
│   ├── cloud/            S3Page, CloudWatchPage, IamPage, ArnPage
│   ├── convert/          ListConverterPage, EncodePage, TimePage, RegexPage
│   └── scratch/          ScratchpadPage
├── workspace/            FolderTree, TagPicker, MoveDialog, ExportDialog
├── components/ui/        Button, Panel, Toggle, CopyButton, ErrorBanner, SectionLabel,
│                         Dialog, Toast, Split, VirtualList, MonacoHost
├── lib/                  api/ (one module per feature), themes, fonts, export, hotkeys
└── styles/
```

### Workspace on disk

Everything the user creates lives in one portable, backup-friendly directory:

```
~/devtools-workspace/
├── devtools-history.mv.db        H2 metadata: folders, notes, queries, runs, tags
├── blobs/
│   ├── samples/<uuid>.json.gz    stored sample outputs, compressed
│   └── exports/<uuid>.html
└── config/
    ├── connections.json          DB connections; passwords never in plaintext
    ├── aws-profiles.json         profile names only; creds read from the AWS chain
    └── settings.json             theme, font, editor prefs
```

---

## 3. Enhancements to what already exists

### File Search

**E1 — Local path mode (fixes 40GB).** Add a second input mode: paste or pick an absolute path that
already exists on disk. The backend opens it with `Files.newInputStream` — no upload, no temp copy,
no HTTP transfer. A 40GB scan becomes a sequential disk read at drive speed. Keep upload mode for
small ad-hoc files. A `PathGuard` rejects directories, non-regular files, and unreadable paths with
clear messages.

**E2 — Bounded streaming scanner.** Replace `readLine()` with a fixed-block reader splitting on `\n`,
capping any single line at 1MB of buffered characters. Memory becomes constant regardless of file
size or input pathology. Decode with `CodingErrorAction.REPLACE` so a stray binary byte degrades to
`�` instead of throwing — essential for mixed-content Hadoop output.

**E3 — Context lines.** `-A`/`-B`/`-C` equivalents, dimmed around the highlighted match. Essential for
reading Java stack traces, where the exception line is meaningless without the frames around it.

**E4 — Match highlighting and true occurrence counts.** Highlight the matched substring, not just the
line. Count occurrences, not matching lines — a line containing the term three times currently counts once.

**E5 — Boolean term logic.** Terms are independent OR groups today. Add `AND` (lines matching every
term), `NOT` exclusion via a `-` prefix, and a "near" mode matching terms within N lines. This turns
grep into log analysis.

**E6 — Streaming progress over SSE.** A 40GB scan takes minutes. Emit bytes-processed, lines-scanned,
and running match counts every 500ms for a live progress bar with an ETA, plus a cancel button that
actually interrupts the read.

**E7 — Archive and multi-file search.** Transparently read `.gz`, `.zip`, `.tar.gz`, `.bz2`, and
Snappy without extracting — rotated logs and Hadoop output are almost always compressed. Then accept
a directory plus a glob (`logs/**/*.log`, `part-*`) and search across all matches, grouped by file.
Hadoop output directories of 200 part-files become one search.

**E8 — Result virtualisation.** 20,000 matches currently render 20,000 DOM nodes and freeze the
browser. Virtualise so only visible rows mount, then raise the cap substantially.

### JSON / XML

**E9 — Diff view.** Two-pane structural diff with added/removed/changed keys highlighted. The most
requested feature in any JSON tool and a daily need comparing API responses.

**E10 — JSONPath and XPath query bars.** Type `$.data.items[?(@.active)]` or `//order[@id='3']` and
filter the tree live.

**E11 — Schema inference and code generation.** Generate JSON Schema from a sample; validate against
a pasted schema or an XSD. Generate **Java records / POJOs with Jackson annotations**, **TypeScript
interfaces for Angular models**, Python dataclasses, and Avro schemas from a sample document. For your
stack this is the single biggest time saver — the JSON-response-to-Angular-interface round trip is a
daily tax.

**E12 — Format expansion.** YAML, TOML, CSV, `.properties`, and HOCON join JSON and XML, with
conversion between any pair. Covers Spring `application.yml`, Angular config, and Hadoop
`core-site.xml` in one tool. `Ctrl+Shift+F` formats the buffer with type auto-detection.

**E13 — Large document handling.** A 50MB JSON file blocks the UI thread today. Parse in a web worker,
lazy-expand tree nodes, virtualise the tree. Add NDJSON mode — one object per line, the standard
Hadoop/Spark output shape — with per-record navigation.

### Cross-cutting

**E14 — Command palette (`Ctrl+K`).** Jump tools, run a saved query, open a note, change theme, export.
Past five tools, nav-by-clicking stops scaling — and this plan has twenty.

**E15 — Favourites and pinning.** Star any history entry, query, or note; pinned items surface first.

**E16 — History upgrade.** The `history_entry` table has no index, no search, no retention policy, and
stores full payloads as inline `@Lob`. Add a `tool + createdAt` index, full-text search over labels and
inputs, favourite and folder columns, a configurable retention window, and offload payloads over 64KB
to the blob store.

---

## 4. New tools

### Tier 1 — daily, stack-agnostic

| # | Tool | What it does | Why it earns a slot |
| --- | --- | --- | --- |
| **T1** | **SQL Workspace** | Connect, query, save, parameterise, store sample outputs | Section 5 — the centrepiece |
| **T2** | **Notes** | Markdown notes with folders, backlinks, live links to queries and searches | Section 6 |
| **T3** | **Diff** | Text, JSON, and XML diff, inline and side-by-side | Comparing two payloads is constant |
| **T4** | **Encode / Decode** | Base64, URL, HTML entity, hex, JWT decode, MD5/SHA-1/256/512, HMAC | The most-Googled dev task; offline matters when the payload is a real token |
| **T5** | **Time Toolkit** | Epoch ↔ ISO ↔ human, timezone conversion, duration maths, cron explainer with next-5-runs | Every log line has a timestamp; every Oozie/Airflow schedule has a cron nobody can read |
| **T6** | **Regex Lab** | Live highlighting, capture-group table, per-token explanation, saved pattern library | Pairs with File Search — build the pattern here, run it there |
| **T7** | **Text Toolkit** | Case conversion, sort, dedupe, trim, line numbering, wrap, column extraction, counts | The "I'll just open Notepad++" bucket, consolidated |
| **T8** | **UUID & Data Generator** | UUID v4/v7, ULID, nanoid, fake names/emails/addresses, bulk CSV / SQL-insert output | Seeding test data is a weekly chore |
| **T9** | **HTTP Client** | Saved requests, headers, auth, environment variables, response wired into the JSON tree | A lightweight local Postman sharing the suite's storage and history |
| **T10** | **Scratchpad** | Multi-tab persistent untitled buffers with syntax highlighting | The clipboard parking lot every developer needs |

### Tier 2 — Java and Spring

| # | Tool | What it does |
| --- | --- | --- |
| **T11** | **Stack Trace Analyser** | Collapse framework noise to show *your* frames, parse `Caused by` chains into a tree, deobfuscate, link repeated traces, and explain common exceptions. The highest-value Java tool here — most debugging starts with a wall of Spring proxy frames hiding three relevant lines. |
| **T12** | **JAR / Class Inspector** | List JAR contents, read `MANIFEST.MF`, show the compiled class version (the "unsupported class file major version" answer), decode constant pools, and detect duplicate classes across a classpath — the root of most `NoSuchMethodError`s. |
| **T13** | **Maven / Gradle Dependency Tree** | Paste `mvn dependency:tree` output and get a searchable, filterable tree with conflict and duplicate highlighting, plus "why is this here?" path-to-root for any artifact. |
| **T14** | **Spring Config Inspector** | Diff `application.yml` across profiles, resolve `${placeholder}` chains, flag properties defined in multiple sources, and convert between `.properties` and YAML. |
| **T15** | **Java Snippet Runner** | Run a scratch Java snippet against the local JDK — the JShell workflow without leaving the app. |

### Tier 3 — Angular and frontend

| # | Tool | What it does |
| --- | --- | --- |
| **T16** | **JSON → TypeScript Model** | Generate Angular interfaces, enums, and type guards from a sample response, with naming conventions and optional-field inference. Shares E11's engine. |
| **T17** | **RxJS Marble Visualiser** | Paste an operator chain and see a marble diagram. RxJS timing bugs are hard to reason about and trivial to *see*. |
| **T18** | **HAR Analyser** | Drop a DevTools HAR export: waterfall, slowest requests, payload sizes, failed calls, duplicate requests. The fastest route from "the page is slow" to a cause. |
| **T19** | **Bundle Stats Viewer** | Read an Angular `stats.json` and show a treemap of what is inflating the bundle. |
| **T20** | **CORS & Header Checker** | Explain in plain English why a preflight failed — the recurring Angular-to-Spring integration tax. |

### Tier 4 — Hadoop and big data

| # | Tool | What it does |
| --- | --- | --- |
| **T21** | **Parquet / ORC Reader** | Open a Parquet or ORC file locally: schema, row groups, column statistics, compression ratios, and a paged row preview. Inspecting these currently means writing a throwaway Spark job — this makes it instant. |
| **T22** | **Avro Schema Tool** | View and validate Avro schemas, check reader/writer **compatibility** before deploying a schema change, decode Avro data files, and convert Avro ↔ JSON Schema ↔ Java classes. |
| **T23** | **Part-File Merger** | Point at a Hadoop output directory and stream-merge `part-*` files into one, with header deduplication and optional decompression. Pure sequential I/O — handles hundreds of GB. |
| **T24** | **Spark Plan Explainer** | Paste a physical plan and get a readable tree with shuffle boundaries, broadcast joins, and partition counts highlighted, plus skew warnings. |
| **T25** | **Hive / DDL Toolkit** | Generate Hive DDL from a Parquet or Avro schema, convert DDL between Hive, Spark SQL, and standard SQL, and diff two table schemas. |
| **T26** | **Delimited File Profiler** | Profile a huge CSV/TSV without loading it: inferred column types, null rates, cardinality, min/max, and malformed-row detection. Streaming, so file size is irrelevant. |
| **T31** | **YARN Cluster Inspector** | Two input modes. **Live**: paste a ResourceManager URL or an `application_...` ID and the backend calls the YARN REST API (`/ws/v1/cluster/apps/{id}`, `/ws/v1/cluster/apps/{id}/appattempts`) to show state, queue, resource usage (vcores/memory requested vs. used), containers, and a link to the AM tracking URL and logs. **Offline**: paste `yarn application -list` / `yarn application -status <id>` / `yarn logs -applicationId <id>` CLI output and get the same parsed, sortable view without cluster access. Diagnostics text (the usual wall of "Application failed 2 times due to AM Container...") gets the same collapse-the-noise treatment as T11's stack traces. |

### Tier 6 — Linux, shell, and build tooling

| # | Tool | What it does |
| --- | --- | --- |
| **T32** | **`top` / `ps` Analyzer** | Paste a `top -b -n1` batch snapshot, `ps aux`, `free -h`, `df -h`, or `vmstat` dump and get it parsed into a sortable table — highlight-the-hog for CPU%, MEM%, and RSS, a swap/load-average callout, and a "compare two snapshots" mode (paste `top` from before and after a deploy) that diffs process-level deltas. Solves "someone pastes a wall of `top` output in Slack and I have to eyeball it." |
| **T33** | **Linux Command Builder** | Form-driven builder for the commands developers actually reach for and always forget a flag on: `find` (name/mtime/size/exec), `tar`/`gzip`, `curl` (headers/method/auth), `chmod`/`chown` (with the octal ↔ symbolic converter built in), `netstat`/`ss`, `journalctl`, `awk`/`sed` one-liners, `rsync`, `ssh` tunnels, `crontab`. Each builder shows the assembled command plus a plain-English breakdown of every flag — and a "paste a command, explain it" reverse mode for decoding something inherited from a script. |
| **T34** | **Makefile Explainer** | Paste a `Makefile` and get its targets, prerequisites, and recipes as a dependency graph (which targets does `make X` actually trigger, in what order), variable resolution (including `?=`, `:=`, and `$(shell ...)`), and a `.PHONY` sanity check. Also accepts `make -n` (dry-run) output and turns it into the same graph when the Makefile itself isn't available. |

### Tier 7 — AWS

Read-only by default, everywhere. Credentials come from the standard AWS provider chain
(`~/.aws/credentials`, env vars, SSO, instance profile) — **the app never stores AWS keys**. It stores
profile *names* only.

| # | Tool | What it does |
| --- | --- | --- |
| **T35** | **S3 Browser** | Browse buckets and prefixes, preview objects (piped into the JSON/Parquet viewers), inspect storage class and metadata, compute prefix sizes, and generate presigned URLs. Writes require an explicit per-session unlock. |
| **T36** | **CloudWatch Logs Insights** | Run Insights queries with the same saved-query, run-history, and sample-output machinery as the SQL workspace. Log queries deserve a library exactly as much as SQL does. |
| **T37** | **IAM Policy Tool** | Format and validate policy JSON, explain a policy in plain English, simulate whether a principal can perform an action, and flag over-broad wildcards. |
| **T38** | **ARN Parser & Builder** | Decompose any ARN into its parts, build one from a form, and link to the console. A small tool used constantly. |
| **T39** | **SQS / SNS Inspector** | Peek messages without consuming, inspect attributes, measure queue depth, and view dead-letter queues. Peeking safely is the hard part; this does it right. |
| **T40** | **DynamoDB Query Console** | Build key-condition and filter expressions visually, preview the generated request, inspect consumed capacity, and store sample outputs. |
| **T41** | **Cert & Key Inspector** | Decode PEM/DER certificates: subject, SAN, issuer, validity window, expiry countdown. Certificate expiry is a recurring production incident. |

### A shared capability: fetching a link server-side

T31 (YARN) and a few others (T18 HAR, T9 HTTP Client) need the backend to fetch a URL the user
pastes in — the browser can't do this itself for a YARN RM UI or an internal Jenkins/CloudWatch
link without hitting CORS. This becomes one shared `UrlFetchService`: user-supplied URL, explicit
per-call opt-in (never automatic), a size cap and timeout, and no redirect-following into
`file://`/`localhost`-internal ranges unless the target itself is what the user is inspecting
(entirely plausible here, since YARN/Ambari UIs *are* localhost/internal). Since this whole suite
only binds to `localhost:8383` today, the exposure is "you can make your own local tool fetch a
URL you already have access to" — not a remotely triggerable SSRF — but the guardrails stay in
regardless, because that changes the moment anyone runs this on a shared box.

---

## 5. SQL Workspace — the centrepiece

You query databases regularly and want queries, history, and sample outputs stored properly.

### Connections

PostgreSQL, MySQL/MariaDB, H2, SQLite, SQL Server, plus Hive and Presto/Trino via JDBC, with
HikariCP pools created lazily per connection. Metadata lives in `config/connections.json`;
**passwords are never stored in plaintext**:

- **Preferred:** encrypt with a master password entered once per session — AES-GCM, key derived by
  PBKDF2. Nothing readable is ever written to disk.
- **Fallback:** store nothing and prompt per session.

Every connection carries a `readOnly` flag, **defaulting to on**. When set, the executor rejects
anything that is not a `SELECT`/`WITH`/`EXPLAIN` by *parsing* the statement — not by regex — so a
fat-fingered `DELETE` against production is impossible. Connections carry a colour tag so a
production connection is visually unmistakable.

### Editor

Monaco with a SQL mode: syntax highlighting, schema-aware autocomplete from introspection,
format-on-demand, multi-statement support with run-statement-under-cursor (`Ctrl+Enter`) versus
run-all (`Ctrl+Shift+Enter`).

### Parameterised queries

Write `SELECT * FROM orders WHERE status = :status AND created_at > :since`. The UI detects named
parameters and renders a typed input row above the editor. Binding always goes through
`PreparedStatement` — **parameters are never concatenated into SQL**, which closes the injection path
and makes saved queries genuinely reusable rather than templates you hand-edit.

### Execution safety

- Mandatory row cap (default 5,000) via `Statement.setMaxRows` — a stray `SELECT *` on a 200M-row
  table cannot hang the app.
- Query timeout (default 30s) via `Statement.setQueryTimeout`, with a cancel button wired to
  `Statement.cancel()`.
- Streamed fetching with a configurable fetch size; the grid virtualises rows.
- `EXPLAIN` / `EXPLAIN ANALYZE` rendered as a readable plan tree.
- Execution time, rows returned, and rows affected reported for every run.

### Storage model

```
db_connection    id, name, driver, url, username, read_only, colour_tag, created_at
folder           id, parent_id, name, kind, sort_order          -- self-referencing tree
saved_query      id, folder_id, name, description, sql_text, connection_id,
                 param_schema_json, tags, is_favourite, created_at, updated_at
query_revision   id, saved_query_id, sql_text, note, created_at -- full version history
query_run        id, saved_query_id?, connection_id, sql_text, params_json,
                 status, row_count, duration_ms, error_text, executed_at
sample_output    id, query_run_id, saved_query_id, label, format,
                 row_count, columns_json, blob_path, size_bytes, created_at
tag              id, name, colour
item_tag         tag_id, item_type, item_id
```

Three concepts, deliberately separate:

- **`saved_query`** — the durable artifact you name, file into a folder, and reuse. Every edit writes
  a `query_revision`, so the version that worked last Tuesday is always recoverable.
- **`query_run`** — the audit log. Every execution, successful or failed, with parameters, duration,
  row count, and error text. Your "what did I actually run against prod?" record.
- **`sample_output`** — a snapshot of results you explicitly chose to keep.

### Sample output storage — the detail that matters

Result sets are large and unpredictable, so they do **not** become `@Lob` columns:

- Rows serialise to newline-delimited JSON, gzip to `blobs/samples/<uuid>.json.gz`, and the database
  stores only the path, column metadata, row count, and byte size. A 50k-row sample costs a few
  hundred KB on disk and zero database bloat.
- You choose what to keep: **full result**, **first N rows** (default 100 — usually enough for
  documentation), or **current selection**.
- Every sample takes a label and optional note, so six months later you know why you kept it.
- Samples attach to the saved query, so opening a query shows its stored outputs alongside — the
  "here's what this returns" reference that makes a query library genuinely useful.
- Retention prunes unlabelled samples after N days; labelled ones are never auto-deleted.
- **Redaction:** mark columns sensitive on a saved query and those values are masked *before* the
  sample is written. This matters — a stored sample is a plaintext copy of production data on your disk.

### Schema explorer

A tree of schemas → tables → columns with types, nullability, keys, and indexes. Click a table to
insert its name; double-click to generate `SELECT * FROM table LIMIT 100`. Search across all table and
column names. Introspection cached per connection with manual refresh.

### Result grid

Sortable, filterable, resizable columns. `NULL` rendered distinctly from an empty string — a genuine
daily source of confusion. Cell detail popover for long values; JSON-typed columns open directly in
the JSON tree viewer. Copy as CSV, TSV, JSON, Markdown table, **Java record**, or SQL `INSERT`s.

---

## 6. Notes, folders, and tags

### Notes

Markdown with live preview, fenced code blocks with syntax highlighting, and `[[wiki-links]]` between
notes with a backlinks panel. Crucially, notes **link to other items**: reference a saved query, a
search result, a Parquet schema, or a stored sample by ID and it renders as a live chip you can click
through. That is what makes this a workbench rather than twenty unrelated tools sharing a sidebar.

Notes keep revisions. Full-text search spans bodies, titles, and tags.

### The folder tree

One shared, arbitrarily nested tree (`folder.parent_id` self-reference) holding saved queries, notes,
snippets, saved searches, and saved AWS queries. Drag to move and reorder; right-click to rename or
delete. Folder colours carry through to item chips.

```
Workspace/
├── Work/
│   ├── Orders Service/
│   │   ├── 📝 Runbook — stuck orders
│   │   ├── 🗄 Find orders stuck in PENDING      (3 samples, 12 runs)
│   │   ├── 🗄 Daily order volume by region
│   │   ├── 🔍 grep: OrderTimeoutException
│   │   └── ☁ CloudWatch: order-service 5xx
│   └── Data Platform/
│       ├── 📝 Schema migration notes
│       ├── 🧊 events.parquet — schema reference
│       └── 🗄 Hive: daily partition counts
├── Personal/
└── Scratch/
```

Tags cut across the tree — a query can live in `Work/Orders Service` and still carry `#perf` and
`#postgres`, surfacing in a tag view beside unrelated items.

---

## 7. Export — HTML and Markdown

Everything exports through one shared `ExportService` with `HtmlRenderer` and `MarkdownRenderer`.
Export any single item, any folder recursively, or the entire workspace.

**Markdown export** produces plain `.md`: GitHub-flavoured tables, fenced code blocks, and YAML
frontmatter carrying metadata (tags, timestamps, connection name). Folder structure maps to directory
structure and `[[wiki-links]]` rewrite to relative paths — so the export drops straight into Obsidian,
a Git repo, or Confluence.

**HTML export** produces a single self-contained file: all CSS inlined, no external requests, active
theme baked in, table of contents, collapsible result tables, syntax-highlighted code, and a print
stylesheet so `Ctrl+P` yields a clean PDF. This is the shareable artifact — one file renders
identically anywhere.

| Tool | Markdown | HTML |
| --- | --- | --- |
| Search results | Term headings, fenced blocks with line numbers | Collapsible per-term sections, highlighted matches |
| SQL | Fenced SQL, GFM result table, run metadata block | Sortable table, plan tree, sample gallery |
| JSON/XML | Fenced formatted document | Interactive collapsible tree |
| Parquet/Avro | Schema table, stats table | Schema tree, column stat charts |
| Stack trace | Collapsed frames, `Caused by` chain | Expandable frame groups |
| Notes | Verbatim, links rewritten | Rendered with backlinks |
| Folder | Nested directories + index README | Single file, full TOC |

---

## 8. Delivery phases

**Phase 1 — Foundations.** Finish and commit multi-term search. Fix the 40GB problem (E1, E2).
Restructure backend packages and frontend directories. Introduce the workspace directory and blob
store. Upgrade the history schema.

**Phase 2 — SQL Workspace.** Connections with encrypted credentials and read-only default, Monaco
editor, parameterised execution with caps and timeouts, result grid, schema explorer, saved queries
with revisions, run log, sample output storage.

**Phase 3 — Organisation.** Folder tree, tags, favourites, notes with backlinks and cross-item links,
global search, command palette.

**Phase 4 — Export.** `ExportService` with both renderers, per-tool export shapes, folder and
whole-workspace export.

**Phase 5 — Java and daily tools.** Stack Trace Analyser (T11) first — highest value per hour of
build. Then Diff, Encode/Decode, Time Toolkit, Regex Lab, Text Toolkit, JAR Inspector, Dependency Tree.

**Phase 6 — Big data and cloud.** Parquet/ORC Reader and Avro Schema Tool (highest value in that
tier), Part-File Merger, Delimited Profiler, then S3 Browser and CloudWatch Insights.

**Phase 7 — Angular and polish.** JSON→TypeScript, HAR Analyser, RxJS marbles. Search enhancements
(E3–E8), JSON/XML enhancements (E9–E13), virtualisation everywhere, keyboard-first navigation.

---

## 9. Engineering notes

- **Tests.** The suite currently has none. Every service from Phase 1 onward needs unit tests; the SQL
  executor needs Testcontainers integration tests against Postgres and MySQL, with explicit cases for
  the read-only guard and the parameter binder.
- **Security posture.** This is a local tool holding database credentials, production data samples, and
  cloud access. Treat it accordingly: no plaintext passwords, no stored AWS keys, `PreparedStatement`
  only, read-only by default everywhere, redaction on stored samples, path validation on every
  filesystem input, and an explicit per-session unlock for any write operation.
- **Performance budget.** No operation may block the UI thread. Large parses, long scans, and big
  result sets run in a worker or stream with progress and a working cancel.
- **Storage discipline.** H2 holds metadata only. Anything that can grow without bound goes to the blob
  store as a compressed file with a row pointing at it.
- **Backup.** The entire workspace is one directory, so backing it up is a folder copy — and a
  full HTML export is always available as a human-readable fallback.
