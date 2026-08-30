import { readFile } from "node:fs/promises";
import path from "node:path";

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
 * either shape, so every command above it just calls fetchIndex/fetchItem.
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
 * even if multiple requested components reference it.
 */
export async function resolveItems(base, names) {
  const resolved = new Map();
  // Cycle guard, separate from `resolved` — a Map only appends a key to its
  // iteration-order position the *first* time it's set, so pre-inserting a
  // placeholder for the current item (as this used to do) before recursing
  // into its dependencies locks that item into an earlier position than its
  // own dependencies, even though the dependencies resolve and get inserted
  // later. That silently broke the "dependency before dependent" ordering
  // this function's own contract promises. Only inserting into `resolved`
  // after a name's dependencies are fully visited (post-order) fixes that,
  // while `visiting` still stops a genuine dependency cycle from recursing
  // forever.
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
