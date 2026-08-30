import test from "node:test";
import assert from "node:assert/strict";
import { list } from "../src/commands/list.js";
import { makeSandbox, makeFixtureRegistry } from "./helpers.js";

function captureConsole() {
  const lines = [];
  const original = console.log;
  console.log = (...args) => lines.push(args.join(" "));
  return {
    lines,
    restore: () => {
      console.log = original;
    },
  };
}

test("list: shows only registry:ui components, not utils or recipes", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  const cap = captureConsole();
  await list({ registry });
  const output = cap.lines.join("\n");
  cap.restore();

  assert.match(output, /button/);
  assert.match(output, /card/);
  assert.doesNotMatch(output, /\butils\b/, "utils is a transitive lib dependency, not something you list to add");
  assert.doesNotMatch(output, /recipe-auth-form/, "recipes have their own --recipes view");
  assert.match(output, /dsgn skill --global/, "should surface the skill command as a footer");
});

test("list --recipes: shows only recipes, using the recipe: form users actually type", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  const cap = captureConsole();
  await list({ registry, recipes: true });
  const output = cap.lines.join("\n");
  cap.restore();

  assert.match(output, /recipe:auth-form/);
  assert.doesNotMatch(output, /^\s*recipe-auth-form/m, "should print the recipe: form, not the raw registry name");
  assert.doesNotMatch(output, /\bbutton\b/, "components should not appear in the recipes view");
});

test("list --json: prints parseable JSON, not the human-readable table", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  const cap = captureConsole();
  await list({ registry, json: true });
  cap.restore();

  assert.equal(cap.lines.length, 1, "should print exactly one JSON blob, no footer/table noise");
  const parsed = JSON.parse(cap.lines[0]);
  assert.ok(Array.isArray(parsed));
  const names = parsed.map((item) => item.name);
  assert.ok(names.includes("button"));
  assert.ok(names.includes("card"));
  assert.ok(!names.includes("utils"));
});

test("list --recipes --json: uses the recipe: form and includes registryDependencies", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);

  const cap = captureConsole();
  await list({ registry, recipes: true, json: true });
  cap.restore();

  const parsed = JSON.parse(cap.lines[0]);
  const authForm = parsed.find((item) => item.name === "recipe:auth-form");
  assert.ok(authForm, "should use the recipe: form, not the raw recipe-auth-form registry name");
  assert.ok(Array.isArray(authForm.registryDependencies));
});
