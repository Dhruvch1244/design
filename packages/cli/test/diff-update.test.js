import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { add } from "../src/commands/add.js";
import { update } from "../src/commands/update.js";
import { readConfig } from "../src/config.js";
import { resolveTarget, rewriteAlias, hashContent } from "../src/paths.js";
import { fetchItem } from "../src/registry.js";
import { makeSandbox, makeFixtureRegistry } from "./helpers.js";

// diff.js itself only ever console.logs — it has no return value to assert
// on, so these tests exercise the same hash-comparison logic diff.js runs
// (installedFilesFor + a direct hash check) rather than scraping stdout.
// update.js *does* have observable side effects (files written, config
// updated), so those get tested directly against the real command.

test("hash tracking: unmodified file hashes match what add recorded", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await add(dir, ["button"], { registry, skipInstall: true });

  const config = await readConfig(dir);
  const meta = config.installed["components/dsgn/button.tsx"];
  const onDisk = await readFile(path.join(dir, "components/dsgn/button.tsx"), "utf8");
  assert.equal(hashContent(onDisk), meta.hash, "hash of untouched file should still match install-time hash");
});

test("hash tracking: hand-edited file no longer matches the recorded hash", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await add(dir, ["button"], { registry, skipInstall: true });
  await writeFile(path.join(dir, "components/dsgn/button.tsx"), "// edited by hand\n");

  const config = await readConfig(dir);
  const meta = config.installed["components/dsgn/button.tsx"];
  const onDisk = await readFile(path.join(dir, "components/dsgn/button.tsx"), "utf8");
  assert.notEqual(hashContent(onDisk), meta.hash, "hash should have drifted after a hand edit");
});

test("update: applies the upstream version for an unmodified file", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await add(dir, ["button"], { registry, skipInstall: true });
  // Simulate the registry shipping a new version between install and update.
  const itemPath = path.join(registry, "button.json");
  const item = JSON.parse(await readFile(itemPath, "utf8"));
  item.files[0].content = "export function Button() {\n  return \"v2\";\n}\n";
  await writeFile(itemPath, JSON.stringify(item));

  await update(dir, ["button"], { registry });

  const content = await readFile(path.join(dir, "components/dsgn/button.tsx"), "utf8");
  assert.match(content, /v2/);
});

test("update: skips a locally-modified file without --force", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await add(dir, ["button"], { registry, skipInstall: true });
  await writeFile(path.join(dir, "components/dsgn/button.tsx"), "// my custom version\n");

  const itemPath = path.join(registry, "button.json");
  const item = JSON.parse(await readFile(itemPath, "utf8"));
  item.files[0].content = "export function Button() {\n  return \"v2\";\n}\n";
  await writeFile(itemPath, JSON.stringify(item));

  await update(dir, ["button"], { registry });

  const content = await readFile(path.join(dir, "components/dsgn/button.tsx"), "utf8");
  assert.equal(content, "// my custom version\n", "locally-modified file should not have been touched");
});

test("update: --force overwrites a locally-modified file", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  await add(dir, ["button"], { registry, skipInstall: true });
  await writeFile(path.join(dir, "components/dsgn/button.tsx"), "// my custom version\n");

  const itemPath = path.join(registry, "button.json");
  const item = JSON.parse(await readFile(itemPath, "utf8"));
  item.files[0].content = "export function Button() {\n  return \"v2\";\n}\n";
  await writeFile(itemPath, JSON.stringify(item));

  await update(dir, ["button"], { registry, force: true });

  const content = await readFile(path.join(dir, "components/dsgn/button.tsx"), "utf8");
  assert.match(content, /v2/, "should have been overwritten with --force");
});

test("registry fetchItem/resolveTarget/rewriteAlias round-trip against the fixture", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  const item = await fetchItem(registry, "card");
  const config = { componentsDir: "components/dsgn", utilsDir: "lib", alias: "@" };
  const target = resolveTarget(config, item.files[0].target);
  assert.equal(target, path.join("components", "dsgn", "card.tsx"));
  assert.equal(rewriteAlias(item.files[0].content, config), item.files[0].content, "default alias needs no rewrite");
});
