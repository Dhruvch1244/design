import { cp, access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
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
const bundled = (...segments) => path.join(packageRoot, "skill", ...segments);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

// A "step" is one file or directory that has to land for a target to be
// considered installed. Every step exposes `conflict()` (the path that
// already exists, or null) so a multi-step target (a root file plus a data
// directory, e.g. Copilot/Gemini) can be checked for conflicts across all
// its steps *before* writing any of them — an install should never
// half-apply.

// The whole `source` directory becomes `target` — used for a namespace this
// skill exclusively owns (Claude's own skills/dsgn, Cursor's rules/dsgn,
// Gemini's .gemini/dsgn data folder), so "target already exists" is a clean
// single conflict check.
function dirStep(source, target) {
  return {
    conflict: async () => ((await exists(target)) ? target : null),
    apply: async () => {
      await mkdir(path.dirname(target), { recursive: true });
      await cp(source, target, { recursive: true, force: true });
    },
  };
}

// A single file copy, for a target that is one real file (AGENTS.md,
// GEMINI.md, copilot-instructions.md, Windsurf's global_rules.md).
function fileStep(source, target) {
  return {
    conflict: async () => ((await exists(target)) ? target : null),
    apply: async () => {
      await mkdir(path.dirname(target), { recursive: true });
      await cp(source, target, { force: true });
    },
  };
}

// Copies each entry of `sourceDir` into `targetDir` individually, checking
// each for conflicts rather than the directory as a whole — for a shared
// directory another tool/team member may already have unrelated files in
// (Windsurf's .windsurf/rules/, Copilot's .github/instructions/), so
// installing here must never disturb anything not named dsgn-*.
function dirMergeStep(sourceDir, targetDir) {
  return {
    conflict: async () => {
      for (const entry of await readdir(sourceDir)) {
        const target = path.join(targetDir, entry);
        if (await exists(target)) return target;
      }
      return null;
    },
    apply: async () => {
      await mkdir(targetDir, { recursive: true });
      for (const entry of await readdir(sourceDir)) {
        await cp(path.join(sourceDir, entry), path.join(targetDir, entry), { recursive: true, force: true });
      }
    },
  };
}

// Ensures CLAUDE.md starts with an `@AGENTS.md` import instead of writing a
// second, competing copy of the philosophy — the same bridge this repo's own
// apps/site/CLAUDE.md already uses. Never destructive: if CLAUDE.md doesn't
// exist yet it's created with just the import line; if it exists and already
// has the import, apply() is a no-op; otherwise the import is prepended
// above whatever's already there, so nothing a user wrote is lost. Because
// it never overwrites, this step has no real conflict state — `conflict()`
// always returns null, unlike fileStep/dirStep/dirMergeStep above.
function claudeMdImportStep(cwd) {
  const target = path.join(cwd, "CLAUDE.md");
  return {
    conflict: async () => null,
    apply: async () => {
      const existing = (await exists(target)) ? await readFile(target, "utf8") : "";
      if (existing.includes("@AGENTS.md")) return;
      const body = existing.trim().length > 0 ? `@AGENTS.md\n\n${existing}` : "@AGENTS.md\n";
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, body);
    },
  };
}

