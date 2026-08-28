// Writes a shields.io endpoint-badge JSON (https://img.shields.io/endpoint?url=...)
// from the real registry item count, so the badge shown on the site and
// embeddable in other people's READMEs can never drift from the actual
// component count the way a hardcoded number already did once on this site
// (see apps/site/app/examples/page.tsx's STATS fix).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const siteDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const registryPath = path.join(siteDir, "../../packages/registry/registry.json");
const outPath = path.join(siteDir, "public/badge-data.json");

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const uiCount = registry.items.filter((item) => item.type === "registry:ui").length;

const badge = {
  schemaVersion: 1,
  label: "dsgn components",
  message: String(uiCount),
  color: "22d3ee",
};

writeFileSync(outPath, JSON.stringify(badge));
console.log(`Wrote ${outPath} (message: "${badge.message}")`);
