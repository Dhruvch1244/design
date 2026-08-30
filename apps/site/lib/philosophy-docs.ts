// Client-safe: just the doc list/lookup, no Node imports. Split out of
// lib/philosophy.ts specifically so a client component (the command
// palette) can list the docs without pulling node:fs/promises into the
// browser bundle — Turbopack can't chunk a Node built-in for the client and
// fails the whole build if anything client-side imports the barrel that
// re-exports it, even if that component never calls the fs-touching export.
export const PHILOSOPHY_DOCS = [
  { slug: "architecture", title: "Architecture", file: "architecture.md" },
  { slug: "ui-interaction", title: "UI & Interaction", file: "ui-interaction.md" },
  { slug: "code-style", title: "Code Style", file: "code-style.md" },
  { slug: "anti-patterns", title: "Anti-Patterns", file: "anti-patterns.md" },
] as const;

export function findDocBySlug(slug: string) {
  return PHILOSOPHY_DOCS.find((doc) => doc.slug === slug);
}
