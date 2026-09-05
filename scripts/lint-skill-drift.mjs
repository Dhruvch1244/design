#!/usr/bin/env node
// Fails the build if skills/dsgn/**'s hand-maintained prose about the
// registry — component-registry.md's table *and* every place a component
// count is stated in plain English (SKILL.md, global-summary.md,
// component-registry.md's own intro + heading) — drifts from the real
// packages/registry/registry.json it claims to document. SKILL.md itself
// admits this file "can drift" and says to "prefer the live repo when the
// two disagree"; this script is what notices the disagreement instead of
// leaving it for an agent (or a reader) to hit later.
//
// This has already drifted for real once (commit a2338bf fixed a stale
// "23 components" count) — the table-name check below existed at the time
// but only compares row names, not the count stated in prose next to it, so
// it didn't catch that case. The count checks here close that gap. The
// table-heading match is a regex (`## The \d+ components`) rather than a
// literal "## The 36 components" for the same reason: a literal would make
// this script itself go stale (throwing "section not found" instead of a
// useful diff) the moment the count changes, which is exactly the kind of
// silent drift this file exists to prevent.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const registryJsonPath = path.join(repoRoot, "packages", "registry", "registry.json");
const skillRoot = path.join(repoRoot, "skills", "dsgn");
const componentRegistryMdPath = path.join(skillRoot, "reference", "component-registry.md");
const skillMdPath = path.join(skillRoot, "SKILL.md");
const globalSummaryMdPath = path.join(skillRoot, "global-summary.md");

async function main() {
  const [registryJson, componentRegistryMd, skillMd, globalSummaryMd] = await Promise.all([
    readFile(registryJsonPath, "utf8").then(JSON.parse),
    readFile(componentRegistryMdPath, "utf8"),
    readFile(skillMdPath, "utf8"),
    readFile(globalSummaryMdPath, "utf8"),
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

  const componentNames = namesByType("registry:ui");
  const recipeNames = namesByType("registry:block");

  // Pull the backtick-wrapped name from the first cell of every table row
  // between one `## heading` and the next — header/separator rows have no
  // backticks in that position and are skipped naturally by the regex.
  // `headingPattern` is a regex (not a literal string) so a stale stated
  // count in the heading itself is reported as a count mismatch below,
  // rather than making this function throw "section not found".
  function findSection(headingPattern) {
    const headingMatch = componentRegistryMd.match(headingPattern);
    if (!headingMatch) throw new Error(`No heading matching ${headingPattern} found in component-registry.md`);
    const start = headingMatch.index + headingMatch[0].length;
    const rest = componentRegistryMd.slice(start);
    const end = rest.search(/\n## /);
    const body = end === -1 ? rest : rest.slice(0, end);
    const names = new Set();
    for (const line of body.split("\n")) {
      const match = line.match(/^\|\s*`([\w-]+)`\s*\|/);
      if (match) names.add(match[1]);
    }
    return { heading: headingMatch[0], names };
  }

  let drifted = false;

  const sections = [
    {
      label: "components",
      registryNames: componentNames,
      headingPattern: /^## The \d+ components$/m,
    },
    {
      label: "recipes",
      registryNames: recipeNames,
      headingPattern: /^## Recipes \(composed, multi-component patterns\)$/m,
    },
  ];

  for (const { label, registryNames, headingPattern } of sections) {
    const { names: docNames } = findSection(headingPattern);
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

  // Every place a plain-English count of the components is stated, matched
  // against the real count so none of them can quietly go stale even when
  // the table above is kept correct (the table-vs-prose split is exactly
  // how "23 components" survived alongside a correct table before).
  const realComponentCount = componentNames.size;
  const countSources = [
    {
      file: "skills/dsgn/reference/component-registry.md (heading)",
      text: findSection(/^## The \d+ components$/m).heading,
      pattern: /## The (\d+) components/,
    },
    {
      file: "skills/dsgn/reference/component-registry.md (intro)",
      text: componentRegistryMd,
      pattern: /(\d+) real UI components plus one/,
    },
    {
      file: "skills/dsgn/SKILL.md",
      text: skillMd,
      pattern: /(\d+) components \+ a utils/,
    },
    {
      file: "skills/dsgn/global-summary.md",
      text: globalSummaryMd,
      pattern: /(\d+) real React \+ Tailwind \+ CVA components/,
    },
  ];

  for (const { file, text, pattern } of countSources) {
    const match = text.match(pattern);
    if (!match) {
      drifted = true;
      console.error(`\n${file}: expected a stated component count matching ${pattern}, found none.`);
      continue;
    }
    const statedCount = Number(match[1]);
    if (statedCount !== realComponentCount) {
      drifted = true;
      console.error(
        `\n${file}: states "${statedCount} components" but registry.json currently has ${realComponentCount}.`,
      );
    }
  }

  if (drifted) {
    console.error(
      "\nUpdate the stale doc(s) above to match, " +
        "then re-run `node scripts/sync-skill.mjs` before publishing.\n",
    );
    process.exit(1);
  } else {
    console.log(`All stated component counts match registry.json (${realComponentCount}).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
