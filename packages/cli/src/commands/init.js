import { readConfig, writeConfig, DEFAULT_CONFIG } from "../config.js";

export async function init(cwd) {
  const existing = await readConfig(cwd);
  if (existing) {
    console.log("dsgn.config.json already exists — leaving it as-is.");
    return;
  }

  await writeConfig(cwd, DEFAULT_CONFIG);
  console.log(
    [
      "Created dsgn.config.json:",
      "",
      `  componentsDir: ${DEFAULT_CONFIG.componentsDir}`,
      `  utilsDir:      ${DEFAULT_CONFIG.utilsDir}`,
      `  alias:         ${DEFAULT_CONFIG.alias} (imports are written as "${DEFAULT_CONFIG.alias}/lib/utils")`,
      "",
      "Edit these paths if your project's layout differs, then run `dsgn add <component>`.",
      "Run `dsgn snippets` for VS Code autocomplete on every registry component.",
    ].join("\n"),
  );
}
