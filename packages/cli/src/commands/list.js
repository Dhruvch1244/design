import { fetchIndex, DEFAULT_REGISTRY } from "../registry.js";

const SKILL_FOOTER =
  "\nAlso available: npx @dhruvchoudhary/dsgn skill --global / --project — installs the dsgn Claude Code Agent Skill.";

export async function list({ registry, recipes, json } = {}) {
  const registryBase = registry ?? process.env.DSGN_REGISTRY ?? DEFAULT_REGISTRY;
  const index = await fetchIndex(registryBase);

  if (recipes) {
    const items = index.items.filter((item) => item.type === "registry:block");
    if (json) {
      console.log(
        JSON.stringify(
          items.map((item) => ({
            name: `recipe:${item.name.replace(/^recipe-/, "")}`,
            description: item.description ?? "",
            registryDependencies: item.registryDependencies ?? [],
          })),
          null,
          2,
        ),
      );
      return;
    }
    console.log(`${index.name} registry — ${items.length} recipe(s):\n`);
    for (const item of items) {
      const name = `recipe:${item.name.replace(/^recipe-/, "")}`;
      console.log(`  ${name.padEnd(24)} ${item.description ?? ""}`);
    }
    return;
  }

  // registry:lib (utils) isn't something you `add` directly — it's a
  // transitive dependency every component already pulls in — and recipes
  // have their own `--recipes` view since they're a different shape of
  // thing (a composed pattern, not a single component). Mixing all three
  // into one undifferentiated list is what this used to do, and it made
  // "list" show `utils` and `recipe-auth-form` (the internal name, not the
  // `recipe:auth-form` form anyone actually types) alongside real components.
  const items = index.items.filter((item) => item.type === "registry:ui");
  if (json) {
    console.log(
      JSON.stringify(
        items.map((item) => ({ name: item.name, description: item.description ?? "" })),
        null,
        2,
      ),
    );
    return;
  }
  console.log(`${index.name} registry — ${items.length} component(s):\n`);
  for (const item of items) {
    console.log(`  ${item.name.padEnd(16)} ${item.description ?? ""}`);
  }
  console.log(SKILL_FOOTER);
}
