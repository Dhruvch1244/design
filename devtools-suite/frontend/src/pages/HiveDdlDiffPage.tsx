import { useMemo, useState } from 'react'
import { parseCreateTable } from '../lib/hiveDdl'
import { diffFlat } from '../lib/springConfig'
import { Panel, SectionLabel } from '../components/ui'

const SAMPLE_A = `CREATE TABLE orders (
  id INT,
  total FLOAT,
  status STRING
)
STORED AS PARQUET;`

const SAMPLE_B = `CREATE TABLE orders (
  id BIGINT,
  total DOUBLE,
  status STRING,
  created_at TIMESTAMP
)
STORED AS PARQUET;`

export function HiveDdlDiffPage() {
  const [ddlA, setDdlA] = useState(SAMPLE_A)
  const [ddlB, setDdlB] = useState(SAMPLE_B)

  const columnsA = useMemo(() => parseCreateTable(ddlA), [ddlA])
  const columnsB = useMemo(() => parseCreateTable(ddlB), [ddlB])
  const rows = useMemo(() => diffFlat(columnsA, columnsB), [columnsA, columnsB])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Table A</SectionLabel>
            <textarea
              value={ddlA}
              onChange={(e) => setDdlA(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] text-ink outline-none focus:border-cyan/50"
            />
          </div>
        </Panel>
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Table B</SectionLabel>
            <textarea
              value={ddlB}
              onChange={(e) => setDdlB(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] text-ink outline-none focus:border-cyan/50"
            />
          </div>
        </Panel>
      </div>

      <Panel className="max-h-64 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <SectionLabel>Column diff</SectionLabel>
          <div className="flex flex-col gap-0.5 font-mono text-[12px]">
            {rows.map((r) => (
              <div
                key={r.key}
                className={r.status === 'same' ? 'text-ink-faint' : r.status === 'onlyA' ? 'text-rose' : r.status === 'onlyB' ? 'text-emerald' : 'text-warm'}
              >
                {r.key}: {r.a ?? '—'} {r.status !== 'same' && '→'} {r.status !== 'same' ? r.b ?? '—' : ''}
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  )
}
