import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { doctor } from "../src/commands/doctor.js";
import { add } from "../src/commands/add.js";
import { makeSandbox, makeFixtureRegistry } from "./helpers.js";

// doctor() only prints to console and sets process.exitCode — capture both
// so assertions can check real output instead of trusting the exit code
// alone (a false "no problems found" with exitCode still 0 would slip past
// an exit-code-only check).
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

test("doctor: reports a clean project as having no problems", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);
  await add(dir, ["button"], { registry, skipInstall: true });

  const originalExitCode = process.exitCode;
  const cap = captureConsole();
  await doctor(dir);
  const output = cap.lines.join("\n");
  cap.restore();

  assert.match(output, /0 locally modified/);
  assert.match(output, /0 missing on disk/);
  assert.match(output, /no problems found/);
  assert.equal(process.exitCode, originalExitCode, "clean project should not set a failing exit code");
});

test("doctor: flags a missing tracked file", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);
  await add(dir, ["button"], { registry, skipInstall: true });
  await rm(path.join(dir, "components/dsgn/button.tsx"));

  const cap = captureConsole();
  await doctor(dir);
  const output = cap.lines.join("\n");
  cap.restore();

  assert.match(output, /1 missing on disk/);
  assert.match(output, /button\.tsx/);
  assert.equal(process.exitCode, 1);
  process.exitCode = 0;
});

test("doctor: flags a locally-modified file as informational, not a failure", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);
  await add(dir, ["button"], { registry, skipInstall: true });
  await writeFile(path.join(dir, "components/dsgn/button.tsx"), "export function Button() { return null; }\n");

  const originalExitCode = process.exitCode;
  const cap = captureConsole();
  await doctor(dir);
  const output = cap.lines.join("\n");
  cap.restore();

  assert.match(output, /1 locally modified/);
  assert.equal(process.exitCode, originalExitCode, "local modification alone should not fail doctor");
});

test("doctor: flags <img> without alt", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);
  await add(dir, ["button"], { registry, skipInstall: true });
  await writeFile(
    path.join(dir, "components/dsgn/button.tsx"),
    'export function Button() {\n  return <img src="x.png" />;\n}\n',
  );

  const cap = captureConsole();
  await doctor(dir);
  const output = cap.lines.join("\n");
  cap.restore();
  process.exitCode = 0;

  assert.match(output, /<img> without alt/);
});

test("doctor: flags onClick on a non-interactive element with no role/tabIndex", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);
  await add(dir, ["button"], { registry, skipInstall: true });
  await writeFile(
    path.join(dir, "components/dsgn/button.tsx"),
    'export function Button() {\n  return <div onClick={() => {}}>click</div>;\n}\n',
  );

  const cap = captureConsole();
  await doctor(dir);
  const output = cap.lines.join("\n");
  cap.restore();
  process.exitCode = 0;

  assert.match(output, /onClick on a <div> with no role\/tabIndex/);
});

test("doctor: does not flag onClick when role/tabIndex are present", async (t) => {
  const { dir, cleanup } = await makeSandbox();
  t.after(cleanup);
  const registry = await makeFixtureRegistry(dir);
  await add(dir, ["button"], { registry, skipInstall: true });
  await writeFile(
    path.join(dir, "components/dsgn/button.tsx"),
    'export function Button() {\n  return <div role="button" tabIndex={0} onClick={() => {}}>click</div>;\n}\n',
  );

  const cap = captureConsole();
  await doctor(dir);
  const output = cap.lines.join("\n");
  cap.restore();

  assert.doesNotMatch(output, /no role\/tabIndex/);
});
