# Dev Tools Suite

A local, offline dev tools app: 40GB-scale file search, SQL Workspace, JSON/XML/SOAP
formatting with a live tree visualizer, a list-to-tuple converter, Notes with nested
folders and backlinks, a Git Handbook, and 26+ other tools behind a Ctrl+K command
palette. Runs entirely on your machine as a single Java process — no external
services, no telemetry, no internet required after download.

## Tools

- **File Search** — search across files up to 40GB, plain term or regex,
  case-sensitive toggle. Streams line-by-line so large files don't get loaded
  into memory. Copy any single matched line or all matches at once.
- **SQL Workspace** — run queries against local data with results in a
  browsable grid.
- **JSON / XML formatter** — pretty-prints valid JSON into a collapsible,
  color-coded tree or raw text. Invalid JSON still gets broken onto readable
  lines with the parse error shown. Same idea for XML/SOAP (XXE-safe DOM parse).
  Also converts JSON ↔ escaped JSON string, both directions.
- **List Converter** — paste one item per line, get back `('a', 'b', 'c')` and
  `(a, b, c)`.
- **Notes** — nested folder tree, `[[Wiki-link]]` backlinks, markdown editor
  with sanitized live preview, export to standalone `.md` or `.html`.
- **Git Handbook** — categorized command reference, "how do I…" recipes, and
  a flag explainer for common subcommands.
- **26 more tools** reachable via the sidebar or the Ctrl+K command palette,
  with favourites (star to pin) and real multi-tab switching that keeps each
  tool's state alive while you work in another.
- **History** — every run is saved locally (embedded H2 file database) per
  tool; click any entry to reload it back into the input.
- **Appearance** — pick a coding font with real ligatures (JetBrains Mono,
  Fira Code, Victor Mono) and a color theme (Void, Dracula, Nord, Tokyo Night,
  Gruvbox, Catppuccin, Solarized). Both persist across restarts.

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
