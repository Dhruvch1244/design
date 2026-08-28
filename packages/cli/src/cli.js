import { init } from "./commands/init.js";
import { add } from "./commands/add.js";
import { list } from "./commands/list.js";
import { diff } from "./commands/diff.js";
import { update } from "./commands/update.js";
import { doctor } from "./commands/doctor.js";
import { snippets } from "./commands/snippets.js";
import { skill } from "./commands/skill.js";

const HELP = `dsgn — install design-system components as source, into your own project

Usage:
  npx @dhruvchoudhary/dsgn init                 Create dsgn.config.json in the current project
  npx @dhruvchoudhary/dsgn add <component...>   Copy one or more components into your project
  npx @dhruvchoudhary/dsgn add recipe:<name>    Copy a composed multi-component pattern (e.g. recipe:auth-form)
  npx @dhruvchoudhary/dsgn list                 Show every component available in the registry
  npx @dhruvchoudhary/dsgn diff <component...>  Show how an installed component differs from the registry
  npx @dhruvchoudhary/dsgn update <component...> Pull the current registry version into your project
  npx @dhruvchoudhary/dsgn doctor               Health-check installed files (missing, modified, a11y)
  npx @dhruvchoudhary/dsgn snippets             Add VS Code snippets for every registry component
  npx @dhruvchoudhary/dsgn skill --global       Install the dsgn Agent Skill for Claude Code, every project
  npx @dhruvchoudhary/dsgn skill --project      Install the dsgn Agent Skill for this project only

Options:
  --registry <url-or-path>      Registry to read from (default: ${`https://design.dhruvchoudhary.com/r`})
  --overwrite                   Replace files that already exist (add/skill, default: skip them)
  --skip-install                Don't run the package manager after copying files (add only)
  --force                       Overwrite locally-modified files (update only, default: skip them)
  --global                      Install to ~/.claude/skills/dsgn (skill only)
  --project                     Install to ./.claude/skills/dsgn (skill only)
  -h, --help                    Show this help
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
    } else if (arg === "-h" || arg === "--help") {
      args.flags.help = true;
    } else {
      args._.push(arg);
    }
  }
  return args;
}

export async function run(argv) {
  const { _: positional, flags } = parseArgs(argv);
  const [command, ...rest] = positional;
  const cwd = process.cwd();

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
