import { useEffect, useMemo, useState } from 'react'
import { UploadSimple } from '@phosphor-icons/react'
import { harSummary, parseHar, type HarRequest } from '../lib/har'
import { Panel, ErrorBanner, Button } from '../components/ui'

const DRAFT_KEY = 'devtools.har-analyzer-draft'

const SAMPLE = JSON.stringify(
  {
    log: {
      entries: [
        { startedDateTime: '2024-01-01T00:00:00.000Z', time: 42, request: { method: 'GET', url: 'https://api.example.com/orders' }, response: { status: 200, content: { size: 4200, mimeType: 'application/json' } } },
        { startedDateTime: '2024-01-01T00:00:00.050Z', time: 180, request: { method: 'GET', url: 'https://api.example.com/orders/42/items' }, response: { status: 200, content: { size: 1800, mimeType: 'application/json' } } },
        { startedDateTime: '2024-01-01T00:00:00.230Z', time: 12, request: { method: 'GET', url: 'https://cdn.example.com/logo.png' }, response: { status: 304, content: { size: 0, mimeType: 'image/png' } } },
        { startedDateTime: '2024-01-01T00:00:00.400Z', time: 95, request: { method: 'POST', url: 'https://api.example.com/orders' }, response: { status: 500, content: { size: 90, mimeType: 'application/json' } } },
      ],
    },
  },
  null,
  2
)

export function HarAnalyzerPage() {
  const [text, setText] = useState(() => localStorage.getItem(DRAFT_KEY) ?? '')
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'time' | 'size' | 'offset'>('offset')

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(DRAFT_KEY, text), 400)
    return () => clearTimeout(t)
  }, [text])

  const requests = useMemo<HarRequest[]>(() => {
    if (!text.trim()) return []
    try {
      setError(null)
      return parseHar(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid HAR')
      return []
    }
  }, [text])

  const summary = useMemo(() => harSummary(requests), [requests])
  const maxTime = summary.totalTime || 1

  const sorted = useMemo(() => {
    const copy = [...requests]
    if (sortBy === 'time') copy.sort((a, b) => b.timeMs - a.timeMs)
    else if (sortBy === 'size') copy.sort((a, b) => b.sizeBytes - a.sizeBytes)
    else copy.sort((a, b) => a.startOffsetMs - b.startOffsetMs)
    return copy
  }, [requests, sortBy])

  async function handleFile(file: File) {
    setText(await file.text())
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Panel>
        <div className="flex items-center gap-3 p-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule px-3 py-2.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink">
            <UploadSimple size={14} weight="light" />
            Load a .har file
            <input type="file" accept=".har,application/json" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
          <Button variant="ghost" onClick={() => setText(SAMPLE)}>Try a sample</Button>
          {requests.length > 0 && (
            <div className="flex flex-1 items-center justify-end gap-4 text-xs text-ink-soft">
              <span>{summary.count} requests</span>
              <span>{(summary.totalBytes / 1024).toFixed(0)} KB</span>
              <span>{(summary.totalTime / 1000).toFixed(2)}s total</span>
              {summary.failed > 0 && <span className="text-rose">{summary.failed} failed</span>}
              {summary.duplicates.length > 0 && <span className="text-warm">{summary.duplicates.length} duplicate URLs</span>}
            </div>
          )}
        </div>
      </Panel>

      {error && <ErrorBanner message={error} />}

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {requests.length === 0 && !error && (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">Load a HAR export (captured from your browser's Network tab) to see the waterfall.</div>
          )}
          {requests.length > 0 && (
            <>
              <div className="mb-2 flex items-center gap-2 text-[11px] text-ink-faint">
                Sort by
                {(['offset', 'time', 'size'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`rounded-full px-2 py-0.5 ${sortBy === s ? 'bg-white/[0.08] text-ink' : 'hover:text-ink-soft'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {sorted.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-1 text-[11.5px] hover:bg-white/[0.02]">
                    <span className={`w-10 shrink-0 text-right font-mono ${r.status >= 400 || r.status === 0 ? 'text-rose' : r.status >= 300 ? 'text-warm' : 'text-emerald'}`}>
                      {r.status || '—'}
                    </span>
                    <span className="w-14 shrink-0 truncate font-mono text-ink-faint">{r.method}</span>
                    <span className="w-64 shrink-0 truncate font-mono text-ink-soft" title={r.url}>
                      {r.url.replace(/^https?:\/\//, '')}
                    </span>
                    <div className="relative h-3 flex-1 rounded bg-white/[0.03]">
                      <div
                        className="absolute top-0 h-3 rounded bg-cyan/50"
                        style={{
                          left: `${(r.startOffsetMs / maxTime) * 100}%`,
                          width: `${Math.max((r.timeMs / maxTime) * 100, 0.4)}%`,
                        }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono text-ink-faint">{r.timeMs.toFixed(0)}ms</span>
                    <span className="w-16 shrink-0 text-right font-mono text-ink-faint">{(r.sizeBytes / 1024).toFixed(1)}KB</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Panel>
    </div>
  )
}
