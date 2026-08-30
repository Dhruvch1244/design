import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { readConfig } from "../config.js";
import { hashContent } from "../paths.js";

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Cheap, low-false-positive heuristics only — this isn't trying to be a
 * real accessibility linter (eslint-plugin-jsx-a11y already exists for
 * that), just a fast signal on the two mistakes that are both common and
 * unambiguous to detect with a regex. */
function scanAccessibility(content, targetRelative) {
  const issues = [];
  const imgWithoutAlt = /<img(?![^>]*\balt\s*=)[^>]*>/g;
  for (const match of content.matchAll(imgWithoutAlt)) {
    issues.push(`${targetRelative}: <img> without alt="" — "${match[0].slice(0, 60)}..."`);
  }
  const clickableDiv = /<(div|span)(?![^>]*\brole\s*=)(?![^>]*\btabIndex\s*=)[^>]*\bonClick\s*=/g;
  for (const match of content.matchAll(clickableDiv)) {
    issues.push(`${targetRelative}: onClick on a <${match[1]}> with no role/tabIndex — not keyboard-reachable`);
  }
  return issues;
}

export async function doctor(cwd) {
  const config = await readConfig(cwd);
  if (!config) {
    console.log("No dsgn.config.json found — nothing to check. Run `dsgn add <component>` first.");
    return;
  }

  const installed = Object.entries(config.installed ?? {});
  if (installed.length === 0) {
    console.log("dsgn.config.json exists but no files are tracked yet — run `dsgn add <component>` first.");
    return;
  }

  const missing = [];
  const modified = [];
  const clean = [];
  const a11yIssues = [];

  for (const [targetRelative, meta] of installed) {
    const localPath = path.join(cwd, targetRelative);
    if (!(await exists(localPath))) {
      missing.push(targetRelative);
      continue;
    }
    const content = await readFile(localPath, "utf8");
    if (hashContent(content) !== meta.hash) {
      modified.push(targetRelative);
    } else {
      clean.push(targetRelative);
    }
    a11yIssues.push(...scanAccessibility(content, targetRelative));
  }

  console.log(`dsgn doctor — ${installed.length} tracked file(s)\n`);
  console.log(`  ${clean.length} unmodified since install`);
  console.log(`  ${modified.length} locally modified (informational — not necessarily a problem)`);
  console.log(`  ${missing.length} missing on disk`);

  if (modified.length > 0) {
    console.log("\nLocally modified:");
    for (const f of modified) console.log(`  ~ ${f}`);
  }
  if (missing.length > 0) {
    console.log("\nMissing (recorded as installed, not found on disk):");
    for (const f of missing) console.log(`  ✗ ${f}`);
  }
  if (a11yIssues.length > 0) {
    console.log(`\nAccessibility heuristics flagged ${a11yIssues.length} item(s):`);
    for (const issue of a11yIssues) console.log(`  ! ${issue}`);
  }

  const failed = missing.length > 0 || a11yIssues.length > 0;
  console.log(`\n${failed ? "✗ doctor found issues worth a look" : "✓ no problems found"}`);
  if (failed) process.exitCode = 1;
}
