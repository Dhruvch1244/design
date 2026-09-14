function toPascalCase(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^(.)/, (c) => c.toUpperCase())
}

function isValidIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
}

function quoteKeyIfNeeded(key: string): string {
  return isValidIdentifier(key) ? key : `"${key.replace(/"/g, '\\"')}"`
}

type Ctx = { interfaces: Map<string, string>; usedNames: Set<string> }

function uniqueName(base: string, ctx: Ctx): string {
  let name = base || 'Root'
  let i = 2
  while (ctx.usedNames.has(name)) {
    name = `${base}${i}`
    i++
  }
  ctx.usedNames.add(name)
  return name
}

function typeOf(value: unknown, hintName: string, ctx: Ctx): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'
    // One interface per array, generated from the first element — not one per element. Fields that
    // only appear on later items won't show up; that's a deliberate simplification, not a bug.
    return `${typeOf(value[0], hintName, ctx)}[]`
  }
  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'object':
      return buildInterface(value as Record<string, unknown>, hintName, ctx)
    default:
      return 'unknown'
  }
}

function buildInterface(obj: Record<string, unknown>, hintName: string, ctx: Ctx): string {
  const name = uniqueName(toPascalCase(hintName), ctx)
  const lines: string[] = [`export interface ${name} {`]
  for (const [key, value] of Object.entries(obj)) {
    const optional = value === null || value === undefined ? '?' : ''
    const fieldType = value === null ? 'unknown | null' : typeOf(value, key, ctx)
    lines.push(`  ${quoteKeyIfNeeded(key)}${optional}: ${fieldType}`)
  }
  lines.push('}')
  ctx.interfaces.set(name, lines.join('\n'))
  return name
}

/** Generates TypeScript interfaces from a sample JSON value, nesting one interface per object shape encountered. */
export function jsonToTypeScript(json: unknown, rootName = 'Root'): string {
  const ctx: Ctx = { interfaces: new Map(), usedNames: new Set() }
  if (Array.isArray(json)) {
    const elType = typeOf(json[0] ?? {}, rootName, ctx)
    return Array.from(ctx.interfaces.values()).join('\n\n') + `\n\nexport type ${toPascalCase(rootName)}List = ${elType}[]`
  }
  buildInterface(json as Record<string, unknown>, rootName, ctx)
  return Array.from(ctx.interfaces.values()).join('\n\n')
}
