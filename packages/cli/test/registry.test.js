import test from "node:test";
import assert from "node:assert/strict";
import { resolveItems } from "../src/registry.js";
import { makeSandbox, makeFixtureRegistry } from "./helpers.js";

test("resolveItems: resolves transitive registryDependencies in dependency order", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  const items = await resolveItems(registry, ["button"]);
  const names = items.map((i) => i.name);

  assert.deepEqual(names, ["utils", "button"], "utils (the dependency) must come before button (the dependent)");
});

test("resolveItems: deduplicates a dependency shared by two requested items", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  // button and card both depend on utils.
  const items = await resolveItems(registry, ["button", "card"]);
  const utilsCount = items.filter((i) => i.name === "utils").length;

  assert.equal(utilsCount, 1, "utils should only be fetched/resolved once");
});

test("resolveItems: a recipe pulls in every component it depends on", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  const items = await resolveItems(registry, ["recipe-auth-form"]);
  const names = items.map((i) => i.name);

  assert.ok(names.includes("button"));
  assert.ok(names.includes("card"));
  assert.ok(names.includes("utils"));
  assert.ok(names.includes("recipe-auth-form"));
  assert.equal(names.indexOf("recipe-auth-form"), names.length - 1, "the requested item resolves last, after its deps");
});
