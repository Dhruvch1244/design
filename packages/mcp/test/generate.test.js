import test from "node:test";
import assert from "node:assert/strict";
import { generateComponentScaffold, guessRadixPackage } from "../src/generate.js";

test("guessRadixPackage: known primitive names guess a plausible package", () => {
  assert.equal(guessRadixPackage("dialog"), "@radix-ui/react-dialog");
  assert.equal(guessRadixPackage("tooltip"), "@radix-ui/react-tooltip");
});

test("guessRadixPackage: unknown names return null", () => {
  assert.equal(guessRadixPackage("kbd"), null);
  assert.equal(guessRadixPackage("stat-tile"), null);
});

test("generateComponentScaffold: validates required inputs", () => {
  assert.throws(() => generateComponentScaffold({ kind: "ui", description: "x" }), /name/);
  assert.throws(() => generateComponentScaffold({ name: "x", description: "x" }), /kind/);
  assert.throws(() => generateComponentScaffold({ name: "x", kind: "ui" }), /description/);
});

test("generateComponentScaffold: registry entry shape matches registry.json's conventions", () => {
  const scaffold = generateComponentScaffold({
    name: "stat-tile",
    kind: "ui",
    description: "A single-metric stat tile.",
  });

  assert.equal(scaffold.registryEntry.name, "stat-tile");
  assert.equal(scaffold.registryEntry.type, "registry:ui");
  assert.deepEqual(scaffold.registryEntry.registryDependencies, ["utils"]);
  assert.equal(scaffold.registryEntry.files[0].target, "components/dsgn/stat-tile.tsx");
  assert.equal(scaffold.filePath, "src/components/stat-tile/stat-tile.tsx");
});

test("generateComponentScaffold: block kind produces registry:block type", () => {
  const scaffold = generateComponentScaffold({
    name: "onboarding-flow",
    kind: "block",
    description: "A composed onboarding recipe.",
    composedFrom: ["card", "button"],
  });

  assert.equal(scaffold.registryEntry.type, "registry:block");
  assert.ok(scaffold.registryEntry.registryDependencies.includes("card"));
  assert.ok(scaffold.registryEntry.registryDependencies.includes("button"));
});
