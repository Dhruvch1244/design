import { useMemo, useState } from 'react'
import { countShuffles, parseSparkPlan, type PlanNode } from '../lib/sparkPlan'
import { Panel, SectionLabel } from '../components/ui'

const SAMPLE = `== Physical Plan ==
*(2) HashAggregate(keys=[id#10], functions=[count(1)])
+- Exchange hashpartitioning(id#10, 200)
   +- *(1) HashAggregate(keys=[id#10], functions=[partial_count(1)])
      +- *(1) Project [id#10]
         +- *(1) BroadcastHashJoin [id#10], [id#20], Inner, BuildRight
            :- *(1) Filter isnotnull(id#10)
            :  +- *(1) FileScan parquet default.orders[id#10] Batched: true
            +- BroadcastExchange HashedRelationBroadcastMode
               +- *(1) FileScan parquet default.regions[id#20] Batched: true`

export function SparkPlanPage() {
  const [text, setText] = useState(SAMPLE)
  const nodes = useMemo(() => parseSparkPlan(text), [text])
  const shuffleCount = useMemo(() => countShuffles(nodes), [nodes])

  return (
    <div className="flex h-full gap-4">
      <Panel className="flex w-96 shrink-0 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col p-4">
          <SectionLabel>Paste a Spark physical plan (`df.explain()` output)</SectionLabel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[11.5px] leading-relaxed text-ink outline-none focus:border-cyan/50"
          />
        </div>
      </Panel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {nodes.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">Paste a physical plan on the left.</div>
          ) : (
            <>
              {shuffleCount > 0 && (
                <div className="mb-3 rounded-xl border border-warm/30 bg-warm/[0.06] px-3 py-2 text-xs text-warm">
                  {shuffleCount} shuffle boundary{shuffleCount === 1 ? '' : 'ies'} (Exchange) — each is a stage barrier where data is repartitioned across the cluster.
                </div>
              )}
              <Tree nodes={nodes} />
            </>
          )}
        </div>
      </Panel>
    </div>
  )
}

function Tree({ nodes }: { nodes: PlanNode[] }) {
  return (
    <div className="flex flex-col">
      {nodes.map((n, i) => (
        <div key={i}>
          <div
            style={{ paddingLeft: n.depth * 18 }}
            className={`flex items-center gap-2 whitespace-pre-wrap break-all py-0.5 font-mono text-[12px] ${
              n.isShuffle ? 'text-warm' : n.isBroadcast ? 'text-cyan' : 'text-ink-soft'
            }`}
          >
            {n.isShuffle && <span className="rounded bg-warm/20 px-1 text-[9px] font-bold uppercase">shuffle</span>}
            {n.isBroadcast && <span className="rounded bg-cyan/20 px-1 text-[9px] font-bold uppercase">broadcast</span>}
            {n.partitions != null && <span className="text-[10px] text-ink-faint">{n.partitions} partitions</span>}
            {n.text}
          </div>
          <Tree nodes={n.children} />
        </div>
      ))}
    </div>
  )
}
