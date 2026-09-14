import { parseIndentTree, type IndentNode } from './indentTree'

export type PlanNode = IndentNode & {
  isShuffle: boolean
  isBroadcast: boolean
  partitions: number | null
  children: PlanNode[]
}

const SHUFFLE_RE = /\bExchange\b/
const BROADCAST_RE = /\bBroadcast(HashJoin|NestedLoopJoin|Exchange)\b/
const PARTITION_RE = /partitioning\([^)]*,\s*(\d+)\)|numPartitions\s*=\s*(\d+)/

/**
 * Parses a Spark `df.explain()` / `EXPLAIN` physical plan (same `+- ` indentation style as a
 * Maven dependency tree) and flags the operators that actually explain a slow query: shuffle
 * boundaries (Exchange — a stage barrier), broadcast joins, and partition counts.
 *
 * Known limitation: for a multi-child node (a join with two branches), Spark uses a ':' column
 * to keep drawing the "sibling still coming" line through the first branch's whole subtree —
 * a real box-drawing tree, not simple prefix-length nesting. This parser gets shuffle/broadcast
 * detection and counts right regardless, but a join's two branches can render one level shallower
 * than their true depth. Getting that byte-exact needs column-by-column processing across
 * sibling lines, which isn't worth the complexity for what this tool is for.
 */
// Spark's own indentation marker set: '+' and '\' for branches like Maven/Gradle, but also ':'
// for a "this join has another sibling below" continuation column that neither of those use.
const SPARK_MARKER = /^([|:+\\ ]*[+\\]-+\s*)/

export function parseSparkPlan(text: string): PlanNode[] {
  // Strip "== Physical Plan ==" style banner lines and blanks; keep everything else, including
  // the true root line (which has no +/- marker of its own).
  const treeText = text
    .split('\n')
    .filter((l) => l.trim() !== '' && !/^==.*==$/.test(l.trim()))
    .join('\n')

  const nodes = parseIndentTree(treeText, SPARK_MARKER)
  return annotate(nodes)
}

function annotate(nodes: IndentNode[]): PlanNode[] {
  return nodes.map((n) => {
    const partitionMatch = n.text.match(PARTITION_RE)
    const partitions = partitionMatch ? Number(partitionMatch[1] ?? partitionMatch[2]) : null
    return {
      ...n,
      isShuffle: SHUFFLE_RE.test(n.text),
      isBroadcast: BROADCAST_RE.test(n.text),
      partitions,
      children: annotate(n.children),
    }
  })
}

export function countShuffles(nodes: PlanNode[]): number {
  let count = 0
  const walk = (n: PlanNode) => {
    if (n.isShuffle) count++
    n.children.forEach(walk)
  }
  nodes.forEach(walk)
  return count
}
