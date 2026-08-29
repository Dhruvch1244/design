import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { skill } from "../src/commands/skill.js";
import { makeSandbox } from "./helpers.js";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bundledSkillDir = path.join(packageRoot, "skill", "dsgn");
const bundledFlatDoc = path.join(packageRoot, "skill", "flat", "dsgn.md");
const bundledCursorDir = path.join(packageRoot, "skill", "cursor");
const bundledWindsurfDir = path.join(packageRoot, "skill", "windsurf");
const bundledCopilotDir = path.join(packageRoot, "skill", "copilot");
const bundledGeminiDir = path.join(packageRoot, "skill", "gemini");
const repoRoot = path.dirname(path.dirname(packageRoot));

// Every bundled form is gitignored (regenerated from skills/dsgn by
// scripts/sync-skill.mjs before publish) — a fresh checkout won't have them
// yet, so make sure they exist before these tests rely on them, the same way
// prepublishOnly does for a real publish.
test.before(async () => {
  try {
    await access(bundledSkillDir);
    await access(bundledFlatDoc);
    await access(bundledCursorDir);
    await access(bundledWindsurfDir);
    await access(bundledCopilotDir);
    await access(bundledGeminiDir);
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

async function withHome(dir, fn) {
  const isWin = process.platform === "win32";
  const envVar = isWin ? "USERPROFILE" : "HOME";
  const original = process.env[envVar];
  process.env[envVar] = dir;
  try {
    await fn();
  } finally {
    if (original === undefined) delete process.env[envVar];
    else process.env[envVar] = original;
  }
}

async function countFiles(dir) {
  let count = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) count += await countFiles(path.join(dir, entry.name));
    else count++;
  }
  return count;
}

// --- argument validation ----------------------------------------------------

test("skill: requires a target flag", async () => {
  await assert.rejects(() => skill("/irrelevant", {}), /Specify a target: --global or --project/);
});

test("skill: rejects two targets passed together", async () => {
  await assert.rejects(() => skill("/irrelevant", { global: true, project: true }), /Pass only one target at a time/);
});

test("skill: rejects a Claude target combined with another tool's target", async () => {
  await assert.rejects(() => skill("/irrelevant", { global: true, cursor: true }), /--global and --cursor/);
});

// --- Claude Code -------------------------------------------------------------

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
  const before = process.exitCode;
  await skill(dir, { project: true, overwrite: true });
  assert.equal(process.exitCode, before);
});

test("skill: --global installs to the resolved home directory", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await withHome(dir, async () => {
    await skill(dir, { global: true });
    assert.ok(await exists(path.join(dir, ".claude", "skills", "dsgn", "SKILL.md")));
  });
});

// --- AGENTS.md ---------------------------------------------------------------

test("skill: --agents-md writes the flattened doc to ./AGENTS.md", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { agentsMd: true });

  const content = await readFile(path.join(dir, "AGENTS.md"), "utf8");
  assert.match(content, /# dsgn — design-philosophy-driven UI builder/);
  assert.match(content, /### Glass \/ Dark-Cyan/);
  assert.match(content, /### Philosophy summary/);
});

// --- Cursor --------------------------------------------------------------

test("skill: --cursor installs router.mdc + agents/*.mdc + reference/*.mdc as real sibling files", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { cursor: true });

  const target = path.join(dir, ".cursor", "rules", "dsgn");
  const router = await readFile(path.join(target, "router.mdc"), "utf8");
  assert.match(router, /^---\ndescription: /);
  assert.match(router, /alwaysApply: false/);
  assert.match(router, /# dsgn — design-philosophy-driven UI builder/);
  // The router's own prose must point at real .mdc siblings, not stale .md paths.
  assert.match(router, /agents\/glass-dark-cyan\.mdc/);
  assert.doesNotMatch(router, /agents\/glass-dark-cyan\.md[^c]/);

  const agent = await readFile(path.join(target, "agents", "glass-dark-cyan.mdc"), "utf8");
  assert.match(agent, /^---\ndescription: Dark OLED background/);

  const reference = await readFile(path.join(target, "reference", "tokens.mdc"), "utf8");
  assert.match(reference, /^---\ndescription: /);

  const bundledFiles = await countFiles(bundledCursorDir);
  const installedFiles = await countFiles(target);
  assert.equal(installedFiles, bundledFiles);
});

// --- Windsurf ------------------------------------------------------------

test("skill: --windsurf installs flat dsgn-*.md files into .windsurf/rules/", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { windsurf: true });

  const target = path.join(dir, ".windsurf", "rules");
  assert.ok(await exists(path.join(target, "dsgn-router.md")));
  assert.ok(await exists(path.join(target, "dsgn-glass-dark-cyan.md")));
  assert.ok(await exists(path.join(target, "dsgn-tokens.md")));

  const router = await readFile(path.join(target, "dsgn-router.md"), "utf8");
  assert.match(router, /dsgn-glass-dark-cyan\.md/);
  assert.doesNotMatch(router, /agents\//);
});

