import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Mirrors apps/site/lib/philosophy-docs.ts's PHILOSOPHY_DOCS, plus
// "agents" for the root AGENTS.md entry-point doc (the site doesn't render
// AGENTS.md as its own /philosophy/<slug> page, but MCP clients are
// exactly the "any AI coding tool" audience it's written for). Deliberately
// duplicated rather than imported — same publish-boundary reasoning as
// registry.js's DEFAULT_REGISTRY comment.
export const PHILOSOPHY_DOCS = [
  { slug: "agents", title: "AGENTS.md (start here)", file: "AGENTS.md" },
  { slug: "architecture", title: "Architecture", file: "architecture.md" },
  { slug: "ui-interaction", title: "UI & Interaction", file: "ui-interaction.md" },
  { slug: "code-style", title: "Code Style", file: "code-style.md" },
  { slug: "anti-patterns", title: "Anti-Patterns", file: "anti-patterns.md" },
  { slug: "motion", title: "Motion & Animation", file: "motion.md" },
];

export function findDocBySlug(slug) {
  return PHILOSOPHY_DOCS.find((doc) => doc.slug === slug);
}

/**
 * Resolves the philosophy docs directory, in priority order:
 *   1. The monorepo's own philosophy/ (detected by walking up from this
 *      file's location), so a contributor always gets the doc they're
 *      actually editing — same pattern as registry.js's
 *      findLocalRegistryDir().
 *   2. This package's own bundled copy (philosophy/ next to package.json),
 *      populated by `npm run build:philosophy` before publish — what a
 *      globally-installed/npx'd copy of this package falls back to.
 */
async function resolvePhilosophyDir() {
  const local = await findLocalPhilosophyDir();
  if (local) return local;

  const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  return path.join(packageRoot, "philosophy");
}

// Walks up from this package's own directory (packages/mcp) to the
// filesystem root, checking each ancestor for philosophy/AGENTS.md. Starts
// at packages/mcp's *parent*, not packages/mcp itself, so this package's
// own bundled fallback copy (packages/mcp/philosophy, synced by
// scripts/sync-philosophy.mjs) never gets mistaken for the monorepo's real
// source — walking up must reach the actual repo root, or find nothing.
async function findLocalPhilosophyDir() {
  const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  let dir = path.dirname(packageRoot);
  while (true) {
    const candidate = path.join(dir, "philosophy", "AGENTS.md");
    try {
      await readFile(candidate, "utf8");
      return path.join(dir, "philosophy");
    } catch {
      // not here — keep walking up
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export async function listPhilosophyDocs() {
  const dir = await resolvePhilosophyDir();
  const docs = [];
  for (const doc of PHILOSOPHY_DOCS) {
    const raw = await readFile(path.join(dir, doc.file), "utf8");
    const firstParagraph = raw
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .find((block) => block && !block.startsWith("#"));
    docs.push({ slug: doc.slug, title: doc.title, summary: firstParagraph ?? "" });
  }
  return docs;
}

export async function readPhilosophyDoc(slug) {
  const doc = findDocBySlug(slug);
  if (!doc) {
    const known = PHILOSOPHY_DOCS.map((d) => d.slug).join(", ");
    throw new Error(`Unknown philosophy doc "${slug}". Known docs: ${known}.`);
  }
  const dir = await resolvePhilosophyDir();
  const content = await readFile(path.join(dir, doc.file), "utf8");
  return { slug: doc.slug, title: doc.title, content };
}
