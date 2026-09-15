import { useState } from 'react'
import { fakePerson, nanoid, ulid } from '../lib/generators'
import { Panel, SectionLabel, Button, CopyButton } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

type Kind = 'uuid' | 'ulid' | 'nanoid' | 'person'

export function DataGeneratorPage() {
  const [kind, setKind] = useState<Kind>('uuid')
  const [count, setCount] = useState(10)
  const [format, setFormat] = useState<'lines' | 'csv' | 'sql'>('lines')
  const [tableName, setTableName] = useState('generated')
  const [rows, setRows] = useState<Record<string, string>[]>([])

  function generate() {
    const out: Record<string, string>[] = []
    for (let i = 0; i < count; i++) {
      if (kind === 'uuid') out.push({ value: crypto.randomUUID() })
      else if (kind === 'ulid') out.push({ value: ulid() })
      else if (kind === 'nanoid') out.push({ value: nanoid() })
      else {
        const p = fakePerson()
        out.push({ name: p.name, email: p.email, address: p.address })
      }
    }
    setRows(out)
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : []

  const output =
    format === 'lines'
      ? rows.map((r) => columns.map((c) => r[c]).join('\t')).join('\n')
      : format === 'csv'
        ? [columns.join(','), ...rows.map((r) => columns.map((c) => `"${r[c].replace(/"/g, '""')}"`).join(','))].join('\n')
        : rows
            .map(
              (r) =>
                `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map((c) => `'${r[c].replace(/'/g, "''")}'`).join(', ')});`
            )
            .join('\n')

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="data-gen" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-2 p-4">
            <SectionLabel>Type</SectionLabel>
            {(
              [
                ['uuid', 'UUID v4'],
                ['ulid', 'ULID'],
                ['nanoid', 'nanoid'],
                ['person', 'Fake person (name/email/address)'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setKind(id)}
                className={`rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                  kind === id ? 'bg-white/[0.08] text-ink' : 'text-ink-soft hover:bg-white/[0.04]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-2 p-4">
            <SectionLabel>Count</SectionLabel>
            <input type="number" min={1} max={5000} className="devtools-input" value={count} onChange={(e) => setCount(Number(e.target.value) || 1)} />

            <SectionLabel>Output format</SectionLabel>
            <select className="devtools-input" value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
              <option value="lines">Tab-separated lines</option>
              <option value="csv">CSV</option>
              <option value="sql">SQL INSERT</option>
            </select>

            {format === 'sql' && (
              <input className="devtools-input" value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="table name" />
            )}

            <Button variant="primary" className="mt-1" onClick={generate}>
              Generate {count}
            </Button>
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <SectionLabel>Output</SectionLabel>
            <CopyButton text={output} />
          </div>
          <textarea readOnly value={output} spellCheck={false} className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] text-ink outline-none" />
        </div>
      </Panel>
    </div>
  )
}
