#!/usr/bin/env node
// Turns registry.json (metadata + file paths) into self-contained JSON items
// under dist/r/<name>.json, each with the actual file content embedded, plus
// a dist/r/index.json manifest without content. This is what the CLI fetches
// (locally via --registry <path> during development, or from the deployed
// site's /r/<name>.json in production) — the registry.json in this package
// is the human-edited source of truth; dist/r/ is generated, never edited.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(packageRoot, "dist", "r");

// Consumers are assumed to have a "@/*" path alias (the Next.js/create-next-app
// default, and what apps/site itself uses) pointing at their project root.
// A relative import within the registry source (e.g. "../../lib/utils") only
// makes sense inside this package's own src/ tree; once a file is copied into
// a consumer project at a different relative depth, it must be rewritten to
// the alias instead.
function rewriteImportsForConsumers(source) {
  return source.replace(/from\s+["'](?:\.\.\/)+lib\/utils["']/g, 'from "@/lib/utils"');
}

async function main() {
  const registry = JSON.parse(await readFile(join(packageRoot, "registry.json"), "utf8"));
  await mkdir(outDir, { recursive: true });

  const index = [];

  for (const item of registry.items) {
    const files = await Promise.all(
      item.files.map(async (file) => {
        const raw = await readFile(join(packageRoot, file.path), "utf8");
        return {
          target: file.target,
          type: file.type,
          content: rewriteImportsForConsumers(raw),
        };
      }),
    );

    const built = {
      $schema: "https://design.dhruvchoudhary.com/schema/registry-item.json",
      name: item.name,
      type: item.type,
      description: item.description,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      files,
    };

    await writeFile(join(outDir, `${item.name}.json`), JSON.stringify(built, null, 2) + "\n");

    index.push({
      name: item.name,
      type: item.type,
      description: item.description,
      registryDependencies: item.registryDependencies ?? [],
    });
  }

  await writeFile(join(outDir, "index.json"), JSON.stringify({ name: registry.name, items: index }, null, 2) + "\n");

  console.log(`Built ${registry.items.length} registry item(s) into ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
