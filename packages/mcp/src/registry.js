import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Deliberately duplicated from packages/cli/src/registry.js rather than
// imported: this fetch/resolve logic is small (~50 lines) and each package
// is independently published to npm, so depending on the CLI's `src/`
// internals across a publish boundary would be fragile (its exports aren't
// a supported public API). See philosophy/code-style.md's std-first guidance.

export const DEFAULT_REGISTRY = "https://design.dhruvchoudhary.com/r";

function isUrl(value) {
  return /^https?:\/\//.test(value);
}

/**
 * A registry source is either an http(s) base URL (the deployed site's /r
 * endpoint, or a fork's own registry) or a local filesystem directory
 * (dist/r inside this monorepo, or anyone self-hosting without a domain).
 * Both shapes serve the same two files per item: index.json and
 * <name>.json — this function is the one place that knows how to read
 * either shape, so every caller above it just calls fetchIndex/fetchItem.
 */
async function fetchJson(base, file) {
  if (isUrl(base)) {
    const url = `${base.replace(/\/$/, "")}/${file}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Registry request failed (${res.status}): ${url}`);
    }
    return res.json();
  }

  const filePath = path.join(base, file);
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`Registry file not found: ${filePath}`);
    }
    throw err;
  }
}

export function fetchIndex(base) {
  return fetchJson(base, "index.json");
}

export function fetchItem(base, name) {
  return fetchJson(base, `${name}.json`);
}

/**
 * Resolves a component's registryDependencies transitively, in dependency
 * order (a dependency is always installed before the item that needs it),
 * deduplicated so a shared dependency like "utils" is only fetched once
 * even if multiple requested components reference it. Post-order insertion
 * (an item is only added to `resolved` after its own dependencies are fully
 * visited) is what guarantees "dependency before dependent" — inserting a
 * placeholder before recursing would lock the item into an earlier position
 * than dependencies that resolve later. `visiting` is a separate cycle
 * guard so a genuine dependency cycle can't recurse forever.
 */
export async function resolveItems(base, names) {
  const resolved = new Map();
  const visiting = new Set();

  async function visit(name) {
    if (resolved.has(name) || visiting.has(name)) return;
    visiting.add(name);
    const item = await fetchItem(base, name);
    for (const dep of item.registryDependencies ?? []) {
      await visit(dep);
    }
    resolved.set(name, item);
    visiting.delete(name);
  }

  for (const name of names) {
    await visit(name);
  }

  return [...resolved.values()];
}

/** A recipe name is namespaced in the registry as "recipe-<name>" so it
 * can't collide with a component of the same name, but callers pass the
 * shorter "recipe:<name>" form (matching the CLI's `add recipe:auth-form`).
 * This is the one place that translation happens. Mirrors
 * packages/cli/src/paths.js's resolveItemName(). */
export function resolveItemName(name) {
  return name.startsWith("recipe:") ? `recipe-${name.slice("recipe:".length)}` : name;
}

/**
 * Resolves which registry base to use, in priority order:
 *   1. DSGN_REGISTRY env var (explicit override, mirrors the CLI's --registry flag)
 *   2. The monorepo's own local build (packages/registry/dist/r), if this
 *      file is running from inside a checkout of the monorepo — detected by
 *      walking up from this file's own location, so a contributor gets their
 *      local dev registry with zero configuration.
 *   3. The deployed production registry.
 */
export async function resolveRegistryBase() {
  if (process.env.DSGN_REGISTRY) {
    return process.env.DSGN_REGISTRY;
  }

  const local = await findLocalRegistryDir();
  if (local) {
    return local;
  }

  return DEFAULT_REGISTRY;
}

async function findLocalRegistryDir() {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  // Walk up from packages/mcp/src to the filesystem root, checking each
  // ancestor for packages/registry/dist/r/index.json. In a real npm install
  // (this package installed as a dependency elsewhere) that path never
  // exists anywhere above node_modules, so this safely falls through.
  while (true) {
    const candidate = path.join(dir, "packages", "registry", "dist", "r");
    try {
      await readFile(path.join(candidate, "index.json"), "utf8");
      return candidate;
    } catch {
      // keep walking up
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
