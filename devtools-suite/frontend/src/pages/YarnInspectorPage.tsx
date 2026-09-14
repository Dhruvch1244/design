import { useMemo, useState } from 'react'
import { parseYarnCliOutput, summarizeDiagnostics } from '../lib/yarn'
import { Panel, SectionLabel, Button, ErrorBanner } from '../components/ui'

const SAMPLE_STATUS = `Application Report :
	Application-Id : application_1694700000000_0001
	Application-Name : MyETLJob
	Application-Type : SPARK
	User : hadoop
	Queue : default
	Start-Time : 1694700000000
	Finish-Time : 0
	Progress : 45%
	State : RUNNING
	Final-State : UNDEFINED
	Tracking-URL : http://rm.local:8088/proxy/application_1694700000000_0001/
	Diagnostics : `

type Tab = 'offline' | 'live'

export function YarnInspectorPage() {
  const [tab, setTab] = useState<Tab>('offline')
  const [text, setText] = useState(SAMPLE_STATUS)

  const [rmBaseUrl, setRmBaseUrl] = useState('http://localhost:8088')
  const [applicationId, setApplicationId] = useState('')
  const [liveResult, setLiveResult] = useState<Record<string, unknown> | null>(null)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const parsed = useMemo(() => parseYarnCliOutput(text), [text])

  async function fetchLive() {
    setLoading(true)
    setLiveError(null)
    try {
      const res = await fetch('/api/web/yarn-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rmBaseUrl, applicationId }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({ error: res.statusText }))).error)
      setLiveResult(await res.json())
    } catch (e) {
      setLiveError(e instanceof Error ? e.message : 'Fetch failed')
      setLiveResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex gap-1 rounded-2xl border border-rule bg-void/70 p-1">
        <button onClick={() => setTab('offline')} className={`flex-1 rounded-xl py-2 text-xs font-medium ${tab === 'offline' ? 'bg-white/[0.08] text-ink' : 'text-ink-faint'}`}>
          Offline (paste CLI output)
        </button>
        <button onClick={() => setTab('live')} className={`flex-1 rounded-xl py-2 text-xs font-medium ${tab === 'live' ? 'bg-white/[0.08] text-ink' : 'text-ink-faint'}`}>
          Live (query ResourceManager)
        </button>
      </div>

      {tab === 'offline' ? (
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
          <Panel className="flex flex-col overflow-hidden">
            <div className="flex flex-1 flex-col p-4">
              <SectionLabel>Paste `yarn application -status &lt;id&gt;` or `-list` output</SectionLabel>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[11.5px] leading-relaxed text-ink outline-none focus:border-cyan/50"
              />
            </div>
          </Panel>

          <Panel className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
              {parsed.mode === 'unknown' && <div className="text-sm text-ink-faint">Paste `-status` or `-list` output on the left.</div>}
              {parsed.mode === 'status' && <StatusView status={parsed.status} />}
              {parsed.mode === 'list' && (
                <table className="w-full text-left text-[11.5px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wide text-ink-faint">
                      {Object.keys(parsed.rows[0] ?? {}).map((h) => <th key={h} className="py-1 pr-3">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.map((row, i) => (
                      <tr key={i} className="border-t border-rule-soft">
                        {Object.entries(row).map(([k, v]) => (
                          <td key={k} className={`py-1 pr-3 font-mono ${k === 'State' && v === 'RUNNING' ? 'text-emerald' : k === 'State' && v === 'FAILED' ? 'text-rose' : 'text-ink-soft'}`}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <Panel>
            <div className="flex items-center gap-3 p-4">
              <input className="devtools-input flex-1" value={rmBaseUrl} onChange={(e) => setRmBaseUrl(e.target.value)} placeholder="http://resourcemanager:8088" />
              <input className="devtools-input flex-1 font-mono" value={applicationId} onChange={(e) => setApplicationId(e.target.value)} placeholder="application_1694700000000_0001" />
              <Button variant="primary" onClick={fetchLive} disabled={!rmBaseUrl || !applicationId || loading}>
                {loading ? 'Fetching…' : 'Fetch'}
              </Button>
            </div>
          </Panel>
          <Panel className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
              {liveError && <ErrorBanner message={liveError} />}
              {!liveResult && !liveError && (
                <div className="flex h-full items-center justify-center text-sm text-ink-faint">
                  Fetched server-side (the RM UI is almost always on an internal network the browser can't reach directly).
                </div>
              )}
              {liveResult && <StatusView status={Object.fromEntries(Object.entries(liveResult).map(([k, v]) => [k, String(v)]))} />}
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}

function StatusView({ status }: { status: Record<string, string> }) {
  const diag = summarizeDiagnostics(status.Diagnostics ?? status.diagnostics)
  return (
    <div className="flex flex-col gap-1.5 text-[12.5px]">
      {Object.entries(status)
        .filter(([k]) => !/diagnostics/i.test(k))
        .map(([k, v]) => (
          <div key={k} className="flex justify-between rounded-lg bg-white/[0.02] px-2.5 py-1.5">
            <span className="text-ink-faint">{k}</span>
            <span className={`font-mono ${k === 'State' ? (v === 'RUNNING' ? 'text-emerald' : v === 'FAILED' ? 'text-rose' : 'text-ink') : 'text-ink'}`}>{v}</span>
          </div>
        ))}
      {diag && (
        <div className="mt-2 rounded-lg border border-warm/25 bg-warm/[0.06] px-2.5 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-warm">Diagnostics ({diag.fullLineCount} lines)</div>
          <div className="font-mono text-[11.5px] text-ink-soft">{diag.headline}</div>
        </div>
      )}
    </div>
  )
}
