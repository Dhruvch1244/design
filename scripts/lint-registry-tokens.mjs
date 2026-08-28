#!/usr/bin/env node
// Fails the build if any registry component source references a token that
// only exists in *this* site's bespoke theme (bg-glass, shadow-ambient,
// shadow-glow, glass-strong, font-display, ...) rather than the standard
// shadcn-convention tokens every registry item is supposed to depend on
// exclusively (background, foreground, card, primary, secondary, accent,
// muted, destructive, border, ring).
//
// This exists because it already happened once: Button, Command, Dialog,
// Select, Tabs, and Tooltip all shipped with apps/site's own tokens
// hardcoded directly into the portable registry source — classes that
// don't exist in any consumer project that installs these components via
// the CLI. Caught by hand while building Popover, then fixed retroactively
// across all six. This script is what stops it from quietly coming back as
// the registry keeps growing past 20 items — see philosophy/code-style.md's
// std-first section on writing down a footgun once it's been hit, not just
// fixing it in place.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const componentsDir = path.join(repoRoot, "packages", "registry", "src", "components");

// Each pattern is a site-specific token that has no meaning outside
// apps/site's own globals.css. If a registry component needs a shadow, use
// a plain Tailwind utility (shadow-md, shadow-lg) or an arbitrary value
// built from a standard token (e.g. shadow-[0_0_30px_-6px_var(--accent)]),
// not one of these.
const FORBIDDEN_PATTERNS = [
  { name: "bg-glass", pattern: /\bbg-glass\b/ },
  { name: "glass-strong", pattern: /\bglass-strong\b/ },
  { name: "shadow-ambient", pattern: /\bshadow-ambient\b/ },
  { name: "shadow-glow", pattern: /\bshadow-glow\b/ },
  { name: "font-display", pattern: /\bfont-display\b/ },
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && /\.tsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

async function main() {
  const files = await walk(componentsDir);
  const violations = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const lines = content.split("\n");
    for (const { name, pattern } of FORBIDDEN_PATTERNS) {
      lines.forEach((line, i) => {
        if (pattern.test(line)) {
          violations.push({ file: path.relative(repoRoot, file), line: i + 1, token: name, text: line.trim() });
        }
      });
    }
  }

  if (violations.length > 0) {
    console.error(`\nFound ${violations.length} site-specific token reference(s) in portable registry source:\n`);
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}  [${v.token}]`);
      console.error(`    ${v.text}`);
    }
    console.error(
      "\nThese tokens only exist in apps/site's globals.css and will silently do nothing " +
        "(no background, no shadow) in any consumer project that installs this component via the CLI. " +
        "Use a standard shadcn-convention token or a plain Tailwind utility instead.\n",
    );
    process.exit(1);
  }

  console.log(`Checked ${files.length} registry component file(s) — no site-specific token leaks.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