// Every install target `dsgn skill` supports, keyed by the flag that
// selects it. Exactly one must be passed per invocation.
//
// Claude Code gets the real multi-file skill (router + 5 sub-agent
// personas + reference docs, dispatched via a Task/Agent-style tool).
// Cursor gets the closest real equivalent: router.mdc + agents/*.mdc +
// reference/*.mdc as genuine sibling files, each with its own `description`
// frontmatter Cursor reads to auto-attach the relevant one. Windsurf,
// Copilot, and Gemini all get real multi-file structure too, shaped around
// what each format actually supports (see scripts/sync-skill.mjs for the
// full reasoning per tool). AGENTS.md alone stays a single flattened file —
// that convention is genuinely single-file by design, not a shortcut.
//
// Deliberately not offered: a Cursor global target (Cursor's only global
// mechanism is its Settings UI, not a file) and a Copilot global target (no
// cross-editor file-based mechanism exists — only JetBrains has one, at an
// IDE-specific OS path, which isn't a fit for a generic installer).
const TARGETS = {
  global: {
    flag: "--global",
    steps: () => [dirStep(bundled("dsgn"), path.join(os.homedir(), ".claude", "skills", "dsgn"))],
    hint: "Claude Code picks it up automatically next session — nothing else to configure.",
  },
  project: {
    flag: "--project",
    steps: (cwd) => [dirStep(bundled("dsgn"), path.join(cwd, ".claude", "skills", "dsgn"))],
    hint: "Claude Code picks it up automatically next session — nothing else to configure.",
  },
  agentsMd: {
    flag: "--agents-md",
    steps: (cwd) => [fileStep(bundled("flat", "dsgn.md"), path.join(cwd, "AGENTS.md"))],
    hint: "Read natively by Codex CLI, Amp, Cursor, and other AGENTS.md-aware tools — nothing else to configure.",
  },
  cursor: {
    flag: "--cursor",
    steps: (cwd) => [dirStep(bundled("cursor"), path.join(cwd, ".cursor", "rules", "dsgn"))],
    hint: "Cursor reads each file's own description and auto-attaches the relevant one — nothing else to configure.",
  },
  windsurf: {
    flag: "--windsurf",
    steps: (cwd) => [dirMergeStep(bundled("windsurf", "project"), path.join(cwd, ".windsurf", "rules"))],
    hint: "Windsurf loads every .windsurf/rules/*.md file into Cascade automatically — nothing else to configure.",
  },
  windsurfGlobal: {
    flag: "--windsurf-global",
    steps: () => [fileStep(bundled("windsurf", "global", "global_rules.md"), path.join(os.homedir(), ".windsurf", "global_rules.md"))],
    hint:
      "Applies to every Windsurf workspace. This replaces the whole file — if you already keep " +
      "custom global rules there, merge by hand instead of using --overwrite. It's a condensed " +
      "summary (Windsurf caps this file at 6,000 characters); run --windsurf in a project for the full skill.",
  },
  copilot: {
    flag: "--copilot",
    steps: (cwd) => [
      fileStep(bundled("copilot", "copilot-instructions.md"), path.join(cwd, ".github", "copilot-instructions.md")),
      dirMergeStep(bundled("copilot", "instructions"), path.join(cwd, ".github", "instructions")),
    ],
    hint:
      "GitHub Copilot reads this repo-wide automatically. All 7 style-voice instruction files apply " +
      "together (Copilot has no description-based routing) — delete the ones you don't want.",
  },
  gemini: {
    flag: "--gemini",
    steps: (cwd) => [
      fileStep(bundled("gemini", "project-GEMINI.md"), path.join(cwd, "GEMINI.md")),
      dirStep(bundled("gemini", "dsgn"), path.join(cwd, ".gemini", "dsgn")),
    ],
    hint: "Read natively by the Gemini CLI / Gemini Code Assist for this project — nothing else to configure.",
  },
  geminiGlobal: {
    flag: "--gemini-global",
    steps: () => [
      fileStep(bundled("gemini", "global-GEMINI.md"), path.join(os.homedir(), ".gemini", "GEMINI.md")),
      dirStep(bundled("gemini", "dsgn"), path.join(os.homedir(), ".gemini", "dsgn")),
    ],
    hint:
      "Applies to every Gemini CLI project. Replaces ~/.gemini/GEMINI.md in full — merge by hand " +
      "instead of using --overwrite if you already keep other global instructions there.",
  },
};

// The one combination of targets that's actually a coherent single install
// rather than a mistake: Claude Code's own Skill format plus the AGENTS.md
// standard the rest of the industry (Codex CLI, Amp, Cursor, Gemini CLI,
// Jules, Aider, Zed, Windsurf, Devin, ...) converges on. Claude Code itself
// still doesn't read AGENTS.md natively, so without this bridge a project
// has to pick one — this installs both plus the CLAUDE.md import that makes
// Claude Code read the AGENTS.md content too. Global Claude installs are
// deliberately not offered a bridge: AGENTS.md is inherently per-repo, and
// mixing a home-directory skill with a cwd-scoped AGENTS.md would be a
// confused scope, not a real install target.
const BRIDGES = {
  "project+agentsMd": {
    keys: ["project", "agentsMd"],
    steps: (cwd) => [...TARGETS.project.steps(cwd), ...TARGETS.agentsMd.steps(cwd), claudeMdImportStep(cwd)],
    hint:
      "Claude Code picks up .claude/skills/dsgn automatically, and CLAUDE.md now starts with an " +
      "@AGENTS.md import — the same bridge this repo's own apps/site/CLAUDE.md uses — so the two " +
      "formats stay driven by one file instead of drifting apart. Other AGENTS.md-aware tools read " +
      "./AGENTS.md directly.",
  },
};

function findBridge(requestedKeys) {
  return Object.values(BRIDGES).find(
    (bridge) => bridge.keys.length === requestedKeys.length && bridge.keys.every((key) => requestedKeys.includes(key)),
  );
}

export async function skill(cwd, flags = {}) {
  const requested = Object.keys(TARGETS).filter((key) => flags[key]);

  if (requested.length === 0) {
    throw new Error(
      "Specify a target: --global or --project for Claude Code; --cursor; --windsurf or " +
        "--windsurf-global; --copilot; --gemini or --gemini-global; or --agents-md. " +
        "(--project --agents-md together installs the bridged combo.)",
    );
  }

  let steps;
  let hint;
  if (requested.length === 1) {
    const target = TARGETS[requested[0]];
    steps = target.steps(cwd);
    hint = target.hint;
  } else {
    const bridge = findBridge(requested);
    if (!bridge) {
      throw new Error(
        `Pass only one target at a time, not ${requested.map((key) => TARGETS[key].flag).join(" and ")}.`,
      );
    }
    steps = bridge.steps(cwd);
    hint = bridge.hint;
  }

  if (!flags.overwrite) {
    for (const step of steps) {
      const conflict = await step.conflict();
      if (conflict) {
        console.error(`${conflict} already exists — pass --overwrite to replace it.`);
        process.exitCode = 1;
        return;
      }
    }
  }

  for (const step of steps) {
    await step.apply();
  }

  console.log("Installed the dsgn Agent Skill.");
  console.log(hint);
}
