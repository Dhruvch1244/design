import { useState } from 'react'
import { Panel, SectionLabel, Button, ErrorBanner } from '../components/ui'

type CorsResult = {
  preflightStatus: number
  preflightHeaders: Record<string, string[]>
  actualStatus: number
  actualHeaders: Record<string, string[]>
  verdict: { preflightRequired: boolean; wouldBeAllowed: boolean; reasons: string[] }
}

export function CorsCheckPage() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [origin, setOrigin] = useState('https://myapp.local')
  const [requestHeaders, setRequestHeaders] = useState('')
  const [result, setResult] = useState<CorsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/web/cors-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, method, origin, requestHeaders }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({ error: res.statusText }))).error)
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full gap-4">
      <div className="flex w-96 shrink-0 flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-2 p-4">
            <SectionLabel>Target URL</SectionLabel>
            <input className="devtools-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/orders" />
            <SectionLabel>Method</SectionLabel>
            <select className="devtools-input" value={method} onChange={(e) => setMethod(e.target.value)}>
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <SectionLabel>Origin your app sends</SectionLabel>
            <input className="devtools-input" value={origin} onChange={(e) => setOrigin(e.target.value)} />
            <SectionLabel>Custom request headers (comma-separated)</SectionLabel>
            <input className="devtools-input" value={requestHeaders} onChange={(e) => setRequestHeaders(e.target.value)} placeholder="Authorization, X-Custom" />
            <Button variant="primary" className="mt-1" onClick={run} disabled={!url || loading}>
              {loading ? 'Checking…' : 'Check CORS'}
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {error && <ErrorBanner message={error} />}
          {!result && !error && (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">Fetches the URL server-side — including the OPTIONS preflight — since a browser can't read blocked CORS headers itself.</div>
          )}
          {result && (
            <div className="flex flex-col gap-4">
              <div className={`rounded-2xl border p-4 ${result.verdict.wouldBeAllowed ? 'border-emerald/30 bg-emerald/[0.06]' : 'border-rose/30 bg-rose/[0.06]'}`}>
                <div className={`mb-2 text-sm font-medium ${result.verdict.wouldBeAllowed ? 'text-emerald' : 'text-rose'}`}>
                  {result.verdict.wouldBeAllowed ? 'Would be allowed' : 'Would be blocked'}
                  {result.verdict.preflightRequired ? ' (preflight required)' : ' (simple request, no preflight)'}
                </div>
                <ul className="flex flex-col gap-1 text-xs text-ink-soft">
                  {result.verdict.reasons.map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>

              {result.verdict.preflightRequired && (
                <div className="rounded-2xl border border-rule bg-void/70 p-4">
                  <div className="mb-2 text-xs font-medium text-ink-soft">Preflight (OPTIONS) — status {result.preflightStatus || 'no response'}</div>
                  <HeaderList headers={result.preflightHeaders} />
                </div>
              )}

              <div className="rounded-2xl border border-rule bg-void/70 p-4">
                <div className="mb-2 text-xs font-medium text-ink-soft">Actual request — status {result.actualStatus}</div>
                <HeaderList headers={result.actualHeaders} />
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

function HeaderList({ headers }: { headers: Record<string, string[]> }) {
  const entries = Object.entries(headers)
  if (entries.length === 0) return <div className="text-xs text-ink-faint">No headers.</div>
  return (
    <div className="flex flex-col gap-0.5 font-mono text-[11.5px]">
      {entries.map(([k, v]) => (
        <div key={k} className={k.toLowerCase().startsWith('access-control') ? 'text-cyan' : 'text-ink-soft'}>
          {k}: {v.join(', ')}
        </div>
      ))}
    </div>
  )
}
