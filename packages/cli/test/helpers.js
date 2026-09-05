import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

/** A fresh sandbox directory per test, removed on cleanup — tests never
 * touch the real filesystem outside this. */
export async function makeSandbox() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "dsgn-cli-test-"));
  return {
    dir,
    cleanup: () => rm(dir, { recursive: true, force: true }),
  };
}

/** Builds a small, self-contained file-based registry (index.json +
 * <name>.json per item) so tests exercise the real fetchJson/resolveItems
 * code path (registry.js's local-directory branch) without any network
 * dependency on the deployed site. Shape matches what
 * packages/registry/scripts/build-registry.mjs actually produces. */
export async function makeFixtureRegistry(dir) {
  const registryDir = path.join(dir, "registry");
  await mkdir(registryDir, { recursive: true });

  const items = [
    {
      name: "utils",
      type: "registry:lib",
      description: "cn() helper.",
      registryDependencies: [],
      dependencies: [],
      files: [{ target: "lib/utils.ts", content: "export function cn() {}\n" }],
    },
    {
      name: "button",
      type: "registry:ui",
      description: "A button.",
      registryDependencies: ["utils"],
      dependencies: ["clsx"],
      files: [
        {
          target: "components/dsgn/button.tsx",
          content: 'import { cn } from "@/lib/utils";\n\nexport function Button() {\n  return null;\n}\n',
        },
      ],
    },
    {
      name: "card",
      type: "registry:ui",
      description: "A card.",
      registryDependencies: ["utils"],
      dependencies: [],
      files: [
        {
          target: "components/dsgn/card.tsx",
          content: 'import { cn } from "@/lib/utils";\n\nexport function Card() {\n  return null;\n}\n',
        },
      ],
    },
    {
      name: "recipe-auth-form",
      type: "registry:block",
      description: "A sign-in form.",
      registryDependencies: ["button", "card"],
      dependencies: [],
      files: [
        {
          target: "components/dsgn/recipes/auth-form.tsx",
          content: "export function AuthForm() {\n  return null;\n}\n",
        },
      ],
    },
    {
      // Mirrors the real combobox/alert-dialog/recipe shape: a multi-file
      // composite that imports a sibling registry component via the @ alias,
      // not just `@/lib/utils` — this is the shape that exposed the
      // rewriteAlias bug (only `@/lib/utils` was ever rewritten).
      name: "menu",
      type: "registry:ui",
      description: "A menu built from Button.",
      registryDependencies: ["button", "utils"],
      dependencies: [],
      files: [
        {
          target: "components/dsgn/menu.tsx",
          content:
            'import { Button } from "@/components/dsgn/button";\nimport { cn } from "@/lib/utils";\n\nexport function Menu() {\n  return Button && cn && null;\n}\n',
        },
      ],
    },
  ];

  const index = {
    name: "dsgn",
    items: items.map(({ name, type, description, registryDependencies }) => ({
      name,
      type,
      description,
      registryDependencies,
    })),
  };

  await writeFile(path.join(registryDir, "index.json"), JSON.stringify(index));
  for (const item of items) {
    await writeFile(path.join(registryDir, `${item.name}.json`), JSON.stringify(item));
  }

  return registryDir;
}
