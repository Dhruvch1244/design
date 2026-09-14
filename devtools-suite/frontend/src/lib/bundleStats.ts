export type BundleAsset = { name: string; size: number }

/**
 * Webpack/Rollup/Vite stats JSON shapes vary a lot (webpack's `assets`/`modules`, rollup-plugin-
 * visualizer's tree, multi-compiler `children`). Rather than hardcode one bundler's schema, this
 * walks the document looking for the first array of objects that looks like {name/label/id,
 * size/statSize/parsedSize/gzipSize} — good enough to answer "what's biggest" regardless of which
 * tool produced the file.
 */
export function extractAssets(doc: unknown): BundleAsset[] {
  const found: BundleAsset[] = []
  const seen = new Set<unknown>()

  function walk(node: unknown) {
    if (node === null || typeof node !== 'object' || seen.has(node)) return
    seen.add(node)

    if (Array.isArray(node)) {
      for (const item of node) {
        const asset = toAsset(item)
        if (asset) found.push(asset)
        else walk(item)
      }
      return
    }
    for (const value of Object.values(node as Record<string, unknown>)) {
      walk(value)
    }
  }

  walk(doc)
  return dedupe(found)
}

function toAsset(item: unknown): BundleAsset | null {
  if (item === null || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const name = obj.name ?? obj.label ?? obj.id ?? obj.file
  const size = obj.size ?? obj.statSize ?? obj.parsedSize ?? obj.gzipSize ?? obj.renderedLength
  if (typeof name === 'string' && typeof size === 'number') return { name, size }
  return null
}

function dedupe(assets: BundleAsset[]): BundleAsset[] {
  const byName = new Map<string, number>()
  for (const a of assets) byName.set(a.name, Math.max(byName.get(a.name) ?? 0, a.size))
  return Array.from(byName.entries()).map(([name, size]) => ({ name, size })).sort((a, b) => b.size - a.size)
}
