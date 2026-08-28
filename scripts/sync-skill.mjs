#!/usr/bin/env node
// Copies skills/dsgn (the real, single source of truth — also what /skill
// on the site presents and zips) into packages/cli/skill/dsgn, so the CLI
// can bundle it into the published npm tarball and install it with zero
// network dependency beyond `npm install` itself. Run before publish so the
// bundled copy is never stale relative to skills/dsgn.
import { cp, rm, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(repoRoot, "skills", "dsgn");
const dest = join(repoRoot, "packages", "cli", "skill", "dsgn");

await rm(dest, { recursive: true, force: true });
await mkdir(dirname(dest), { recursive: true });
await cp(source, dest, { recursive: true });

console.log(`Synced skill into ${dest}`);
