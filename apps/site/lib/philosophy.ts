import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

// The philosophy docs live at the repo root (../../philosophy relative to
// this app), not inside apps/site — they're meant to be read on their own,
// by any AI tool, independent of this site existing at all. The site reads
// them rather than owning a copy, so there is exactly one source of truth.
const PHILOSOPHY_DIR = path.join(process.cwd(), "..", "..", "philosophy");

export { PHILOSOPHY_DOCS, findDocBySlug } from "./philosophy-docs";

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export async function readPhilosophyMarkdown(filename: string): Promise<string> {
  const raw = await readFile(path.join(PHILOSOPHY_DIR, filename), "utf8");
  return raw;
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
};

// marked encodes apostrophes/quotes/etc. in heading text as HTML entities
// (e.g. "framework's" -> "framework&#39;s"). Left undecoded, the numeric
// digits in "&#39;" survive slugify's alphanumeric-only filter and land in
// the id (...framework-39-s...), and the raw "&#39;" string renders
// literally in the TOC sidebar (React escapes text content, so it can't
// turn back into an apostrophe on its own) instead of "framework's".
function decodeEntities(text: string): string {
  return text.replace(/&(#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code in HTML_ENTITIES) return HTML_ENTITIES[code];
    if (code.startsWith("#")) return String.fromCharCode(Number(code.slice(1)));
    return match;
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Renders markdown to HTML, then injects `id` attributes onto every h2/h3
 * (marked hasn't auto-generated heading ids since a core version several
 * years back — that moved to a separate extension we don't otherwise need)
 * and returns a flat table of contents alongside the HTML, so the sidebar
 * can render real anchor links and a scrollspy can track them, instead of
 * every doc being one un-navigable wall of text.
 */
export async function renderMarkdown(markdown: string): Promise<{ html: string; toc: TocEntry[] }> {
  const rawHtml = await marked.parse(markdown, { async: true });
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();

  const html = rawHtml.replace(
    /<h([23])>(.*?)<\/h\1>/g,
    (_match, level: string, inner: string) => {
      const text = decodeEntities(inner.replace(/<[^>]+>/g, "").trim());
      let id = slugify(text);
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;
      toc.push({ id, text, level: Number(level) as 2 | 3 });
      return `<h${level} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html, toc };
}
