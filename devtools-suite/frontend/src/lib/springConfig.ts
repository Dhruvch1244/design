import * as yaml from 'js-yaml'

export type FlatMap = Record<string, string>

export function parseYamlToFlat(text: string): FlatMap {
  const doc = yaml.load(text)
  const flat: FlatMap = {}
  flatten(doc, '', flat)
  return flat
}

function flatten(value: unknown, prefix: string, out: FlatMap) {
  if (value === null || value === undefined) {
    if (prefix) out[prefix] = ''
    return
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => flatten(v, prefix ? `${prefix}[${i}]` : `[${i}]`, out))
    return
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0 && prefix) {
      out[prefix] = ''
      return
    }
    for (const [k, v] of entries) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out)
    }
    return
  }
  out[prefix] = String(value)
}

export function parsePropertiesToFlat(text: string): FlatMap {
  const flat: FlatMap = {}
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('!')) continue
    const eq = line.search(/[=:]/)
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim()
    if (key) flat[key] = value
  }
  return flat
}

export function flatToYaml(flat: FlatMap): string {
  const root: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]
      if (typeof node[p] !== 'object' || node[p] === null) node[p] = {}
      node = node[p] as Record<string, unknown>
    }
    node[parts[parts.length - 1]] = value
  }
  return yaml.dump(root)
}

export function flatToProperties(flat: FlatMap): string {
  return Object.entries(flat).map(([k, v]) => `${k}=${v}`).join('\n')
}

/** Resolves ${a.b.c} / ${a.b.c:default} placeholders by substituting from the same flat map. */
export function resolvePlaceholders(flat: FlatMap): { resolved: FlatMap; unresolved: string[] } {
  const resolved: FlatMap = {}
  const unresolved = new Set<string>()

  function resolveValue(value: string, seen: Set<string>): string {
    return value.replace(/\$\{([^}:]+)(:([^}]*))?\}/g, (_match, key, _c, def) => {
      if (seen.has(key)) return `\${${key}}` // circular reference — leave as-is rather than looping forever
      if (key in flat) {
        return resolveValue(flat[key], new Set(seen).add(key))
      }
      if (def !== undefined) return def
      unresolved.add(key)
      return `\${${key}}`
    })
  }

  for (const [k, v] of Object.entries(flat)) {
    resolved[k] = resolveValue(v, new Set([k]))
  }
  return { resolved, unresolved: Array.from(unresolved) }
}

export type DiffRow = { key: string; a: string | null; b: string | null; status: 'same' | 'changed' | 'onlyA' | 'onlyB' }

export function diffFlat(a: FlatMap, b: FlatMap): DiffRow[] {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const rows: DiffRow[] = []
  for (const key of Array.from(keys).sort()) {
    const av = a[key] ?? null
    const bv = b[key] ?? null
    let status: DiffRow['status']
    if (av === null) status = 'onlyB'
    else if (bv === null) status = 'onlyA'
    else if (av === bv) status = 'same'
    else status = 'changed'
    rows.push({ key, a: av, b: bv, status })
  }
  return rows
}
