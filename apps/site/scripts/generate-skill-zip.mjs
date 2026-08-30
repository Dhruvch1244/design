// Zips skills/dsgn/ into public/downloads/dsgn-skill.zip so /skill can offer
// a real one-click download alongside the degit/git install commands — not
// everyone has a terminal handy. The archive's top-level folder is "dsgn"
// so unzipping it and dropping the result straight into ~/.claude/skills/
// (or a project's .claude/skills/) just works, matching the install
// commands' own destination path.
import { createWriteStream, mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ZipArchive } from "archiver";

const siteDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillDir = path.join(siteDir, "../../skills/dsgn");
const outDir = path.join(siteDir, "public/downloads");
const outPath = path.join(outDir, "dsgn-skill.zip");

mkdirSync(outDir, { recursive: true });

const output = createWriteStream(outPath);
const archive = new ZipArchive({ zlib: { level: 9 } });

await new Promise((resolve, reject) => {
  output.on("close", resolve);
  archive.on("error", reject);
  archive.pipe(output);
  archive.directory(skillDir, "dsgn");
  archive.finalize();
});

const { size } = statSync(outPath);
console.log(`Wrote ${outPath} (${(size / 1024).toFixed(1)} KB)`);
