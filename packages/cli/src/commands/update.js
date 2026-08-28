import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { readConfig, writeConfig, DEFAULT_CONFIG } from "../config.js";
import { fetchItem, DEFAULT_REGISTRY } from "../registry.js";
import { resolveTarget, rewriteAlias, hashContent, resolveItemName } from "../paths.js";

function installedFilesFor(config, itemName) {
  return Object.entries(config.installed ?? {}).filter(([, meta]) => meta.item === itemName);
}

export async function update(cwd, names, { registry, force } = {}) {
  if (names.length === 0) {
    console.error("Usage: npx @dhruvchoudhary/dsgn update <component> [component...] [--force]");
    process.exitCode = 1;
    return;
  }

  const config = (await readConfig(cwd)) ?? DEFAULT_CONFIG;
  const registryBase = registry ?? process.env.DSGN_REGISTRY ?? DEFAULT_REGISTRY;
  const installed = { ...(config.installed ?? {}) };

  const updated = [];
  const blocked = [];

  for (const rawName of names) {
    const itemName = resolveItemName(rawName);
    const files = installedFilesFor(config, itemName);

    if (files.length === 0) {
      console.log(`${rawName}: not installed — nothing to update`);
      continue;
    }

    const item = await fetchItem(registryBase, itemName);

    for (const [targetRelative, meta] of files) {
      const localPath = path.join(cwd, targetRelative);
      let localContent = null;
      try {
        localContent = await readFile(localPath, "utf8");
      } catch {
        // Missing on disk — update writes it back rather than skipping,
        // same as recreating a deleted file.
      }

      const drifted = localContent !== null && hashContent(localContent) !== meta.hash;
      if (drifted && !force) {
        blocked.push(targetRelative);
        continue;
      }

      const registryFile = item.files.find(
        (f) => resolveTarget(config, f.target).split(path.sep).join("/") === targetRelative,
      );
      if (!registryFile) continue;

      const content = rewriteAlias(registryFile.content, config);
      await mkdir(path.dirname(localPath), { recursive: true });
      await writeFile(localPath, content);
      installed[targetRelative] = { item: itemName, hash: hashContent(content) };
      updated.push(targetRelative);
    }
  }

  if (updated.length > 0) {
    console.log("Updated:");
    for (const file of updated) console.log(`  ${file}`);
    await writeConfig(cwd, { ...config, installed });
  }
  if (blocked.length > 0) {
    console.log("\nSkipped (locally modified since install — pass --force to overwrite anyway):");
    for (const file of blocked) console.log(`  ${file}`);
  }
  if (updated.length === 0 && blocked.length === 0) {
    console.log("Nothing to update.");
  }
}
