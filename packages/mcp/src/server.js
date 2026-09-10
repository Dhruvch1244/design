import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchIndex, resolveItems, resolveItemName, resolveRegistryBase } from "./registry.js";
import { generateComponentScaffold } from "./generate.js";

function textResult(value) {
  return {
    content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
  };
}

function errorResult(err) {
  return {
    isError: true,
    content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }],
  };
}

/** Builds the McpServer instance and registers all four dsgn tools. Kept
 * separate from bin/dsgn-mcp.js so tests (and any future embedding of this
 * server in-process) can construct it without going through stdio. */
export function createServer() {
  const server = new McpServer({
    name: "dsgn-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "list_components",
    {
      title: "List dsgn components",
      description:
        "Lists every component and recipe in the dsgn registry: name, type (registry:ui or registry:block), description, and registryDependency count. Optionally filter by type.",
      inputSchema: {
        type: z
          .enum(["ui", "block"])
          .optional()
          .describe('Only return items of this type ("ui" for components, "block" for recipes).'),
      },
    },
    async ({ type }) => {
      try {
        const base = await resolveRegistryBase();
        const index = await fetchIndex(base);
        const wantType = type ? `registry:${type}` : null;
        const items = index.items
          .filter((item) => !wantType || item.type === wantType)
          .map((item) => ({
            name: item.name,
            type: item.type,
            description: item.description,
            registryDependencyCount: (item.registryDependencies ?? []).length,
          }));
        return textResult({ registry: base, count: items.length, items });
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "search_components",
    {
      title: "Search dsgn components",
      description:
        "Case-insensitive substring search over every component/recipe's name and description in the dsgn registry.",
      inputSchema: {
        query: z.string().min(1).describe("Search text, e.g. \"date\" or \"form\"."),
      },
    },
    async ({ query }) => {
      try {
        const base = await resolveRegistryBase();
        const index = await fetchIndex(base);
        const needle = query.toLowerCase();
        const items = index.items
          .filter(
            (item) =>
              item.name.toLowerCase().includes(needle) || (item.description ?? "").toLowerCase().includes(needle),
          )
          .map((item) => ({
            name: item.name,
            type: item.type,
            description: item.description,
          }));
        return textResult({ registry: base, query, count: items.length, items });
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "get_component",
    {
      title: "Get a dsgn component (fully resolved)",
      description:
        "Fetches a component or recipe by name (accepts the \"recipe:<name>\" shorthand) INCLUDING its transitive registryDependencies, resolved in dependency-first order. The response contains every file, with its target install path and content, needed to actually install the item by writing files — no second round-trip required.",
      inputSchema: {
        name: z
          .string()
          .min(1)
          .describe('Component or recipe name, e.g. "combobox" or "recipe:auth-form".'),
      },
    },
    async ({ name }) => {
      try {
        const base = await resolveRegistryBase();
        const resolvedName = resolveItemName(name);
        const items = await resolveItems(base, [resolvedName]);
        const requested = items[items.length - 1];
        const dependencies = items.slice(0, -1);
        return textResult({
          registry: base,
          requested: requested.name,
          item: requested,
          resolvedDependencies: dependencies.map((d) => d.name),
          // Every file across the requested item and all its transitive
          // registryDependencies, in install order, each labeled with which
          // registry item it came from — this is what a calling agent needs
          // to write to disk to actually install the component.
          files: items.flatMap((item) => (item.files ?? []).map((file) => ({ ...file, from: item.name }))),
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "generate_component_scaffold",
    {
      title: "Generate a new dsgn component skeleton",
      description:
        "Deterministically generates a STARTING SKELETON for a new registry component — not a finished component, and not written to disk. Does not call an LLM. Given composedFrom, produces a composed-component skeleton (combobox.tsx shape). Otherwise produces a Radix-wrapper skeleton (dialog.tsx shape) if @radix-ui/react-<name> plausibly exists, or a plain cn()-based skeleton (input.tsx shape). Also returns the registry.json entry to append and next-step notes. The caller (an agent with filesystem tools) is responsible for actually writing the file and completing the implementation.",
      inputSchema: {
        name: z.string().min(1).describe('kebab-case component name, e.g. "date-range-picker".'),
        kind: z.enum(["ui", "block"]).describe('"ui" for a component, "block" for a recipe.'),
        description: z.string().min(1).describe("One-sentence description for the registry entry."),
        composedFrom: z
          .array(z.string())
          .optional()
          .describe('Existing registry component names this composes, e.g. ["popover", "command", "badge"].'),
      },
    },
    async ({ name, kind, description, composedFrom }) => {
      try {
        const scaffold = generateComponentScaffold({ name, kind, description, composedFrom });
        return textResult(scaffold);
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  return server;
}
