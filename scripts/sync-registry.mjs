#!/usr/bin/env node
// Builds packages/registry/registry.json into self-contained JSON items and
// copies them into apps/site/public/r, so Next.js serves them as plain
// static files at /r/<name>.json — no API route needed. This is what makes
// `npx dsgn add button` work against the deployed site by default: the CLI's
// DEFAULT_REGISTRY points at https://design.dhruvchoudhary.com/r, which is
// exactly this directory once apps/site is deployed.
//
// apps/site's own predev/prebuild scripts call this automatically, so
// public/r is never stale relative to packages/registry/src. Run it by hand
// only if you want the JSON regenerated without also starting/building the
// site.
import { execSync } from "node:child_process";
import { cp, rm, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const registryDist = join(repoRoot, "packages", "registry", "dist", "r");
const sitePublicR = join(repoRoot, "apps", "site", "public", "r");

execSync("npm run build:registry --workspace @dsgn/registry", {
  cwd: repoRoot,
  stdio: "inherit",
});

await rm(sitePublicR, { recursive: true, force: true });
await mkdir(dirname(sitePublicR), { recursive: true });
await cp(registryDist, sitePublicR, { recursive: true });

console.log(`Synced registry into ${sitePublicR}`);