test("skill: --windsurf merges into an existing rules dir without touching unrelated files", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  const rulesDir = path.join(dir, ".windsurf", "rules");
  await mkdir(rulesDir, { recursive: true });
  await writeFile(path.join(rulesDir, "my-own-rule.md"), "# not dsgn's file", "utf8");

  await skill(dir, { windsurf: true });

  assert.ok(await exists(path.join(rulesDir, "dsgn-router.md")));
  assert.equal(await readFile(path.join(rulesDir, "my-own-rule.md"), "utf8"), "# not dsgn's file");
});

test("skill: --windsurf-global writes the condensed doc to ~/.windsurf/global_rules.md, under 6000 chars", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await withHome(dir, async () => {
    await skill(dir, { windsurfGlobal: true });
    const target = path.join(dir, ".windsurf", "global_rules.md");
    const content = await readFile(target, "utf8");
    assert.ok(Buffer.byteLength(content, "utf8") <= 6000, "must fit Windsurf's global_rules.md cap");
    assert.match(content, /dsgn/);
  });
});

// --- Copilot ---------------------------------------------------------------

test("skill: --copilot installs copilot-instructions.md + 5 instructions/dsgn-*.instructions.md", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { copilot: true });

  const main = await readFile(path.join(dir, ".github", "copilot-instructions.md"), "utf8");
  assert.match(main, /# dsgn — design-philosophy-driven UI builder/);
  assert.match(main, /## Reference/);
  assert.doesNotMatch(main, /`reference\/[\w-]+\.md`/);

  const voice = await readFile(
    path.join(dir, ".github", "instructions", "dsgn-glass-dark-cyan.instructions.md"),
    "utf8",
  );
  assert.match(voice, /^---\napplyTo: /);

  const instructionsDir = path.join(dir, ".github", "instructions");
  const installed = await readdir(instructionsDir);
  assert.equal(installed.length, 5);
});

test("skill: --copilot merges into an existing .github/instructions dir without touching unrelated files", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  const instructionsDir = path.join(dir, ".github", "instructions");
  await mkdir(instructionsDir, { recursive: true });
  await writeFile(path.join(instructionsDir, "team-rules.instructions.md"), "# team rules", "utf8");

  await skill(dir, { copilot: true });

  assert.ok(await exists(path.join(instructionsDir, "dsgn-glass-dark-cyan.instructions.md")));
  assert.equal(await readFile(path.join(instructionsDir, "team-rules.instructions.md"), "utf8"), "# team rules");
});

// --- Gemini ------------------------------------------------------------------

test("skill: --gemini installs GEMINI.md + .gemini/dsgn/{agents,reference}", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await skill(dir, { gemini: true });

  const root = await readFile(path.join(dir, "GEMINI.md"), "utf8");
  assert.match(root, /@\.\/\.gemini\/dsgn\/agents\/glass-dark-cyan\.md/);
  assert.match(root, /@\.\/\.gemini\/dsgn\/reference\/tokens\.md/);

  assert.ok(await exists(path.join(dir, ".gemini", "dsgn", "agents", "glass-dark-cyan.md")));
  assert.ok(await exists(path.join(dir, ".gemini", "dsgn", "reference", "tokens.md")));
});

test("skill: --gemini-global installs ~/.gemini/GEMINI.md + ~/.gemini/dsgn with absolute-style import prefix", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  await withHome(dir, async () => {
    await skill(dir, { geminiGlobal: true });

    const root = await readFile(path.join(dir, ".gemini", "GEMINI.md"), "utf8");
    assert.match(root, /@\.\/dsgn\/agents\/glass-dark-cyan\.md/);
    assert.doesNotMatch(root, /@\.\/\.gemini\/dsgn/);

    assert.ok(await exists(path.join(dir, ".gemini", "dsgn", "agents", "glass-dark-cyan.md")));
  });
});

// --- shared non-destructive behavior -----------------------------------------

test("skill: multi-step targets are non-destructive by default, --overwrite replaces them", async (t) => {
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

test("skill: a multi-step target aborts without writing anything if any step conflicts", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);

  // Pre-create only the data directory, not the root file — install must
  // still refuse (and must not partially apply) without --overwrite.
  await mkdir(path.join(dir, ".gemini", "dsgn"), { recursive: true });

  await skill(dir, { gemini: true });
  assert.equal(process.exitCode, 1);
  process.exitCode = undefined;
  assert.ok(!(await exists(path.join(dir, "GEMINI.md"))), "root file should not be written when a sibling step conflicts");
});
