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
