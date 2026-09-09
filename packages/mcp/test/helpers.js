import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const monorepoRoot = path.dirname(path.dirname(packageRoot));

/** Points the spawned server at the monorepo's own local registry build
 * (packages/registry/dist/r), same as the task's verification instructions:
 * `npm run build:registry --workspace @dsgn/registry` must have been run
 * first so this directory exists. */
export const LOCAL_REGISTRY_DIR = path.join(monorepoRoot, "packages", "registry", "dist", "r");

/** Spawns the real dsgn-mcp server binary as a subprocess (over stdio, the
 * same way any real MCP client would) and connects an SDK Client to it.
 * Returns { client, close } — callers must call close() when done. */
export async function startServer(env = {}) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(packageRoot, "bin", "dsgn-mcp.js")],
    env: { ...process.env, DSGN_REGISTRY: LOCAL_REGISTRY_DIR, ...env },
  });

  const client = new Client({ name: "dsgn-mcp-test-client", version: "0.0.0" });
  await client.connect(transport);

  return {
    client,
    close: () => client.close(),
  };
}

/** MCP tool results come back as { content: [{type: "text", text}], isError? }.
 * Every tool in this server returns exactly one JSON-encoded text block
 * (via textResult in src/server.js), so tests parse that consistently. */
export function parseToolResult(result) {
  if (result.isError) {
    throw new Error(`Tool call errored: ${result.content?.[0]?.text}`);
  }
  const text = result.content?.[0]?.text;
  return JSON.parse(text);
}
