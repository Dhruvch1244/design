#!/usr/bin/env node
// Fails the build if skills/dsgn/reference/component-registry.md — a
// hand-maintained snapshot, not a generated file (see sync-skill.mjs, which
// copies it verbatim into every tool's build output but never regenerates
// its content) — drifts from the real packages/registry/registry.json it
// claims to document. SKILL.md itself admits this file "can drift" and says
// to "prefer the live repo when the two disagree"; this script is what
// notices the disagreement instead of leaving it for an agent to hit later.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const registryJsonPath = path.join(repoRoot, "packages", "registry", "registry.json");
const componentRegistryMdPath = path.join(
  repoRoot,
  "skills",
  "dsgn",
  "reference",
  "component-registry.md",
);

async function main() {
  const [registryJson, componentRegistryMd] = await Promise.all([
    readFile(registryJsonPath, "utf8").then(JSON.parse),
    readFile(componentRegistryMdPath, "utf8"),
  ]);

  // Recipe items are named "recipe-<name>" in registry.json but referenced
  // as bare "<name>" everywhere else (the doc's table, `dsgn add
  // recipe:<name>`) — strip the prefix so the comparison is apples-to-apples.
  const namesByType = (type) =>
    new Set(
      registryJson.items
        .filter((item) => item.type === type)
        .map((item) => item.name.replace(/^recipe-/, "")),
    );

  // Pull the backtick-wrapped name from the first cell of every table row
  // between one `## heading` and the next — header/separator rows have no
  // backticks in that position and are skipped naturally by the regex.
  function namesInSection(heading) {
    const start = componentRegistryMd.indexOf(heading);
    if (start === -1) throw new Error(`"${heading}" section not found in component-registry.md`);
    const rest = componentRegistryMd.slice(start + heading.length);
    const end = rest.search(/\n## /);
    const section = end === -1 ? rest : rest.slice(0, end);
    const names = new Set();
    for (const line of section.split("\n")) {
      const match = line.match(/^\|\s*`([\w-]+)`\s*\|/);
      if (match) names.add(match[1]);
    }
    return names;
  }

  const sections = [
    { label: "components", registryNames: namesByType("registry:ui"), heading: "## The 36 components" },
    { label: "recipes", registryNames: namesByType("registry:block"), heading: "## Recipes (composed, multi-component patterns)" },
  ];

  let drifted = false;
  for (const { label, registryNames, heading } of sections) {
    const docNames = namesInSection(heading);
    const missingFromDoc = [...registryNames].filter((name) => !docNames.has(name));
    const staleInDoc = [...docNames].filter((name) => !registryNames.has(name));

    if (missingFromDoc.length > 0 || staleInDoc.length > 0) {
      drifted = true;
      console.error(`\nskills/dsgn/reference/component-registry.md's ${label} table has drifted from registry.json:\n`);
      if (missingFromDoc.length > 0) {
        console.error(`  In registry.json but missing from the doc: ${missingFromDoc.join(", ")}`);
      }
      if (staleInDoc.length > 0) {
        console.error(`  In the doc but no longer in registry.json: ${staleInDoc.join(", ")}`);
      }
    } else {
      console.log(`Checked ${registryNames.size} registry ${label} — in sync with the doc.`);
    }
  }

  if (drifted) {
    console.error(
      "\nUpdate the doc's table(s) (and any stated count) to match, " +
        "then re-run `node scripts/sync-skill.mjs` before publishing.\n",
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
