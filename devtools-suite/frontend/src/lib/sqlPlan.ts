import type { QueryResult } from './sqlApi'

export type PlanNode = {
  label: string
  detail: string
  depth: number
  children: PlanNode[]
}

export type ParsedPlan =
  | { kind: 'tree'; roots: PlanNode[] }
  | { kind: 'steps'; columns: string[]; rows: unknown[][] }
  | null

const COST_RE = /cost=([\d.]+)\.\.([\d.]+)\s+rows=(\d+)\s+width=(\d+)/i

/** Postgres/SQLite/H2-style single-column text plan, e.g. "  ->  Seq Scan on orders  (cost=0.00..1.05 rows=5 width=40)". */
function parseTextPlan(lines: string[]): PlanNode[] {
  const roots: PlanNode[] = []
  const stack: PlanNode[] = []

  for (const raw of lines) {
    if (!raw.trim()) continue
    const indent = raw.match(/^\s*/)?.[0].length ?? 0
    const withoutArrow = raw.replace(/^\s*->\s*/, '')
    const depth = raw.includes('->') ? Math.floor(indent / 2) + 1 : Math.floor(indent / 2)

    const costMatch = raw.match(COST_RE)
    const label = withoutArrow.replace(COST_RE, '').replace(/\(\s*\)/, '').trim()
    const detail = costMatch
      ? `cost ${costMatch[1]}–${costMatch[2]} · ~${costMatch[3]} rows · width ${costMatch[4]}`
      : ''

    const node: PlanNode = { label: label || withoutArrow.trim(), detail, depth, children: [] }

    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop()
    if (stack.length) stack[stack.length - 1].children.push(node)
    else roots.push(node)
    stack.push(node)
  }

  return roots
}

export function parseExplainPlan(result: QueryResult): ParsedPlan {
  if (result.statementType !== 'EXPLAIN' || result.rows.length === 0) return null

  if (result.columns.length === 1) {
    const lines = result.rows.map((r) => String(r[0] ?? ''))
    const roots = parseTextPlan(lines)
    return roots.length ? { kind: 'tree', roots } : null
  }

  return { kind: 'steps', columns: result.columns, rows: result.rows }
}
