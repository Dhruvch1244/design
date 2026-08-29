import test from "node:test";
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { skill } from "../src/commands/skill.js";
import { makeSandbox } from "./helpers.js";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bundledSkillDir = path.join(packageRoot, "skill", "dsgn");
const bundledFlatDoc = path.join(packageRoot, "skill", "flat", "dsgn.md");
const repoRoot = path.dirname(path.dirname(packageRoot));

// Both bundled copies are gitignored (regenerated from skills/dsgn by
// scripts/sync-skill.mjs before publish) — a fresh checkout won't have them
// yet, so make sure they exist before these tests rely on them, the same way
// prepublishOnly does for a real publish.
test.before(async () => {
  try {
    await access(bundledSkillDir);
    await access(bundledFlatDoc);
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

test("skill: requires a target flag", async () => {
  await assert.rejects(() => skill("/irrelevant", {}), /Specify a target: --global or --project/);
});

test("skill: rejects two targets passed together", async () => {
  await assert.rejects(() => skill("/irrelevant", { global: true, project: true }), /Pass only one target at a time/);
});

test("skill: rejects a Claude target combined with a flat-doc target", async () => {
  await assert.rejects(() => skill("/irrelevant", { global: true, cursor: true }), /--global and --cursor/);
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

test("skill: --agents-md writes the flattened doc to ./AGENTS.md", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { agentsMd: true });

  const target = path.join(dir, "AGENTS.md");
  const content = await readFile(target, "utf8");
  assert.match(content, /# dsgn — design-philosophy-driven UI builder/);
  assert.match(content, /### Glass \/ Dark-Cyan/);
  assert.match(content, /### Philosophy summary/);
});

test("skill: --cursor writes a Cursor rule with MDC frontmatter", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { cursor: true });

  const target = path.join(dir, ".cursor", "rules", "dsgn.mdc");
  const content = await readFile(target, "utf8");
  assert.match(content, /^---\ndescription: /);
  assert.match(content, /alwaysApply: false/);
  assert.match(content, /# dsgn — design-philosophy-driven UI builder/);
});

test("skill: --windsurf writes to .windsurf/rules/dsgn.md", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { windsurf: true });

  const target = path.join(dir, ".windsurf", "rules", "dsgn.md");
  assert.ok(await exists(target));
});

test("skill: --copilot writes to .github/copilot-instructions.md", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { copilot: true });

  const target = path.join(dir, ".github", "copilot-instructions.md");
  assert.ok(await exists(target));
});

test("skill: --gemini writes to ./GEMINI.md", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { gemini: true });

  assert.ok(await exists(path.join(dir, "GEMINI.md")));
});

test("skill: flat-doc targets are non-destructive by default, --overwrite replaces them", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { gemini: true });
  const originalExitCode = process.exitCode;

  await skill(dir, { gemini: true });
  assert.equal(process.exitCode, 1, "second install without --overwrite should fail");
  process.exitCode = originalExitCode;

  const before = process.exitCode;
  await skill(dir, { gemini: true, overwrite: true });
  assert.equal(process.exitCode, before);
});

async function countFiles(dir) {
  let count = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) count += await countFiles(path.join(dir, entry.name));
    else count++;
  }
  return count;
}
