#!/usr/bin/env node
// Builds every installable form of the dsgn skill from the single real
// source at skills/dsgn/ into packages/cli/skill/, so `dsgn skill` can
// bundle all of them into the published npm tarball and install with zero
// network dependency beyond `npm install` itself. Run before publish so none
// of these can go stale relative to skills/dsgn.
//
// Each AI tool gets the structure its own format actually supports, not a
// one-size-fits-all flattened file:
//   skill/dsgn/            Claude Code's real multi-file skill (unchanged copy)
//   skill/flat/dsgn.md      One flattened file — AGENTS.md is a single-file
//                            convention by design, so this is the correct
//                            shape for it, not a shortcut.
//   skill/cursor/            router.mdc + agents/*.mdc + reference/*.mdc —
//                            Cursor reads each file's own `description` and
//                            pulls in the relevant one automatically.
//   skill/windsurf/          project/dsgn-*.md (flat, Windsurf's own
//                            convention) + global/global_rules.md (a
//                            hand-written condensed doc — Windsurf's global
//                            slot is hard-capped at 6,000 characters, the
//                            full skill cannot fit).
//   skill/copilot/           copilot-instructions.md (router + philosophy +
//                            registry + tokens + checklist) + instructions/
//                            dsgn-<voice>.instructions.md — Copilot has no
//                            description-based routing, so all 7 apply
//                            together whenever their `applyTo` glob matches.
//   skill/gemini/            project-GEMINI.md / global-GEMINI.md (differ
//                            only in @import path prefix) + a shared
//                            dsgn/agents/*.md + dsgn/reference/*.md tree,
//                            using Gemini CLI's real @file.md import syntax.
//
// skills/dsgn/'s own prose cross-references its sibling files as
// "agents/<name>.md" / "reference/<name>.md" throughout — correct for
// Claude's own layout, wrong for every other tool's real file names/paths.
// Every builder below runs its per-tool `fixPaths` over the router AND every
// agent/reference body it emits, not just the router, since those files
// cross-reference each other too (e.g. every style agent points at
// `reference/tokens.md`).
import { cp, rm, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const skillRoot = join(repoRoot, "skills", "dsgn");
const adoptRoot = join(repoRoot, "skills", "dsgn-adopt");
const outRoot = join(repoRoot, "packages", "cli", "skill");

const AGENT_FILES = [
  "glass-dark-cyan.md",
  "editorial-warm.md",
  "brutalist-mono.md",
  "soft-minimal.md",
  "neon-cyberpunk.md",
  "corporate.md",
  "startup.md",
];
const REFERENCE_FILES = [
  "philosophy-summary.md",
  "component-registry.md",
  "tokens.md",
  "workflow-checklist.md",
];
// Reference docs have no frontmatter of their own (unlike agents/*.md, which
// each already carry a real `description`) — these one-liners are the same
// copy already shipped on the /skill page's reference-docs table, reused
// here rather than inventing new summaries.
const REFERENCE_DESCRIPTIONS = {
  "philosophy-summary.md":
    "Condensed from philosophy/AGENTS.md — nine rules extracted from decisions that actually shipped in three real apps, not aspirational values.",
  "component-registry.md":
    "The real 36 UI components plus utils, sourced from packages/registry/registry.json and each component's actual source — real prop names, real variants.",
  "tokens.md":
    "The site's real CSS custom properties from apps/site/app/globals.css, and the raw-value to semantic-alias to Tailwind-token indirection every style agent reskins through.",
  "workflow-checklist.md":
    "What each of the five workflow facets (build/compose/theme/a11y-review/motion) concretely means, grounded in this repo's real motion primitives and performance guardrails.",
};

const stripFrontmatter = (text) => text.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
const frontmatterField = (text, field) => {
  const match = text.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : null;
};
// Push every markdown heading down `levels` (# -> ##, etc.) so a nested
// document's own H1 doesn't collide with a wrapping section's heading.
const demoteHeadings = (text, levels) =>
  text.replace(/^(#{1,6})(\s)/gm, (_, hashes, space) => "#".repeat(Math.min(hashes.length + levels, 6)) + space);
const identity = (text) => text;

const readRaw = async (relPath) => readFile(join(skillRoot, relPath), "utf8");
const readStripped = async (relPath) => stripFrontmatter(await readRaw(relPath));

async function writeDeep(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

// ---------------------------------------------------------------------------
// 1. Claude Code — unchanged, the real multi-file skill copied as-is.
// ---------------------------------------------------------------------------
async function buildClaude() {
  const dest = join(outRoot, "dsgn");
  await rm(dest, { recursive: true, force: true });
  await mkdir(dirname(dest), { recursive: true });
  // global-summary.md lives under skills/dsgn/ for convenience (it's built
  // from the same source tree) but it's Windsurf-global-only content, not
  // part of the actual Claude Code skill — exclude it from this copy.
  await cp(skillRoot, dest, {
    recursive: true,
    filter: (source) => !source.endsWith("global-summary.md"),
  });
  console.log(`Synced Claude Code skill into ${dest}`);
}

// ---------------------------------------------------------------------------
// 1b. dsgn-adopt — Claude Code only for now (see skills/dsgn-adopt/README.md
// for why: it's an on-demand procedure, not always-active persistent
// context, which fits Claude Code's Skill-invocation model most naturally —
// the other tools' formats are all built around the latter). Unchanged copy,
// same shape as buildClaude() above.
// ---------------------------------------------------------------------------
async function buildAdopt() {
  const dest = join(outRoot, "adopt");
  await rm(dest, { recursive: true, force: true });
  await mkdir(dirname(dest), { recursive: true });
  await cp(adoptRoot, dest, { recursive: true });
  console.log(`Synced dsgn-adopt skill into ${dest}`);
}

// ---------------------------------------------------------------------------
// Shared router text with each tool's own "how the handoff works" story
// swapped in place of SKILL.md's Claude-Task-tool-specific section, then run
// through that tool's own path-fixer.
// ---------------------------------------------------------------------------
async function buildRouter(handoffBody, fixPaths) {
  const router = await readStripped("SKILL.md");
  const withHandoff = router.replace(
    /## How the handoff actually works[\s\S]*?(?=\n## )/,
    `## Applying a chosen style\n\n${handoffBody}\n\n`,
  );
  return fixPaths(withHandoff);
}

// ---------------------------------------------------------------------------
// 2. AGENTS.md — single flattened file. This is the correct shape for this
//    target (the AGENTS.md convention is single-file by design), not a
//    shortcut taken for the other tools too. Internal agents/*.md and
//    reference/*.md cross-references are left as-is here (both sections
//    exist in this very file, just as headings) — a short note says so.
// ---------------------------------------------------------------------------
async function buildFlat() {
  const routerFlat = await buildRouter(
    "This flattened file has no sub-agent dispatch mechanism to hand off to " +
      '— once the router logic above picks a style, read its matching section ' +
      'under "Style voices" below yourself, adopt its rules for the rest of the ' +
      'session (or until the user asks for a different voice), then continue ' +
      'with "Building, once a style is chosen."',
    identity,
  );

  const agentSections = await Promise.all(
    AGENT_FILES.map(async (f) => demoteHeadings(await readStripped(join("agents", f)), 2)),
  );
  const referenceSections = await Promise.all(
    REFERENCE_FILES.map(async (f) => demoteHeadings(await readStripped(join("reference", f)), 2)),
  );

  const doc = `${routerFlat}

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

  const dest = join(outRoot, "flat", "dsgn.md");
  await writeDeep(dest, doc);
  console.log(`Built flattened skill doc at ${dest}`);
}

// ---------------------------------------------------------------------------
// 3. Cursor — router.mdc + agents/*.mdc + reference/*.mdc, each a real
//    sibling file. Cursor reads every file's `description` frontmatter and
//    pulls in the matching one automatically (its own documented behavior
//    for non-glob, non-alwaysApply rules) — the closest real equivalent to
//    Claude Code's sub-agent dispatch any of these tools has. The folder
//    names (agents/, reference/) are unchanged from Claude's layout, only
//    the file extension moves from .md to .mdc.
// ---------------------------------------------------------------------------
function cursorFrontmatter(description) {
  return `---\ndescription: ${description}\nalwaysApply: false\n---\n\n`;
}

const fixPathsCursor = (text) =>
  text.replace(/(agents\/[\w-]+)\.md/g, "$1.mdc").replace(/(reference\/[\w-]+)\.md/g, "$1.mdc");

async function buildCursor() {
  const routerBody = await buildRouter(
    "Cursor has no sub-agent dispatch either, but there is no need to flatten " +
      "anything here — each style voice and reference doc is a real sibling " +
      "file (`agents/*.mdc`, `reference/*.mdc`), each with its own " +
      "`description` in its frontmatter. Cursor reads those descriptions and " +
      "pulls in the matching file automatically once the router above has " +
      "picked a style.",
    fixPathsCursor,
  );

  const skillDescription = frontmatterField(await readRaw("SKILL.md"), "description");
  await writeDeep(join(outRoot, "cursor", "router.mdc"), cursorFrontmatter(skillDescription) + routerBody + "\n");

  for (const file of AGENT_FILES) {
    const raw = await readRaw(join("agents", file));
    const description = frontmatterField(raw, "description");
    const body = fixPathsCursor(stripFrontmatter(raw));
    await writeDeep(join(outRoot, "cursor", "agents", file.replace(/\.md$/, ".mdc")), cursorFrontmatter(description) + body + "\n");
  }

  for (const file of REFERENCE_FILES) {
    const body = fixPathsCursor(await readStripped(join("reference", file)));
    await writeDeep(
      join(outRoot, "cursor", "reference", file.replace(/\.md$/, ".mdc")),
      cursorFrontmatter(REFERENCE_DESCRIPTIONS[file]) + body + "\n",
    );
  }

  console.log(`Built Cursor rules into ${join(outRoot, "cursor")}`);
}

// ---------------------------------------------------------------------------
// 4. Windsurf — project/dsgn-*.md (flat files, Windsurf's own documented
//    convention: no subdirectories, no confirmed frontmatter schema, so none
//    is invented here) + global/global_rules.md, a hand-written condensed
//    doc because Windsurf's global slot is hard-capped at 6,000 characters —
//    the full skill (~40k characters) cannot fit there at all.
// ---------------------------------------------------------------------------
const fixPathsWindsurf = (text) =>
  text
    .replace(/agents\/([\w-]+)\.md/g, "dsgn-$1.md")
    .replace(/reference\/([\w-]+)\.md/g, "dsgn-$1.md")
    .replace(/`agents\/`/g, "the sibling `dsgn-<voice>.md` files")
    .replace(/`reference\/`/g, "the sibling `dsgn-<reference-name>.md` files");

async function buildWindsurf() {
  const routerBody = await buildRouter(
    "Windsurf has no sub-agent dispatch or per-file description-routing — " +
      "every `dsgn-*.md` file in this same `.windsurf/rules/` directory is " +
      "loaded into context together. The router logic above is what tells " +
      "you, the model, which single voice's file (`dsgn-<voice>.md`) to " +
      "actually apply; the reference files (`dsgn-<reference-name>.md`) " +
      "apply regardless of which voice is chosen.",
    fixPathsWindsurf,
  );
  await writeDeep(join(outRoot, "windsurf", "project", "dsgn-router.md"), routerBody + "\n");

  for (const file of AGENT_FILES) {
    const body = fixPathsWindsurf(await readStripped(join("agents", file)));
    await writeDeep(join(outRoot, "windsurf", "project", `dsgn-${file}`), body + "\n");
  }
  for (const file of REFERENCE_FILES) {
    const body = fixPathsWindsurf(await readStripped(join("reference", file)));
    await writeDeep(join(outRoot, "windsurf", "project", `dsgn-${file}`), body + "\n");
  }

  const globalSummary = await readFile(join(skillRoot, "global-summary.md"), "utf8");
  if (Buffer.byteLength(globalSummary, "utf8") > 6000) {
    throw new Error("skills/dsgn/global-summary.md exceeds Windsurf's 6,000-character global_rules.md cap");
  }
  await writeDeep(join(outRoot, "windsurf", "global", "global_rules.md"), globalSummary);

  console.log(`Built Windsurf rules into ${join(outRoot, "windsurf")}`);
}

// ---------------------------------------------------------------------------
// 5. GitHub Copilot — copilot-instructions.md (repo-wide: router + inlined
//    reference docs) + instructions/dsgn-<voice>.instructions.md, scoped via
//    `applyTo` (the only frontmatter field the format documents — no
//    description-based routing exists, so all 7 apply together whenever
//    their glob matches; that limitation is stated in the router text
//    itself rather than papered over).
// ---------------------------------------------------------------------------
const COPILOT_APPLY_TO = "**/*.tsx,**/*.jsx,**/*.css,**/*.scss";

const fixPathsCopilot = (text) =>
  text
    .replace(/`agents\/([\w-]+)\.md`/g, (_, name) => `\`.github/instructions/dsgn-${name}.instructions.md\``)
    .replace(/`reference\/[\w-]+\.md`/g, "the Reference section below")
    .replace(/`agents\/`/g, "the sibling `.github/instructions/dsgn-*.instructions.md` files")
    .replace(/`reference\/`/g, "the Reference section below");

async function buildCopilot() {
  const routerBody = await buildRouter(
    "Copilot has no sub-agent dispatch and no description-based file " +
      "routing — every file under `.github/instructions/dsgn-*.instructions.md` " +
      "applies together whenever its `applyTo` glob matches the file you're " +
      "editing, regardless of which voice the router below picks. If you " +
      "only want one voice active, delete the other four " +
      "`dsgn-*.instructions.md` files after installing. Reference docs " +
      "(component registry, tokens, workflow checklist) are inlined below " +
      "since they apply no matter which voice is active.",
    fixPathsCopilot,
  );

  const referenceSections = await Promise.all(
    REFERENCE_FILES.map(async (f) => demoteHeadings(fixPathsCopilot(await readStripped(join("reference", f))), 1)),
  );
  const main = `${routerBody}\n\n## Reference\n\n${referenceSections.join("\n\n---\n\n")}\n`;
  await writeDeep(join(outRoot, "copilot", "copilot-instructions.md"), main);

  for (const file of AGENT_FILES) {
    const body = fixPathsCopilot(await readStripped(join("agents", file)));
    const frontmatter = `---\napplyTo: "${COPILOT_APPLY_TO}"\n---\n\n`;
    await writeDeep(
      join(outRoot, "copilot", "instructions", `dsgn-${file.replace(/\.md$/, ".instructions.md")}`),
      frontmatter + body + "\n",
    );
  }

  console.log(`Built Copilot instructions into ${join(outRoot, "copilot")}`);
}

// ---------------------------------------------------------------------------
// 6. Gemini CLI — project-GEMINI.md / global-GEMINI.md (identical content,
//    differing only in the @import path prefix to the shared dsgn/ data
//    directory) using Gemini CLI's real @file.md import syntax (confirmed:
//    resolved relative to the importing file's own directory).
// ---------------------------------------------------------------------------
const fixPathsGemini = (text) =>
  text
    .replace(/agents\/([\w-]+)\.md/g, "dsgn/agents/$1.md")
    .replace(/reference\/([\w-]+)\.md/g, "dsgn/reference/$1.md")
    .replace(/`agents\/`/g, "`dsgn/agents/`")
    .replace(/`reference\/`/g, "`dsgn/reference/`");

async function buildGemini() {
  const routerBody = await buildRouter(
    "Gemini CLI has no sub-agent dispatch, but every style voice and " +
      "reference doc below is a real imported file (`@./dsgn/agents/*.md`, " +
      "`@./dsgn/reference/*.md`) rather than hand-copied text — Gemini " +
      "concatenates them into context automatically. The router logic above " +
      "is what tells you, the model, which imported voice section to " +
      "actually apply. The exact import path differs by one segment between " +
      "the project and global install — see the imports below.",
    fixPathsGemini,
  );

  const importBlock = (prefix) =>
    [
      ...AGENT_FILES.map((f) => `@./${prefix}dsgn/agents/${f}`),
      ...REFERENCE_FILES.map((f) => `@./${prefix}dsgn/reference/${f}`),
    ].join("\n");

  // Project: data lives at <project>/.gemini/dsgn/, imported relative to
  // <project>/GEMINI.md — hence the ".gemini/" prefix.
  const projectDoc = `${routerBody}\n\n## Style voices and reference\n\n${importBlock(".gemini/")}\n`;
  // Global: GEMINI.md itself lives at ~/.gemini/GEMINI.md, so its sibling
  // data directory is ~/.gemini/dsgn/ directly — no extra path segment.
  const globalDoc = `${routerBody}\n\n## Style voices and reference\n\n${importBlock("")}\n`;

  await writeDeep(join(outRoot, "gemini", "project-GEMINI.md"), projectDoc);
  await writeDeep(join(outRoot, "gemini", "global-GEMINI.md"), globalDoc);

  for (const file of AGENT_FILES) {
    const body = fixPathsGemini(await readStripped(join("agents", file)));
    await writeDeep(join(outRoot, "gemini", "dsgn", "agents", file), body + "\n");
  }
  for (const file of REFERENCE_FILES) {
    const body = fixPathsGemini(await readStripped(join("reference", file)));
    await writeDeep(join(outRoot, "gemini", "dsgn", "reference", file), body + "\n");
  }

  console.log(`Built Gemini context files into ${join(outRoot, "gemini")}`);
}

await buildClaude();
await buildAdopt();
await buildFlat();
await buildCursor();
await buildWindsurf();
await buildCopilot();
await buildGemini();
