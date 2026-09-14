export type IndentNode = { text: string; depth: number; children: IndentNode[] }

const DEFAULT_MARKER = /^([|+\\ ]*[+\\]-+\s*)/

/**
 * Parses ASCII tree output indented with the `+- ` / `|  ` / `\- ` marker style shared by
 * `mvn dependency:tree`, `gradlew dependencies`, and Spark's `explain()` physical plan — one
 * generic parser instead of three near-identical ones. Uses a monotonic stack of marker widths
 * so it doesn't care whether a tool indents 3 characters per level or 6.
 */
export function parseIndentTree(text: string, markerPattern: RegExp = DEFAULT_MARKER): IndentNode[] {
  const lines = text.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.trim() !== '')
  const roots: IndentNode[] = []
  const stack: { len: number; node: IndentNode }[] = []

  for (const line of lines) {
    const markerMatch = line.match(markerPattern) ?? line.match(/^(\s*)/)
    const markerLen = markerMatch ? markerMatch[0].length : 0
    const content = line.slice(markerLen).trim()
    if (!content) continue

    while (stack.length > 0 && stack[stack.length - 1].len >= markerLen) stack.pop()

    const node: IndentNode = { text: content, depth: stack.length, children: [] }
    if (stack.length === 0) roots.push(node)
    else stack[stack.length - 1].node.children.push(node)
    stack.push({ len: markerLen, node })
  }

  return roots
}
