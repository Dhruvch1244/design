export type DepNode = {
  coordinate: string
  depth: number
  children: DepNode[]
  conflict?: boolean
}

/**
 * Parses `mvn dependency:tree` ASCII-art output (lines like "+- group:artifact:jar:1.2:compile"
 * or "|  \\- group:artifact:...") into a tree by indentation depth. Gradle's `./gradlew
 * dependencies` output uses the same +--- / \--- / |    marker style, so this covers both with
 * one parser.
 */
export function parseDependencyTree(text: string): DepNode[] {
  const lines = text.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.trim() !== '')
  const roots: DepNode[] = []
  // Monotonic stack of {markerLen, node}: a line's depth is however many stack entries have a
  // strictly smaller marker length than this line's. This works whether the tool indents 3 chars
  // per level (Maven's "|  ", "+- ") or 5 (Gradle's "|    ", "+--- ") — no hardcoded width.
  const stack: { len: number; node: DepNode }[] = []

  for (const line of lines) {
    const markerMatch = line.match(/^([|+\\ ]*[+\\]-+\s*)/) ?? line.match(/^(\s*)/)
    const markerLen = markerMatch ? markerMatch[0].length : 0
    const coordinate = line.slice(markerLen).trim()
    if (!coordinate) continue

    while (stack.length > 0 && stack[stack.length - 1].len >= markerLen) stack.pop()

    const depth = stack.length
    const node: DepNode = { coordinate, depth, children: [] }
    if (stack.length === 0) {
      roots.push(node)
    } else {
      stack[stack.length - 1].node.children.push(node)
    }
    stack.push({ len: markerLen, node })
  }

  markConflicts(roots)
  return roots
}

function markConflicts(roots: DepNode[]) {
  const versionsByGA = new Map<string, Set<string>>()
  const collect = (n: DepNode) => {
    const parts = n.coordinate.split(':')
    if (parts.length >= 4) {
      const ga = `${parts[0]}:${parts[1]}`
      const version = parts[3]
      if (!versionsByGA.has(ga)) versionsByGA.set(ga, new Set())
      versionsByGA.get(ga)!.add(version)
    }
    n.children.forEach(collect)
  }
  roots.forEach(collect)

  const mark = (n: DepNode) => {
    const parts = n.coordinate.split(':')
    if (parts.length >= 4) {
      const ga = `${parts[0]}:${parts[1]}`
      if ((versionsByGA.get(ga)?.size ?? 0) > 1) n.conflict = true
    }
    n.children.forEach(mark)
  }
  roots.forEach(mark)
}

export function findPathsTo(roots: DepNode[], needle: string): string[][] {
  const paths: string[][] = []
  const walk = (n: DepNode, trail: string[]) => {
    const next = [...trail, n.coordinate]
    if (n.coordinate.toLowerCase().includes(needle.toLowerCase())) paths.push(next)
    n.children.forEach((c) => walk(c, next))
  }
  roots.forEach((r) => walk(r, []))
  return paths
}
