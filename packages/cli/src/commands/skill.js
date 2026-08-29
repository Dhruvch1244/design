import { cp, access, mkdir, readFile, writeFile } from "node:fs/promises";
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
const CLAUDE_SOURCE = path.join(packageRoot, "skill", "dsgn");
const FLAT_SOURCE = path.join(packageRoot, "skill", "flat", "dsgn.md");

// Cursor's .mdc rules format supports YAML frontmatter with `description`
// (used for "agent requested" auto-attachment, the same role SKILL.md's own
// `description` field plays for Claude Code) and `alwaysApply`. Windsurf,
// Copilot, Gemini, and plain AGENTS.md all just read raw markdown with no
// required frontmatter, so the flat doc is installed as-is for those.
const CURSOR_FRONTMATTER = `---
description: Build UI with the real @dhruvchoudhary/dsgn component registry and the dhruvch1244/design philosophy, in one of five distinct visual voices, routed automatically by project context or explicit request.
alwaysApply: false
---

`;

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function installDir(source, target, overwrite) {
  if (!overwrite && (await exists(target))) return false;
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true, force: true });
  return true;
}

async function installFile(content, target, overwrite) {
  if (!overwrite && (await exists(target))) return false;
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
  return true;
}

async function flatContent() {
  return readFile(FLAT_SOURCE, "utf8");
}

// Every install target `dsgn skill` supports, keyed by the flag that
// selects it. Exactly one must be passed per invocation. Claude Code gets
// the real multi-file skill (router + 5 sub-agent personas + reference
// docs, dispatched via a Task/Agent-style tool); every other tool gets
// `skill/flat/dsgn.md` — the same content flattened into one file, since
// none of them support Claude Code's sub-agent dispatch mechanism (see
// scripts/sync-skill.mjs for how that flattening happens).
const TARGETS = {
  global: {
    flag: "--global",
    resolveTarget: () => path.join(os.homedir(), ".claude", "skills", "dsgn"),
    install: (target, overwrite) => installDir(CLAUDE_SOURCE, target, overwrite),
    hint: "Claude Code picks it up automatically next session — nothing else to configure.",
  },
  project: {
    flag: "--project",
    resolveTarget: (cwd) => path.join(cwd, ".claude", "skills", "dsgn"),
    install: (target, overwrite) => installDir(CLAUDE_SOURCE, target, overwrite),
    hint: "Claude Code picks it up automatically next session — nothing else to configure.",
  },
  agentsMd: {
    flag: "--agents-md",
    resolveTarget: (cwd) => path.join(cwd, "AGENTS.md"),
    install: async (target, overwrite) => installFile(await flatContent(), target, overwrite),
    hint: "Read natively by Codex CLI, Amp, Cursor, and other AGENTS.md-aware tools — nothing else to configure.",
  },
  cursor: {
    flag: "--cursor",
    resolveTarget: (cwd) => path.join(cwd, ".cursor", "rules", "dsgn.mdc"),
    install: async (target, overwrite) => installFile(CURSOR_FRONTMATTER + (await flatContent()), target, overwrite),
    hint: "Cursor picks it up automatically as an agent-requested rule — nothing else to configure.",
  },
  windsurf: {
    flag: "--windsurf",
    resolveTarget: (cwd) => path.join(cwd, ".windsurf", "rules", "dsgn.md"),
    install: async (target, overwrite) => installFile(await flatContent(), target, overwrite),
    hint: "Windsurf picks it up automatically from .windsurf/rules — nothing else to configure.",
  },
  copilot: {
    flag: "--copilot",
    resolveTarget: (cwd) => path.join(cwd, ".github", "copilot-instructions.md"),
    install: async (target, overwrite) => installFile(await flatContent(), target, overwrite),
    hint: "GitHub Copilot reads this repo-wide automatically — nothing else to configure.",
  },
  gemini: {
    flag: "--gemini",
    resolveTarget: (cwd) => path.join(cwd, "GEMINI.md"),
    install: async (target, overwrite) => installFile(await flatContent(), target, overwrite),
    hint: "Read natively by the Gemini CLI / Gemini Code Assist — nothing else to configure.",
  },
};

export async function skill(cwd, flags = {}) {
  const requested = Object.keys(TARGETS).filter((key) => flags[key]);

  if (requested.length === 0) {
    throw new Error(
      "Specify a target: --global or --project for Claude Code, or one of " +
        "--agents-md, --cursor, --windsurf, --copilot, --gemini for other AI tools.",
    );
  }
  if (requested.length > 1) {
    throw new Error(
      `Pass only one target at a time, not ${requested.map((key) => TARGETS[key].flag).join(" and ")}.`,
    );
  }

  const target = TARGETS[requested[0]];
  const targetPath = target.resolveTarget(cwd);

  if (!(await target.install(targetPath, flags.overwrite))) {
    console.error(`${targetPath} already exists — pass --overwrite to replace it.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Installed the dsgn Agent Skill to ${targetPath}`);
  console.log(target.hint);
}
