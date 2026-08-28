import { fetchIndex, DEFAULT_REGISTRY } from "../registry.js";

export async function list({ registry } = {}) {
  const registryBase = registry ?? process.env.DSGN_REGISTRY ?? DEFAULT_REGISTRY;
  const index = await fetchIndex(registryBase);

  console.log(`${index.name} registry — ${index.items.length} component(s):\n`);
  for (const item of index.items) {
    console.log(`  ${item.name.padEnd(16)} ${item.description ?? ""}`);
  }
}
