import { createRequire } from "node:module";
import { init } from "./commands/init.js";
import { add } from "./commands/add.js";
import { list } from "./commands/list.js";
import { diff } from "./commands/diff.js";
import { update } from "./commands/update.js";
import { doctor } from "./commands/doctor.js";
import { snippets } from "./commands/snippets.js";
import { skill } from "./commands/skill.js";

const require = createRequire(import.meta.url);
const { version: PACKAGE_VERSION } = require("../package.json");

const HELP = `dsgn — install design-system components as source, into your own project

Usage:
  npx @dhruvchoudhary/dsgn init                 Create dsgn.config.json in the current project
  npx @dhruvchoudhary/dsgn add <component...>   Copy one or more components into your project
  npx @dhruvchoudhary/dsgn add recipe:<name>    Copy a composed multi-component pattern (e.g. recipe:auth-form)
  npx @dhruvchoudhary/dsgn list                 Show every component available in the registry
  npx @dhruvchoudhary/dsgn list --recipes       Show every composed recipe available in the registry
  npx @dhruvchoudhary/dsgn list --json          Same data as machine-readable JSON (combine with --recipes)
  npx @dhruvchoudhary/dsgn diff <component...>  Show how an installed component differs from the registry
  npx @dhruvchoudhary/dsgn update <component...> Pull the current registry version into your project
  npx @dhruvchoudhary/dsgn doctor               Health-check installed files (missing, modified, a11y)
  npx @dhruvchoudhary/dsgn snippets             Add VS Code snippets for every registry component
  npx @dhruvchoudhary/dsgn skill --global         Claude Code Agent Skill, every project (~/.claude/skills/dsgn)
  npx @dhruvchoudhary/dsgn skill --project        Claude Code Agent Skill, this project only (./.claude/skills/dsgn)
  npx @dhruvchoudhary/dsgn skill --cursor         Cursor rules, this project (./.cursor/rules/dsgn/) — no Cursor global exists
  npx @dhruvchoudhary/dsgn skill --windsurf       Windsurf rules, this project (./.windsurf/rules/dsgn-*.md)
  npx @dhruvchoudhary/dsgn skill --windsurf-global  Windsurf rules, every workspace (condensed, ~/.windsurf/global_rules.md)
  npx @dhruvchoudhary/dsgn skill --copilot        GitHub Copilot instructions, this repo (./.github/...)
  npx @dhruvchoudhary/dsgn skill --gemini         Gemini CLI context, this project (./GEMINI.md + ./.gemini/dsgn/)
  npx @dhruvchoudhary/dsgn skill --gemini-global  Gemini CLI context, every project (~/.gemini/GEMINI.md + ~/.gemini/dsgn/)
  npx @dhruvchoudhary/dsgn skill --agents-md      Flattened skill doc, this project (./AGENTS.md — Codex CLI, Amp, ...)
  npx @dhruvchoudhary/dsgn skill --project --agents-md  Both, bridged: CLAUDE.md gets an @AGENTS.md import so Claude Code reads it too
  npx @dhruvchoudhary/dsgn skill --adopt          dsgn-adopt Agent Skill, this project (./.claude/skills/dsgn-adopt) — extracts an existing codebase's own conventions
  npx @dhruvchoudhary/dsgn skill --adopt-global   dsgn-adopt Agent Skill, every project (~/.claude/skills/dsgn-adopt)

Options:
  --registry <url-or-path>      Registry to read from (default: ${`https://design.dhruvchoudhary.com/r`})
  --overwrite                   Replace files that already exist (add/skill, default: skip them)
  --skip-install                Don't run the package manager after copying files (add only)
  --force                       Overwrite locally-modified files (update only, default: skip them)
  --global                      Claude Code, every project (skill only)
  --project                     Claude Code, this project (skill only)
  --cursor                      Cursor, this project — Cursor has no file-based global rules (skill only)
  --windsurf                    Windsurf, this project (skill only)
  --windsurf-global              Windsurf, every workspace — condensed, 6,000-char format cap (skill only)
  --copilot                     GitHub Copilot, this repo — no cross-editor global exists (skill only)
  --gemini                      Gemini CLI, this project (skill only)
  --gemini-global                Gemini CLI, every project (skill only)
  --agents-md                   Plain AGENTS.md, this project (skill only)
  --adopt                       dsgn-adopt Skill, this project — extracts an existing codebase's conventions (skill only)
  --adopt-global                dsgn-adopt Skill, every project (skill only)
  --recipes                     Show recipes instead of components (list only)
  --json                        Machine-readable output (list only)
  -h, --help                    Show this help
  -v, --version                 Show the installed CLI version
