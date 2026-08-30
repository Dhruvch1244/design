#!/usr/bin/env node
// Fails the build if any BUILT registry item (packages/registry/dist/r/*.json,
// what the CLI actually fetches and what consumers actually receive) still
// contains an unresolved relative import.
//
// This exists because it already happened: alert-dialog, combobox, and
// pagination all imported a sibling component by its src/ location (e.g.
// combobox importing "../button/button"), and build-registry.mjs's
// rewriteImportsForConsumers only rewrote the recipe shape
// ("../components/<name>/<name>"), not the plain component-to-component
// shape ("../<name>/<name>"). packages/registry's own `tsc --noEmit` never
// caught this — it typechecks src/, where those relative imports are still
// correctly resolvable on disk, since the bug only exists after the build
// step flattens every component into one directory. Found by actually
// installing these components into a real external consumer project via
// `npx @dhruvchoudhary/dsgn add`, which is the only place the broken import
// ever surfaces. See philosophy/code-style.md's std-first section on
// writing down a footgun once it's been hit, not just fixing it in place —
// same reasoning as scripts/lint-registry-tokens.mjs.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(repoRoot, "packages", "registry", "dist", "r");

const RELATIVE_IMPORT = /from\s+["'](\.\.\/[^"']+)["']/g;

async function main() {
  let files;
  try {
    files = (await readdir(distDir)).filter((f) => f.endsWith(".json") && f !== "index.json");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(
        `${distDir} doesn't exist — run \`npm run build:registry\` (or \`npm run sync-registry\`) before this check.`,
      );
      process.exit(1);
    }
    throw err;
  }

  const violations = [];

  for (const name of files) {
    const item = JSON.parse(await readFile(path.join(distDir, name), "utf8"));
    for (const file of item.files ?? []) {
      const lines = file.content.split("\n");
      lines.forEach((line, i) => {
        for (const match of line.matchAll(RELATIVE_IMPORT)) {
          violations.push({ item: name, target: file.target, line: i + 1, importPath: match[1] });
        }
      });
    }
  }

  if (violations.length > 0) {
    console.error(`\nFound ${violations.length} unresolved relative import(s) in built registry output:\n`);
    for (const v of violations) {
      console.error(`  ${v.item} (${v.target}):${v.line}  "${v.importPath}"`);
    }
    console.error(
      "\nThese imports only resolve inside packages/registry/src's own directory tree. Once a consumer " +
        "installs this file via the CLI, it lands flat in components/dsgn/ and this import points nowhere. " +
        "Fix packages/registry/scripts/build-registry.mjs's rewriteImportsForConsumers so it rewrites this " +
        "shape to the @/ alias, then re-run `npm run sync-registry`.\n",
    );
    process.exit(1);
  }

  console.log(`Checked ${files.length} built registry item(s) — no unresolved relative imports.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
