import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { readConfig, DEFAULT_CONFIG, detectPackageManager, installCommand } from "../config.js";
import { resolveItems, DEFAULT_REGISTRY } from "../registry.js";

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveTarget(config, target) {
  if (target.startsWith("components/dsgn/")) {
    return path.join(config.componentsDir, target.slice("components/dsgn/".length));
  }
  if (target.startsWith("lib/")) {
    return path.join(config.utilsDir, target.slice("lib/".length));
  }
  return target;
}

function rewriteAlias(content, config) {
  if (config.alias === DEFAULT_CONFIG.alias && config.utilsDir === DEFAULT_CONFIG.utilsDir) {
    return content;
  }
  return content.replace(/@\/lib\/utils/g, `${config.alias}/${config.utilsDir}/utils`);
}

function runInstall(cwd, packageManager, deps) {
  const command = installCommand(packageManager, deps);
  if (!command) return Promise.resolve();
  const [cmd, args] = command;
  console.log(`\nInstalling: ${cmd} ${args.join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`))));
    child.on("error", reject);
  });
}

export async function add(cwd, names, { registry, overwrite, skipInstall } = {}) {
  if (names.length === 0) {
    console.error("Usage: npx @dhruvchoudhary/dsgn add <component> [component...]");
    process.exitCode = 1;
    return;
  }

  const config = (await readConfig(cwd)) ?? DEFAULT_CONFIG;
  const registryBase = registry ?? process.env.DSGN_REGISTRY ?? DEFAULT_REGISTRY;

  const items = await resolveItems(registryBase, names);

  const written = [];
  const skipped = [];
  const npmDeps = new Set();

  for (const item of items) {
    for (const dep of item.dependencies ?? []) npmDeps.add(dep);

    for (const file of item.files) {
      const targetRelative = resolveTarget(config, file.target);
      const targetPath = path.join(cwd, targetRelative);

      if (!overwrite && (await exists(targetPath))) {
        skipped.push(targetRelative);
        continue;
      }

      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, rewriteAlias(file.content, config));
      written.push(targetRelative);
    }
  }

  if (written.length > 0) {
    console.log("Added:");
    for (const file of written) console.log(`  ${file}`);
  }
  if (skipped.length > 0) {
    console.log("\nSkipped (already exists — pass --overwrite to replace):");
    for (const file of skipped) console.log(`  ${file}`);
  }

  if (!skipInstall && npmDeps.size > 0) {
    const packageManager = await detectPackageManager(cwd);
    await runInstall(cwd, packageManager, [...npmDeps]);
  }

  console.log(`\nDone: ${items.map((i) => i.name).join(", ")}`);
}
