import { init } from "./commands/init.js";
import { add } from "./commands/add.js";
import { list } from "./commands/list.js";

const HELP = `dsgn — install design-system components as source, into your own project

Usage:
  dsgn init                     Create dsgn.config.json in the current project
  dsgn add <component...>       Copy one or more components into your project
  dsgn list                     Show every component available in the registry

Options:
  --registry <url-or-path>      Registry to read from (default: ${`https://design.dhruvchoudhary.com/r`})
  --overwrite                   Replace files that already exist (default: skip them)
  --skip-install                Don't run the package manager after copying files
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
