import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import spawn from "cross-spawn";
import { readConfig, writeConfig, DEFAULT_CONFIG, detectPackageManager, installCommand } from "../config.js";
import { resolveItems, DEFAULT_REGISTRY } from "../registry.js";
import { resolveTarget, rewriteAlias, hashContent, resolveItemName } from "../paths.js";

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function runInstall(cwd, packageManager, deps) {
  const command = installCommand(packageManager, deps);
  if (!command) return Promise.resolve();
  const [cmd, args] = command;
  console.log(`\nInstalling: ${cmd} ${args.join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
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

  const items = await resolveItems(registryBase, names.map(resolveItemName));

  const written = [];
  const skipped = [];
  const npmDeps = new Set();
  // Content hash recorded per installed file, so `dsgn diff`/`dsgn update`
  // can later tell "never touched since install" from "user edited this"
  // without needing to keep a full copy of every old version around.
  const installed = { ...(config.installed ?? {}) };

  for (const item of items) {
    for (const dep of item.dependencies ?? []) npmDeps.add(dep);

    for (const file of item.files) {
      const targetRelative = resolveTarget(config, file.target);
      const targetPath = path.join(cwd, targetRelative);

      if (!overwrite && (await exists(targetPath))) {
        skipped.push(targetRelative);
        continue;
      }

      const content = rewriteAlias(file.content, config);
      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, content);
      written.push(targetRelative);
      installed[targetRelative.split(path.sep).join("/")] = { item: item.name, hash: hashContent(content) };
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

  if (written.length > 0) {
    // Persisted even if the project never ran `dsgn init` — without a
    // recorded install hash, diff/update/doctor have nothing to compare
    // against, so tracking has to start at the first successful `add`.
    await writeConfig(cwd, { ...config, installed });
  }

  if (!skipInstall && npmDeps.size > 0) {
    const packageManager = await detectPackageManager(cwd);
    await runInstall(cwd, packageManager, [...npmDeps]);
  }

  console.log(`\nDone: ${items.map((i) => i.name).join(", ")}`);
}
