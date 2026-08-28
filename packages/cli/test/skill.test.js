import test from "node:test";
import assert from "node:assert/strict";
import { access, readdir } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { skill } from "../src/commands/skill.js";
import { makeSandbox } from "./helpers.js";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bundledSkillDir = path.join(packageRoot, "skill", "dsgn");
const repoRoot = path.dirname(path.dirname(packageRoot));

// The bundled copy is gitignored (regenerated from skills/dsgn by
// scripts/sync-skill.mjs before publish) — a fresh checkout won't have it
// yet, so make sure it exists before these tests rely on it, the same way
// prepublishOnly does for a real publish.
test.before(async () => {
  try {
    await access(bundledSkillDir);
  } catch {
    execSync("node scripts/sync-skill.mjs", { cwd: repoRoot, stdio: "inherit" });
  }
});

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

test("skill: requires exactly one of --global or --project", async () => {
  await assert.rejects(() => skill("/irrelevant", {}), /Specify --global.*or --project/s);
});

test("skill: rejects both --global and --project together", async () => {
  await assert.rejects(() => skill("/irrelevant", { global: true, project: true }), /only one of --global or --project/);
});

test("skill: --project installs the real bundled files into ./.claude/skills/dsgn", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { project: true });

  const target = path.join(dir, ".claude", "skills", "dsgn");
  assert.ok(await exists(path.join(target, "SKILL.md")));
  assert.ok(await exists(path.join(target, "agents", "glass-dark-cyan.md")));
  assert.ok(await exists(path.join(target, "reference", "tokens.md")));

  const bundledFiles = await countFiles(bundledSkillDir);
  const installedFiles = await countFiles(target);
  assert.equal(installedFiles, bundledFiles, "every bundled file should have been copied");
});

test("skill: --project does not overwrite an existing install without --overwrite", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { project: true });
  const originalExitCode = process.exitCode;

  await skill(dir, { project: true });
  assert.equal(process.exitCode, 1, "second install without --overwrite should fail");
  process.exitCode = originalExitCode;
});

test("skill: --overwrite replaces an existing install", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { project: true });
  // Should not throw or set a failing exit code the second time.
  const before = process.exitCode;
  await skill(dir, { project: true, overwrite: true });
  assert.equal(process.exitCode, before);
});

test("skill: --global installs to the resolved home directory", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  // os.homedir() reads USERPROFILE on win32, HOME on POSIX — override
  // whichever this platform actually uses, restore after.
  const isWin = process.platform === "win32";
  const envVar = isWin ? "USERPROFILE" : "HOME";
  const original = process.env[envVar];
  process.env[envVar] = dir;
  t.after(() => {
    if (original === undefined) delete process.env[envVar];
    else process.env[envVar] = original;
  });

  await skill(dir, { global: true });

  assert.ok(await exists(path.join(dir, ".claude", "skills", "dsgn", "SKILL.md")));
});

async function countFiles(dir) {
  let count = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) count += await countFiles(path.join(dir, entry.name));
    else count++;
  }
  return count;
}
