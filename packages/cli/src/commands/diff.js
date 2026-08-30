import { readFile } from "node:fs/promises";
import path from "node:path";
import { readConfig, DEFAULT_CONFIG } from "../config.js";
import { fetchItem, DEFAULT_REGISTRY } from "../registry.js";
import { resolveTarget, rewriteAlias, hashContent, resolveItemName } from "../paths.js";
import { lineDiff, formatDiff, hasChanges } from "../line-diff.js";

/** Files this component installed, according to the project's own record
 * of what `add` wrote — not a guess from resolveTarget, since the user's
 * componentsDir/alias may have changed since install. */
function installedFilesFor(config, itemName) {
  return Object.entries(config.installed ?? {}).filter(([, meta]) => meta.item === itemName);
}

export async function diff(cwd, names, { registry } = {}) {
  if (names.length === 0) {
    console.error("Usage: npx @dhruvchoudhary/dsgn diff <component> [component...]");
    process.exitCode = 1;
    return;
  }

  const config = (await readConfig(cwd)) ?? DEFAULT_CONFIG;
  const registryBase = registry ?? process.env.DSGN_REGISTRY ?? DEFAULT_REGISTRY;

  let anyChanges = false;

  for (const rawName of names) {
    const itemName = resolveItemName(rawName);
    const files = installedFilesFor(config, itemName);

    if (files.length === 0) {
      console.log(`${rawName}: not installed (or installed before this project tracked file hashes)`);
      continue;
    }

    const item = await fetchItem(registryBase, itemName);

    for (const [targetRelative, meta] of files) {
      const localPath = path.join(cwd, targetRelative);
      let localContent;
      try {
        localContent = await readFile(localPath, "utf8");
      } catch (err) {
        if (err.code === "ENOENT") {
          console.log(`\n${targetRelative}: recorded as installed but missing on disk (run \`dsgn doctor\`)`);
          continue;
        }
        throw err;
      }

      const registryFile = item.files.find(
        (f) => resolveTarget(config, f.target).split(path.sep).join("/") === targetRelative,
      );
      if (!registryFile) continue;

      const upstreamContent = rewriteAlias(registryFile.content, config);
      const drifted = hashContent(localContent) !== meta.hash;
      const d = lineDiff(localContent, upstreamContent);

      console.log(`\n${targetRelative}`);
      if (drifted) {
        console.log("  ⚠ locally modified since install — this diff mixes your edits with upstream changes");
      }
      if (!hasChanges(d)) {
        console.log("  up to date");
        continue;
      }
      anyChanges = true;
      console.log(formatDiff(d));
    }
  }

  if (!anyChanges) console.log("\nNo differences from the registry.");
}
