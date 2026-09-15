import { useMemo, useState } from 'react'
import {
  diffFlat,
  flatToProperties,
  flatToYaml,
  parsePropertiesToFlat,
  parseYamlToFlat,
  resolvePlaceholders,
  type FlatMap,
} from '../lib/springConfig'
import { Panel, SectionLabel, ErrorBanner, CopyButton } from '../components/ui'

type Format = 'yaml' | 'properties'

function parse(text: string, format: Format): { flat: FlatMap; error: string | null } {
  if (!text.trim()) return { flat: {}, error: null }
  try {
    return { flat: format === 'yaml' ? parseYamlToFlat(text) : parsePropertiesToFlat(text), error: null }
  } catch (e) {
    return { flat: {}, error: e instanceof Error ? e.message : 'Parse failed' }
  }
}

export function SpringConfigPage() {
  const [format, setFormat] = useState<Format>('yaml')
  const [textA, setTextA] = useState('server:\n  port: 8080\napp:\n  name: myapp\n  greeting: "Hello, ${app.name}!"')
  const [textB, setTextB] = useState('')

  const a = parse(textA, format)
  const b = parse(textB, format)
  const rows = useMemo(() => diffFlat(a.flat, b.flat), [a.flat, b.flat])
  const resolvedA = useMemo(() => resolvePlaceholders(a.flat), [a.flat])

  const converted = format === 'yaml' ? flatToProperties(a.flat) : flatToYaml(a.flat)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex gap-1 rounded-2xl border border-rule bg-panel p-1">
        {(['yaml', 'properties'] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`flex-1 rounded-xl py-2 text-xs font-medium transition-colors ${
              format === f ? 'bg-white/[0.08] text-ink' : 'text-ink-faint hover:text-ink-soft'
            }`}
          >
            {f === 'yaml' ? 'YAML' : 'Properties'}
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Profile A</SectionLabel>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[13px] text-ink outline-none focus:border-cyan/50"
            />
            {a.error && <ErrorBanner message={a.error} />}
          </div>
        </Panel>
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Profile B (optional — leave blank to just resolve/convert A)</SectionLabel>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[13px] text-ink outline-none focus:border-cyan/50"
            />
            {b.error && <ErrorBanner message={b.error} />}
          </div>
        </Panel>
      </div>

      <div className="grid max-h-64 grid-cols-2 gap-4">
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <SectionLabel>{textB.trim() ? 'Diff (A vs B)' : `Resolved placeholders (A)${resolvedA.unresolved.length ? ' — ' + resolvedA.unresolved.length + ' unresolved' : ''}`}</SectionLabel>
            <div className="flex flex-col gap-0.5 font-mono text-[11.5px]">
              {textB.trim()
                ? rows
                    .filter((r) => r.status !== 'same')
                    .map((r) => (
                      <div key={r.key} className={r.status === 'onlyA' ? 'text-rose' : r.status === 'onlyB' ? 'text-emerald' : 'text-warm'}>
                        {r.key}: {r.a ?? '—'} → {r.b ?? '—'}
                      </div>
                    ))
                : Object.entries(resolvedA.resolved).map(([k, v]) => (
                    <div key={k} className={resolvedA.unresolved.some((u) => v.includes('${' + u)) ? 'text-rose' : 'text-ink-soft'}>
                      {k} = {v}
                    </div>
                  ))}
            </div>
          </div>
        </Panel>
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-1 flex items-center justify-between">
              <SectionLabel>Converted to {format === 'yaml' ? 'properties' : 'YAML'}</SectionLabel>
              <CopyButton text={converted} />
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[11.5px] text-ink-soft">{converted}</pre>
          </div>
        </Panel>
      </div>
    </div>
  )
}
