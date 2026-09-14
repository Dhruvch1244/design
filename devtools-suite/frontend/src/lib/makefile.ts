export type MakeTarget = { name: string; prerequisites: string[]; recipe: string[] }
export type MakeVariable = { value: string; op: '=' | ':=' | '?=' | '+=' }

export type ParsedMakefile = {
  targets: Map<string, MakeTarget>
  variables: Map<string, MakeVariable>
  phony: Set<string>
}

/**
 * Minimal Makefile parser: target rules, recipe lines (tab-indented), variable assignments
 * (=, :=, ?=, +=), and .PHONY. It does not evaluate pattern rules (%.o: %.c), conditionals
 * (ifeq/ifdef), or includes — those need a real make implementation, not a text scanner.
 */
export function parseMakefile(text: string): ParsedMakefile {
  const targets = new Map<string, MakeTarget>()
  const variables = new Map<string, MakeVariable>()
  const phony = new Set<string>()
  let currentTargets: string[] = []

  const lines = text.split('\n')
  for (const rawLine of lines) {
    if (/^\t/.test(rawLine)) {
      for (const t of currentTargets) targets.get(t)?.recipe.push(rawLine.slice(1))
      continue
    }

    const trimmed = rawLine.replace(/#.*$/, '').trim()
    if (!trimmed) continue

    const varMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(\?=|:=|\+=|=)\s*(.*)$/)
    if (varMatch) {
      variables.set(varMatch[1], { value: varMatch[3], op: varMatch[2] as MakeVariable['op'] })
      currentTargets = []
      continue
    }

    const targetMatch = trimmed.match(/^([^:]+):(?!=)\s*(.*)$/)
    if (targetMatch) {
      const names = targetMatch[1].trim().split(/\s+/)
      const prereqs = targetMatch[2].trim() ? targetMatch[2].trim().split(/\s+/) : []

      if (names.includes('.PHONY')) {
        prereqs.forEach((p) => phony.add(p))
        currentTargets = []
        continue
      }

      currentTargets = names
      for (const name of names) {
        if (!targets.has(name)) targets.set(name, { name, prerequisites: [], recipe: [] })
        targets.get(name)!.prerequisites.push(...prereqs)
      }
    }
  }

  return { targets, variables, phony }
}

/** Resolves $(VAR) / ${VAR} references against the parsed variable table; $(shell ...) is left as-is. */
export function resolveVariable(value: string, variables: Map<string, MakeVariable>, seen = new Set<string>()): string {
  return value.replace(/\$[({]([A-Za-z_][A-Za-z0-9_]*)[)}]/g, (match, name) => {
    if (name === 'shell' || seen.has(name)) return match
    const v = variables.get(name)
    if (!v) return match
    return resolveVariable(v.value, variables, new Set(seen).add(name))
  })
}

/** Order of targets `make TARGET` would build: prerequisites first, depth-first, each target once. */
export function buildOrder(target: string, targets: Map<string, MakeTarget>): string[] {
  const order: string[] = []
  const visited = new Set<string>()

  function visit(name: string, trail: Set<string>) {
    if (visited.has(name) || trail.has(name)) return
    const t = targets.get(name)
    if (!t) {
      order.push(name) // a file dependency with no rule of its own
      visited.add(name)
      return
    }
    const nextTrail = new Set(trail).add(name)
    for (const prereq of t.prerequisites) visit(prereq, nextTrail)
    order.push(name)
    visited.add(name)
  }

  visit(target, new Set())
  return order
}
