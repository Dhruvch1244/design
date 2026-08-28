import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { add } from "../src/commands/add.js";
import { readConfig, writeConfig } from "../src/config.js";
import { makeSandbox, makeFixtureRegistry } from "./helpers.js";

test("add: writes files to resolved paths and installs npm deps", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await add(dir, ["button"], { registry, skipInstall: true });

  const content = await readFile(path.join(dir, "components/dsgn/button.tsx"), "utf8");
  assert.match(content, /export function Button/);
  // utils is a registryDependency of button, so it's pulled in transitively.
  await readFile(path.join(dir, "lib/utils.ts"), "utf8");
});

test("add: skips existing files unless --overwrite is passed", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await add(dir, ["button"], { registry, skipInstall: true });
  await writeFile_(dir, "components/dsgn/button.tsx", "// hand-edited\n");

  await add(dir, ["button"], { registry, skipInstall: true });
  let content = await readFile(path.join(dir, "components/dsgn/button.tsx"), "utf8");
  assert.equal(content, "// hand-edited\n", "should have been skipped, not overwritten");

  await add(dir, ["button"], { registry, skipInstall: true, overwrite: true });
  content = await readFile(path.join(dir, "components/dsgn/button.tsx"), "utf8");
  assert.match(content, /export function Button/, "should have been replaced with --overwrite");
});

test("add: rewrites @/lib/utils imports when a custom alias is configured", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await writeConfig(dir, {
    $schema: "https://design.dhruvchoudhary.com/schema/config.json",
    componentsDir: "src/ui",
    utilsDir: "src/utils",
    alias: "~",
  });

  await add(dir, ["button"], { registry, skipInstall: true });

  const content = await readFile(path.join(dir, "src/ui/button.tsx"), "utf8");
  assert.match(content, /from "~\/src\/utils\/utils"/);
  assert.doesNotMatch(content, /@\/lib\/utils/);
});

test("add: records an install hash for every written file", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await add(dir, ["card"], { registry, skipInstall: true });

  const config = await readConfig(dir);
  const entry = config.installed["components/dsgn/card.tsx"];
  assert.ok(entry, "expected an installed entry for card.tsx");
  assert.equal(entry.item, "card");
  assert.match(entry.hash, /^sha256:[0-9a-f]{64}$/);
});

test("add: recipe:<name> resolves to the recipe plus its component dependencies", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await add(dir, ["recipe:auth-form"], { registry, skipInstall: true });

  await readFile(path.join(dir, "components/dsgn/recipes/auth-form.tsx"), "utf8");
  await readFile(path.join(dir, "components/dsgn/button.tsx"), "utf8");
  await readFile(path.join(dir, "components/dsgn/card.tsx"), "utf8");
});

async function writeFile_(dir, relative, content) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(path.join(dir, relative), content);
}
