# @dhruvchoudhary/dsgn-mcp

An MCP (Model Context Protocol) server that exposes the [dsgn](https://design.dhruvchoudhary.com) component registry to any MCP-compatible AI client (Claude Code, Claude Desktop, Cursor, ...), so an agent can discover, fetch, and scaffold dsgn components/recipes directly — without shelling out to the `dsgn` CLI.

## Run it

```sh
npx @dhruvchoudhary/dsgn-mcp
```

It speaks JSON-RPC over stdio and waits silently for a client to connect — there's no console output on a successful start.

## Wire it into a client

### Claude Code

```sh
claude mcp add dsgn -- npx @dhruvchoudhary/dsgn-mcp
```

### Claude Desktop / Cursor (or any client reading an `mcpServers` JSON block)

```json
{
  "mcpServers": {
    "dsgn": {
      "command": "npx",
      "args": ["@dhruvchoudhary/dsgn-mcp"]
    }
  }
}
```

## Configuration

- **`DSGN_REGISTRY`** — overrides the registry base, same as the CLI's `--registry` flag. Accepts either an `http(s)://` URL or a local filesystem directory (e.g. a monorepo checkout's `packages/registry/dist/r`). If unset, the server auto-detects a local monorepo checkout (walking up from its own install location for `packages/registry/dist/r`) before falling back to the deployed registry at `https://design.dhruvchoudhary.com/r`.

```json
{
  "mcpServers": {
    "dsgn": {
      "command": "npx",
      "args": ["@dhruvchoudhary/dsgn-mcp"],
      "env": { "DSGN_REGISTRY": "https://design.dhruvchoudhary.com/r" }
    }
  }
}
```

## Tools

- **`list_components`** — lists every component/recipe in the registry (name, type, description, dependency count); optional `{type: "ui"|"block"}` filter.
- **`search_components`** — case-insensitive substring search over name + description; input `{query: string}`.
- **`get_component`** — fetches one or more components/recipes by name (each accepts the `recipe:<name>` shorthand; pass an array to fetch several at once), fully resolved with all transitive `registryDependencies`' files included and deduplicated across every requested item, so a single call returns everything needed to install them.
- **`generate_component_scaffold`** — deterministically generates a *starting skeleton* (not a finished component, not written to disk) for a new registry component: a Radix-wrapper, composed-component, or plain-primitive skeleton depending on input, plus the `registry.json` entry to append. Does not call an LLM.
- **`get_philosophy`** — reads the dsgn design-philosophy docs (the same ones rendered at [design.dhruvchoudhary.com/philosophy](https://design.dhruvchoudhary.com/philosophy)), so an agent can ground component/recipe work in the actual rules without cloning the repo. Called with no arguments, lists every doc with a one-paragraph summary; called with `{slug: string | string[]}` (one of `agents`, `architecture`, `ui-interaction`, `code-style`, `anti-patterns`, `motion`), returns the full Markdown of those doc(s).