`;

function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--registry") {
      args.flags.registry = argv[++i];
    } else if (arg === "--overwrite") {
      args.flags.overwrite = true;
    } else if (arg === "--skip-install") {
      args.flags.skipInstall = true;
    } else if (arg === "--force") {
      args.flags.force = true;
    } else if (arg === "--global") {
      args.flags.global = true;
    } else if (arg === "--project") {
      args.flags.project = true;
    } else if (arg === "--agents-md") {
      args.flags.agentsMd = true;
    } else if (arg === "--cursor") {
      args.flags.cursor = true;
    } else if (arg === "--windsurf") {
      args.flags.windsurf = true;
    } else if (arg === "--windsurf-global") {
      args.flags.windsurfGlobal = true;
    } else if (arg === "--copilot") {
      args.flags.copilot = true;
    } else if (arg === "--gemini") {
      args.flags.gemini = true;
    } else if (arg === "--gemini-global") {
      args.flags.geminiGlobal = true;
    } else if (arg === "--adopt") {
      args.flags.adopt = true;
    } else if (arg === "--adopt-global") {
      args.flags.adoptGlobal = true;
    } else if (arg === "--recipes") {
      args.flags.recipes = true;
    } else if (arg === "--json") {
      args.flags.json = true;
    } else if (arg === "-h" || arg === "--help") {
      args.flags.help = true;
    } else if (arg === "-v" || arg === "--version") {
      args.flags.version = true;
    } else if (arg.startsWith("-") && arg !== "-") {
      // An unrecognized flag used to fall through to positional args, so
      // e.g. `dsgn add badge --yes` treated "--yes" as a component name and
      // failed with a confusing registry 404 for "--yes.json" instead of a
      // clear unknown-option error. Caught while dogfooding a showcase
      // build — reproduced directly against this CLI, not just reported.
      throw new Error(`Unknown option: ${arg}`);
    } else {
      args._.push(arg);
    }
  }
  return args;
}

export async function run(argv) {
  let positional, flags;
  try {
    ({ _: positional, flags } = parseArgs(argv));
  } catch (err) {
    console.error(`\ndsgn: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  const [command, ...rest] = positional;
  const cwd = process.cwd();

  if (flags.version) {
    console.log(PACKAGE_VERSION);
    return;
  }

  if (flags.help || !command) {
    console.log(HELP);
    return;
  }

  try {
    switch (command) {
      case "init":
        await init(cwd);
        break;
      case "add":
        await add(cwd, rest, flags);
        break;
      case "list":
        await list(flags);
        break;
      case "diff":
        await diff(cwd, rest, flags);
        break;
      case "update":
        await update(cwd, rest, flags);
        break;
      case "doctor":
        await doctor(cwd);
        break;
      case "snippets":
        await snippets(cwd);
        break;
      case "skill":
        await skill(cwd, flags);
        break;
      default:
        console.error(`Unknown command: ${command}\n`);
        console.log(HELP);
        process.exitCode = 1;
    }
  } catch (err) {
    console.error(`\ndsgn: ${err.message}`);
    process.exitCode = 1;
  }
}
