import test from "node:test";
import assert from "node:assert/strict";
import { startServer, parseToolResult } from "./helpers.js";

test("list_components: returns known items", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({ name: "list_components", arguments: {} });
  const data = parseToolResult(result);

  assert.ok(data.count > 0);
  const names = data.items.map((i) => i.name);
  assert.ok(names.includes("button"));
});

test("list_components: filters by type", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({ name: "list_components", arguments: { type: "block" } });
  const data = parseToolResult(result);

  assert.ok(data.count > 0);
  for (const item of data.items) {
    assert.equal(item.type, "registry:block");
  }
});

test("search_components: finds date-related items", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({ name: "search_components", arguments: { query: "date" } });
  const data = parseToolResult(result);

  const names = data.items.map((i) => i.name);
  assert.ok(names.includes("date-picker"), "should find date-picker by name");
});

test("get_component: combobox resolves its transitive registryDependencies' files", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({ name: "get_component", arguments: { name: "combobox" } });
  const data = parseToolResult(result);

  assert.equal(data.requested, "combobox");
  assert.ok(data.resolvedDependencies.includes("button"));
  assert.ok(data.resolvedDependencies.includes("popover"));
  assert.ok(data.resolvedDependencies.includes("command"));
  assert.ok(data.resolvedDependencies.includes("utils"));

  const fromNames = data.files.map((f) => f.from);
  assert.ok(fromNames.includes("combobox"));
  assert.ok(fromNames.includes("button"));

  const comboboxFile = data.files.find((f) => f.from === "combobox");
  assert.ok(comboboxFile.content.includes("Combobox"));
  assert.ok(comboboxFile.target);
});

test("get_component: recipe: shorthand resolves to the recipe-<name> registry entry", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({
    name: "get_component",
    arguments: { name: "recipe:auth-form" },
  });
  const data = parseToolResult(result);

  assert.equal(data.requested, "recipe-auth-form");
  assert.ok(data.item.files.length > 0);
});

test("get_component: batch fetch resolves and dedupes shared dependencies across requested items", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({
    name: "get_component",
    arguments: { name: ["combobox", "date-picker"] },
  });
  const data = parseToolResult(result);

  assert.deepEqual(data.requestedItems, ["combobox", "date-picker"]);
  assert.equal(data.item, undefined);
  assert.equal(data.items.length, 2);

  // Both combobox and date-picker are expected to pull in the shared
  // "button" dependency — it must appear only once in resolvedDependencies
  // and its file must appear only once in files, not once per requester.
  const buttonDepCount = data.resolvedDependencies.filter((n) => n === "button").length;
  assert.equal(buttonDepCount, 1);
  const buttonFileCount = data.files.filter((f) => f.from === "button").length;
  assert.equal(buttonFileCount, 1);
});

test("get_component: single name still returns the singular `item` shape", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({ name: "get_component", arguments: { name: "button" } });
  const data = parseToolResult(result);

  assert.equal(data.requested, "button");
  assert.equal(data.items, undefined);
  assert.equal(data.item.name, "button");
});

test("get_component: unknown name surfaces as a tool error, not a crash", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({
    name: "get_component",
    arguments: { name: "definitely-not-a-real-component" },
  });

  assert.equal(result.isError, true);
});

test("get_philosophy: no slug lists every doc with a summary", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({ name: "get_philosophy", arguments: {} });
  const data = parseToolResult(result);

  const slugs = data.docs.map((d) => d.slug);
  assert.ok(slugs.includes("agents"));
  assert.ok(slugs.includes("architecture"));
  assert.ok(slugs.includes("anti-patterns"));
  for (const doc of data.docs) {
    assert.ok(doc.summary.length > 0, `${doc.slug} should have a non-empty summary`);
  }
});

test("get_philosophy: a single slug returns its full Markdown content", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({ name: "get_philosophy", arguments: { slug: "anti-patterns" } });
  const data = parseToolResult(result);

  assert.equal(data.slug, "anti-patterns");
  assert.ok(data.content.length > 100);
  assert.match(data.content, /^#/m);
});

test("get_philosophy: an array of slugs returns each doc's full content", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({
    name: "get_philosophy",
    arguments: { slug: ["motion", "code-style"] },
  });
  const data = parseToolResult(result);

  assert.equal(data.docs.length, 2);
  assert.deepEqual(
    data.docs.map((d) => d.slug),
    ["motion", "code-style"],
  );
  assert.ok(data.docs.every((d) => d.content.length > 100));
});

test("get_philosophy: unknown slug surfaces as a tool error, not a crash", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({ name: "get_philosophy", arguments: { slug: "not-a-real-doc" } });

  assert.equal(result.isError, true);
});

test("generate_component_scaffold: composedFrom produces a composed skeleton", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const result = await client.callTool({
    name: "generate_component_scaffold",
    arguments: {
      name: "date-range-picker",
      kind: "ui",
      description: "A range date picker composed from Popover, Calendar, and Button.",
      composedFrom: ["popover", "calendar", "button"],
    },
  });
  const data = parseToolResult(result);

  assert.equal(data.skeletonKind, "composed");
  assert.match(data.fileContent, /DateRangePicker/);
  assert.match(data.fileContent, /import \{ Popover \} from "\.\.\/popover\/popover";/);
  assert.equal(data.registryEntry.name, "date-range-picker");
  assert.equal(data.registryEntry.type, "registry:ui");
  assert.ok(data.registryEntry.registryDependencies.includes("popover"));
  assert.ok(data.registryEntry.registryDependencies.includes("utils"));
  assert.ok(Array.isArray(data.notes) && data.notes.length > 0);
});

test("generate_component_scaffold: no composedFrom guesses a Radix wrapper or plain primitive", async (t) => {
  const { client, close } = await startServer();
  t.after(close);

  const radixResult = await client.callTool({
    name: "generate_component_scaffold",
    arguments: { name: "accordion", kind: "ui", description: "An accordion." },
  });
  const radixData = parseToolResult(radixResult);
  assert.equal(radixData.skeletonKind, "radix-wrapper");
  assert.match(radixData.fileContent, /@radix-ui\/react-accordion/);
  assert.ok(radixData.registryEntry.dependencies.includes("@radix-ui/react-accordion"));

  const plainResult = await client.callTool({
    name: "generate_component_scaffold",
    arguments: { name: "kbd", kind: "ui", description: "An inline keyboard-key badge." },
  });
  const plainData = parseToolResult(plainResult);
  assert.equal(plainData.skeletonKind, "plain-primitive");
  assert.match(plainData.fileContent, /forwardRef/);
  assert.equal(plainData.registryEntry.dependencies.length, 0);
});
