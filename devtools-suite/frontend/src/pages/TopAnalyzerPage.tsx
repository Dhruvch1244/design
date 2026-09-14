import { useMemo, useState } from 'react'
import { diffSnapshots, parseProcessSnapshot } from '../lib/topParser'
import { Panel, SectionLabel, Toggle } from '../components/ui'

export function TopAnalyzerPage() {
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')
  const [compareMode, setCompareMode] = useState(false)
  const [sortBy, setSortBy] = useState<'cpu' | 'mem'>('cpu')

  const rowsBefore = useMemo(() => parseProcessSnapshot(before), [before])
  const rowsAfter = useMemo(() => parseProcessSnapshot(after), [after])

  const sorted = useMemo(() => [...rowsBefore].sort((a, b) => (sortBy === 'cpu' ? b.cpu - a.cpu : b.mem - a.mem)), [rowsBefore, sortBy])
  const diffs = useMemo(() => diffSnapshots(rowsBefore, rowsAfter), [rowsBefore, rowsAfter])

  return (
    <div className="flex h-full flex-col gap-4">
      <Panel>
        <div className="flex items-center gap-4 p-4">
          <Toggle checked={compareMode} onChange={setCompareMode} label="Compare before / after (e.g. around a deploy)" />
          {!compareMode && (
            <div className="ml-auto flex items-center gap-2 text-xs text-ink-faint">
              Sort by
              {(['cpu', 'mem'] as const).map((s) => (
                <button key={s} onClick={() => setSortBy(s)} className={`rounded-full px-2 py-0.5 ${sortBy === s ? 'bg-white/[0.08] text-ink' : ''}`}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <div className={`grid flex-1 gap-4 overflow-hidden ${compareMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>{compareMode ? 'Before' : 'Paste `top -b -n1` or `ps aux` output'}</SectionLabel>
            <textarea
              value={before}
              onChange={(e) => setBefore(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[11.5px] leading-relaxed text-ink outline-none focus:border-cyan/50"
            />
          </div>
        </Panel>
        {compareMode && (
          <Panel className="flex flex-col overflow-hidden">
            <div className="flex flex-1 flex-col p-4">
              <SectionLabel>After</SectionLabel>
              <textarea
                value={after}
                onChange={(e) => setAfter(e.target.value)}
                spellCheck={false}
                className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[11.5px] leading-relaxed text-ink outline-none focus:border-cyan/50"
              />
            </div>
          </Panel>
        )}
      </div>

      <Panel className="flex max-h-72 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {compareMode ? (
            diffs.length === 0 ? (
              <div className="text-sm text-ink-faint">Paste both snapshots to see the delta per process.</div>
            ) : (
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wide text-ink-faint">
                    <th className="py-1">PID</th><th>Command</th><th>CPU before → after</th><th>Δ CPU</th><th>Δ MEM</th>
                  </tr>
                </thead>
                <tbody>
                  {diffs.map((d) => (
                    <tr key={d.pid} className="border-t border-rule-soft">
                      <td className="py-1 font-mono text-ink-faint">{d.pid}</td>
                      <td className="font-mono text-ink-soft">{d.command}</td>
                      <td className="font-mono text-ink-faint">{d.before}% → {d.after}%</td>
                      <td className={`font-mono ${d.cpuDelta > 5 ? 'text-rose' : d.cpuDelta < -5 ? 'text-emerald' : 'text-ink-faint'}`}>{d.cpuDelta > 0 ? '+' : ''}{d.cpuDelta.toFixed(1)}</td>
                      <td className="font-mono text-ink-faint">{d.memDelta > 0 ? '+' : ''}{d.memDelta.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : sorted.length === 0 ? (
            <div className="text-sm text-ink-faint">Paste a snapshot above to see the sorted process table.</div>
          ) : (
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-ink-faint">
                  <th className="py-1">PID</th><th>User</th><th>Command</th><th>%CPU</th><th>%MEM</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.pid} className="border-t border-rule-soft">
                    <td className="py-1 font-mono text-ink-faint">{r.pid}</td>
                    <td className="font-mono text-ink-faint">{r.user}</td>
                    <td className="font-mono text-ink-soft">{r.command}</td>
                    <td className={`font-mono ${r.cpu > 50 ? 'text-rose' : r.cpu > 20 ? 'text-warm' : 'text-ink-faint'}`}>{r.cpu.toFixed(1)}</td>
                    <td className={`font-mono ${r.mem > 50 ? 'text-rose' : r.mem > 20 ? 'text-warm' : 'text-ink-faint'}`}>{r.mem.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>
    </div>
  )
}
