import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

// The philosophy docs live at the repo root (../../philosophy relative to
// this app), not inside apps/site — they're meant to be read on their own,
// by any AI tool, independent of this site existing at all. The site reads
// them rather than owning a copy, so there is exactly one source of truth.
const PHILOSOPHY_DIR = path.join(process.cwd(), "..", "..", "philosophy");

export { PHILOSOPHY_DOCS, findDocBySlug } from "./philosophy-docs";

export async function readPhilosophyMarkdown(filename: string): Promise<string> {
  const raw = await readFile(path.join(PHILOSOPHY_DIR, filename), "utf8");
  return raw;
}

export async function renderMarkdown(markdown: string): Promise<string> {
  return marked.parse(markdown, { async: true });
}
