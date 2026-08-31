import test from "node:test";
import assert from "node:assert/strict";
import { run } from "../src/cli.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version: PACKAGE_VERSION } = require("../package.json");

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

test("cli: --version prints just the version and exits cleanly", async (t) => {
  const cap = captureConsole();
  process.exitCode = undefined;
  await run(["--version"]);
  const output = cap.lines.join("\n");
  cap.restore();

  assert.equal(output, PACKAGE_VERSION);
  assert.notEqual(process.exitCode, 1, "a real flag should not exit as an unknown command");
  t.after(() => {
    process.exitCode = undefined;
  });
});

test("cli: -v is the same as --version", async (t) => {
  const cap = captureConsole();
  process.exitCode = undefined;
  await run(["-v"]);
  const output = cap.lines.join("\n");
  cap.restore();

  assert.equal(output, PACKAGE_VERSION);
  t.after(() => {
    process.exitCode = undefined;
  });
});

test("cli: an actually-unknown command still exits non-zero", async (t) => {
  const cap = captureConsole();
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args.join(" "));
  process.exitCode = undefined;

  await run(["not-a-real-command"]);

  console.error = originalError;
  cap.restore();

  assert.equal(process.exitCode, 1);
  assert.match(errors.join("\n"), /Unknown command/);
  t.after(() => {
    process.exitCode = undefined;
  });
});
