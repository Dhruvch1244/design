import { cp, access, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolved relative to this module's own location, not process.cwd() — the
// skill ships bundled inside the published package (packages/cli/skill/),
// synced from the real source at skills/dsgn/ by scripts/sync-skill.mjs
// before publish. Bundling it (rather than fetching over the network at
// install time) means `dsgn skill` works offline and never depends on the
// deployed site being reachable.
const packageRoot = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const SOURCE = path.join(packageRoot, "skill", "dsgn");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function skill(cwd, { global: isGlobal, project: isProject, overwrite } = {}) {
  if (!isGlobal && !isProject) {
    throw new Error(
      "Specify --global (installs to ~/.claude/skills/dsgn, every project) " +
        "or --project (installs to ./.claude/skills/dsgn, this project only).",
    );
  }
  if (isGlobal && isProject) {
    throw new Error("Pass only one of --global or --project, not both.");
  }

  const targetDir = isGlobal
    ? path.join(os.homedir(), ".claude", "skills", "dsgn")
    : path.join(cwd, ".claude", "skills", "dsgn");

  if (!overwrite && (await exists(targetDir))) {
    console.error(`${targetDir} already exists — pass --overwrite to replace it.`);
    process.exitCode = 1;
    return;
  }

  await mkdir(path.dirname(targetDir), { recursive: true });
  await cp(SOURCE, targetDir, { recursive: true, force: true });

  console.log(`Installed the dsgn Agent Skill to ${targetDir}`);
  console.log("Claude Code picks it up automatically next session — nothing else to configure.");
}
