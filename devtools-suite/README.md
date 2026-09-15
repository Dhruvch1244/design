# Dev Tools Suite

A local, offline dev tools app: a Spring Boot repo visualizer, DB/regex/cron/git/disk
visual tools, everyday Image/PDF tools, 40GB-scale file search, SQL Workspace with
charting and a plan visualizer, a Task List, Notes with nested folders and backlinks,
a Git Handbook, and 25+ other tools behind a Ctrl+K command palette. Runs entirely on
your machine as a single Java process — no external services, no telemetry, no
internet required after download.

## Visualizers

- **Spring Boot Visualizer** — point it at a local Spring Boot project's source root
  and it statically parses the `.java` files (JavaParser, no compilation) to find
  `@RestController`/`@Service`/`@Repository`/`@Component` classes, draws a
  Controller → Service → Repository dependency graph from field/constructor
  injection, and lists every `@GetMapping`/`@PostMapping`/etc. endpoint as a real URL
  (reading `server.port` / `server.servlet.context-path` from
  `application.properties`/`.yml`). Remembers recently analyzed projects.
- **DB Schema (ER Diagram)** — reuses SQL Workspace's connections; renders every
  table as a box with its columns (PK/FK marked) and draws foreign-key relationship
  lines between them.
- **Cron Visualizer** — paste a 5-field cron expression, get a plain-English
  description, a weekly hour × day-of-week heatmap of when it fires, and the next 12
  actual run times.
- **Regex Diagram** — breaks a pattern into groups, alternation, character classes,
  and quantifiers and lays it out as a railroad-style flow diagram instead of a wall
  of escape characters.
- **Git Commit Graph** — paste the output of one `git log` command and see a real
  branch/merge graph with lane-colored commit lines, not just a flat list.
- **Disk Usage Treemap** — scans a local folder and renders a proportional treemap of
  what's taking up space, click any box to drill into that subfolder.

## Tools

- **Image Tools** — convert between PNG/JPG/BMP/GIF, or enhance (brightness,
  contrast, sharpen, resize/upscale). Runs server-side, offline.
- **PDF Converter** — assemble images into a PDF, or render a PDF's pages back
  to a zip of images at a chosen DPI.
- **Task List** — a to-do list that actually times you: records when a task
  was created, started, and completed, with elapsed duration shown per task.
- **File Search** — search across files up to 40GB, plain term or regex,
  case-sensitive toggle. Streams line-by-line so large files don't get loaded
  into memory. Copy any single matched line or all matches at once.
- **SQL Workspace** — connect, query, and save results, with an inline linter
  (missing WHERE, SELECT *, unbounded queries), an auto-generated chart for
  numeric results, and a visual tree/step view for EXPLAIN plans.
- **JSON / XML formatter** — pretty-prints valid JSON into a collapsible,
  color-coded tree or raw text. Invalid JSON still gets broken onto readable
  lines with the parse error shown. Same idea for XML/SOAP (XXE-safe DOM parse).
  Also converts JSON ↔ escaped JSON string, both directions.
- **List Converter** — paste one item per line, get back `('a', 'b', 'c')` and
  `(a, b, c)`.
- **Notes** — nested folder tree, `[[Wiki-link]]` backlinks, markdown editor
  with sanitized live preview, created/last-edited timestamps, export to
  standalone `.md` or `.html`.
- **Git Handbook** — categorized command reference, "how do I…" recipes, and
  a flag explainer for common subcommands.
- **25 more tools** reachable via the sidebar or the Ctrl+K command palette,
  with favourites (star to pin) and real multi-tab switching that keeps each
  tool's state alive while you work in another.
- **History** — every run is saved locally (embedded H2 file database) per
  tool; click any entry to reload it back into the input.
- **Appearance** — pick a coding font with real ligatures (JetBrains Mono,
  Fira Code, Victor Mono) and a color theme, including a Light theme, on top
  of the existing dark palettes (Void, Dracula, Nord, Tokyo Night, Gruvbox,
  Catppuccin, Solarized, and more). Both persist across restarts.

## Running it

Requires Java 17+ on the machine running the jar (nothing else).

```
run.bat
```

This starts `backend/target/devtools-suite.jar` and opens your browser to
`http://localhost:8383`. Close the "Dev Tools Suite" console window to stop it.

## Building from source

Requires Node.js and Maven in addition to Java 17+.

```
build.bat
```

This builds the React frontend, copies it into the Spring Boot backend's
static resources, and packages everything into one runnable jar at
`backend/target/devtools-suite.jar`.

## Stack

- Backend: Java 17, Spring Boot 3, embedded H2 (file-based) for history.
- Frontend: React + TypeScript + Vite, Tailwind CSS, Framer Motion, Phosphor
  Icons. Fonts and icons are self-hosted (no CDN), so the packaged jar works
  fully offline.
