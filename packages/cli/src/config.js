import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const CONFIG_FILE = "dsgn.config.json";

export const DEFAULT_CONFIG = {
  $schema: "https://design.dhruvchoudhary.com/schema/config.json",
  componentsDir: "components/dsgn",
  utilsDir: "lib",
  alias: "@",
};

export async function readConfig(cwd) {
  try {
    const raw = await readFile(path.join(cwd, CONFIG_FILE), "utf8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

export async function writeConfig(cwd, config) {
  await writeFile(path.join(cwd, CONFIG_FILE), JSON.stringify(config, null, 2) + "\n");
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detected from the lockfile actually present, not assumed — a project that
 * committed pnpm-lock.yaml wants `pnpm add`, not npm silently creating a
 * second, conflicting lockfile next to it.
 */
export async function detectPackageManager(cwd) {
  if (await exists(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (await exists(path.join(cwd, "yarn.lock"))) return "yarn";
  if (await exists(path.join(cwd, "bun.lockb"))) return "bun";
  return "npm";
}

export function installCommand(packageManager, deps) {
  if (deps.length === 0) return null;
  switch (packageManager) {
    case "pnpm":
      return ["pnpm", ["add", ...deps]];
    case "yarn":
      return ["yarn", ["add", ...deps]];
    case "bun":
      return ["bun", ["add", ...deps]];
    default:
      return ["npm", ["install", ...deps]];
  }
}
