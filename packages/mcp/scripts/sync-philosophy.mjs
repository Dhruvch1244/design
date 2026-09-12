#!/usr/bin/env node
// Copies the monorepo's philosophy/*.md into packages/mcp/philosophy, so a
// published (npm-installed, outside this monorepo) copy of dsgn-mcp still
// has the docs to serve from get_philosophy — src/philosophy.js's
// findLocalPhilosophyDir() prefers the monorepo's own philosophy/ when
// running from inside a checkout, and only falls back to this bundled copy
// otherwise. Run via `npm run build:philosophy`, and automatically before
// `npm publish`/`npm pack` via the "prepack" script.
import { cp, rm, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(packageRoot));
const source = join(repoRoot, "philosophy");
const dest = join(packageRoot, "philosophy");

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
await cp(source, dest, { recursive: true, filter: (src) => !src.endsWith(".DS_Store") });

console.log(`Synced philosophy docs into ${dest}`);
