import type { ParsedPlan, PlanNode } from '../lib/sqlPlan'

export function PlanView({ plan }: { plan: ParsedPlan }) {
  if (!plan) return null

  if (plan.kind === 'tree') {
    return (
      <div className="flex flex-col gap-1.5 rounded-2xl border border-rule bg-panel p-3.5">
        {plan.roots.map((n, i) => (
          <PlanNodeView key={i} node={n} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 overflow-x-auto rounded-2xl border border-rule bg-panel p-3.5">
      <div className="flex gap-2">
        {plan.rows.map((row, i) => (
          <div key={i} className="flex min-w-[10rem] shrink-0 flex-col gap-1 rounded-xl border border-rule-soft bg-white/[0.02] p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-ink-faint">Step {i + 1}</div>
            {row.map((cell, ci) =>
              cell === null || cell === '' ? null : (
                <div key={ci} className="text-[11.5px] text-ink-soft">
                  <span className="text-ink-faint">{plan.columns[ci]}: </span>
                  <span className="font-mono text-ink">{String(cell)}</span>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanNodeView({ node }: { node: PlanNode }) {
  return (
    <div>
      <div
        style={{ marginLeft: node.depth * 20 }}
        className="flex items-center gap-2 rounded-lg border border-rule-soft bg-white/[0.02] px-2.5 py-1.5"
      >
        <span className="font-mono text-[12.5px] text-ink">{node.label}</span>
        {node.detail && <span className="text-[10.5px] text-ink-faint">{node.detail}</span>}
      </div>
      <div className="flex flex-col gap-1.5 pt-1.5">
        {node.children.map((c, i) => (
          <PlanNodeView key={i} node={c} />
        ))}
      </div>
    </div>
  )
}
