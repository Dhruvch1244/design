import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolved relative to this module's own location, not process.cwd() — the
// snippets file ships inside the published package (packages/cli/snippets/),
// so it has to be found regardless of which project directory `dsgn` is
// invoked from. This file lives at packages/cli/src/commands/snippets.js,
// so packages/cli/ itself is two directories up.
const packageRoot = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const SOURCE = path.join(packageRoot, "snippets", "dsgn.code-snippets");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function snippets(cwd) {
  const targetDir = path.join(cwd, ".vscode");
  const targetPath = path.join(targetDir, "dsgn.code-snippets");

  if (await exists(targetPath)) {
    console.log(".vscode/dsgn.code-snippets already exists — leaving it as-is.");
    return;
  }

  const content = await readFile(SOURCE, "utf8");
  await mkdir(targetDir, { recursive: true });
  await writeFile(targetPath, content);
  console.log(
    "Created .vscode/dsgn.code-snippets — type a prefix like \"dsgn-button\" in a .tsx file and press Tab.",
  );
}
