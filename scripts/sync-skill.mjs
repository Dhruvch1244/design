#!/usr/bin/env node
// Copies skills/dsgn (the real, single source of truth — also what /skill
// on the site presents and zips) into packages/cli/skill/dsgn, so the CLI
// can bundle it into the published npm tarball and install it with zero
// network dependency beyond `npm install` itself. Run before publish so the
// bundled copy is never stale relative to skills/dsgn.
//
// Also builds packages/cli/skill/flat/dsgn.md — the same content flattened
// into one file, for AI tools that read a single instructions file rather
// than Claude Code's multi-file SKILL.md + agents/ + reference/ format with
// sub-agent dispatch (Cursor, Windsurf, GitHub Copilot, Gemini, plain
// AGENTS.md). Keeping this derived from the same source means the two never
// drift into saying different things about the philosophy or the registry.
import { cp, rm, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const skillSource = join(repoRoot, "skills", "dsgn");
const dirDest = join(repoRoot, "packages", "cli", "skill", "dsgn");
const flatDest = join(repoRoot, "packages", "cli", "skill", "flat", "dsgn.md");

await rm(dirDest, { recursive: true, force: true });
await mkdir(dirname(dirDest), { recursive: true });
await cp(skillSource, dirDest, { recursive: true });
console.log(`Synced skill into ${dirDest}`);

await mkdir(dirname(flatDest), { recursive: true });
await writeFile(flatDest, await buildFlatSkill(skillSource), "utf8");
console.log(`Built flattened skill doc at ${flatDest}`);

async function buildFlatSkill(sourceDir) {
  const AGENT_FILES = [
    "glass-dark-cyan.md",
    "editorial-warm.md",
    "brutalist-mono.md",
    "soft-minimal.md",
    "neon-cyberpunk.md",
  ];
  const REFERENCE_FILES = [
    "philosophy-summary.md",
    "component-registry.md",
    "tokens.md",
    "workflow-checklist.md",
  ];

  const stripFrontmatter = (text) => text.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

  // Push every markdown heading down `levels` (# -> ##, etc.) so a nested
  // document's own H1 doesn't collide with the flat file's top-level ones.
  const demoteHeadings = (text, levels) =>
    text.replace(/^(#{1,6})(\s)/gm, (_, hashes, space) => "#".repeat(Math.min(hashes.length + levels, 6)) + space);

  const readDoc = async (relPath) => stripFrontmatter(await readFile(join(sourceDir, relPath), "utf8"));

  const router = await readDoc("SKILL.md");

  // SKILL.md's "How the handoff actually works" section assumes a
  // Claude-Code-style Task/Agent tool exists to dispatch a sub-agent file to.
  // Tools installing the flat doc have no such mechanism, so swap that
  // section for the single inline-application instruction SKILL.md already
  // documents as the fallback path.
  const routerFlat = router.replace(
    /## How the handoff actually works[\s\S]*?(?=\n## )/,
    "## Applying a chosen style\n\n" +
      "This flattened file has no sub-agent dispatch mechanism to hand off " +
      "to — once the router logic above picks a style, read its matching " +
      "section under \"Style voices\" below yourself, adopt its rules for " +
      "the rest of the session (or until the user asks for a different " +
      "voice), then continue with \"Building, once a style is chosen.\"\n\n",
  );

  const agentSections = await Promise.all(
    AGENT_FILES.map(async (f) => demoteHeadings(await readDoc(join("agents", f)), 2)),
  );
  const referenceSections = await Promise.all(
    REFERENCE_FILES.map(async (f) => demoteHeadings(await readDoc(join("reference", f)), 2)),
  );

  return `${routerFlat}

> This is a flattened, single-file build of the \`dsgn\` Claude Code Agent
> Skill for tools that read one instructions file instead of a multi-file
> skill package. Any \`reference/*.md\` or \`agents/*.md\` path mentioned below
> refers to a heading in this same file, not a separate file on disk — see
> "Style voices" and "Reference" further down.

## Style voices

${agentSections.join("\n\n---\n\n")}

## Reference

${referenceSections.join("\n\n---\n\n")}
`;
}
