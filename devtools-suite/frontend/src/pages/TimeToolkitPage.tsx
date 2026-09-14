import { useMemo, useState } from 'react'
import { describeCron, nextRuns } from '../lib/cron'
import { Panel, SectionLabel, Button, ErrorBanner, CopyButton } from '../components/ui'

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London',
  'Europe/Berlin', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney',
]

export function TimeToolkitPage() {
  const [epoch, setEpoch] = useState(String(Math.floor(Date.now() / 1000)))
  const [iso, setIso] = useState(new Date().toISOString())
  const [tz, setTz] = useState('UTC')

  const [durFrom, setDurFrom] = useState(new Date(Date.now() - 3600_000).toISOString())
  const [durTo, setDurTo] = useState(new Date().toISOString())

  const [cronExpr, setCronExpr] = useState('*/15 * * * *')

  const epochDate = useMemo(() => {
    const n = Number(epoch)
    if (Number.isNaN(n)) return null
    return new Date(n > 1e12 ? n : n * 1000)
  }, [epoch])

  const isoDate = useMemo(() => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? null : d
  }, [iso])

  const zoned = useMemo(() => {
    const d = isoDate ?? epochDate
    if (!d) return null
    try {
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: tz }).format(d)
    } catch {
      return null
    }
  }, [isoDate, epochDate, tz])

  const durationMs = useMemo(() => {
    const a = new Date(durFrom).getTime()
    const b = new Date(durTo).getTime()
    return Number.isNaN(a) || Number.isNaN(b) ? null : b - a
  }, [durFrom, durTo])

  const cronRuns = useMemo(() => {
    try {
      return { runs: nextRuns(cronExpr, 5), error: null as string | null }
    } catch (e) {
      return { runs: [], error: e instanceof Error ? e.message : 'Invalid cron' }
    }
  }, [cronExpr])

  return (
    <div className="grid h-full grid-cols-2 gap-4 overflow-auto">
      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Epoch ↔ ISO</SectionLabel>
          <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
            Epoch (seconds or ms)
            <input className="devtools-input font-mono" value={epoch} onChange={(e) => setEpoch(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
            ISO 8601
            <input className="devtools-input font-mono" value={iso} onChange={(e) => setIso(e.target.value)} />
          </label>
          <Button variant="ghost" onClick={() => setIso(epochDate ? epochDate.toISOString() : iso)}>
            Epoch → ISO
          </Button>
          <Button variant="ghost" onClick={() => setEpoch(isoDate ? String(Math.floor(isoDate.getTime() / 1000)) : epoch)}>
            ISO → Epoch
          </Button>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Timezone view</SectionLabel>
          <select className="devtools-input" value={tz} onChange={(e) => setTz(e.target.value)}>
            {TIMEZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <div className="rounded-xl border border-rule-soft bg-white/[0.02] p-3 text-sm text-ink">
            {zoned ?? 'Enter a valid epoch or ISO value above'}
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Duration between two timestamps</SectionLabel>
          <input className="devtools-input font-mono" value={durFrom} onChange={(e) => setDurFrom(e.target.value)} />
          <input className="devtools-input font-mono" value={durTo} onChange={(e) => setDurTo(e.target.value)} />
          <div className="rounded-xl border border-rule-soft bg-white/[0.02] p-3 text-sm text-ink">
            {durationMs == null ? 'Invalid timestamps' : formatDuration(durationMs)}
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Cron explainer</SectionLabel>
          <input
            className="devtools-input font-mono"
            value={cronExpr}
            onChange={(e) => setCronExpr(e.target.value)}
            placeholder="*/15 * * * *"
          />
          {cronRuns.error ? (
            <ErrorBanner message={cronRuns.error} />
          ) : (
            <>
              <div className="text-sm text-ink-soft">{describeCron(cronExpr)}</div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-ink-faint">
                  Next 5 runs
                  <CopyButton text={cronRuns.runs.map((r) => r.toLocaleString()).join('\n')} />
                </div>
                <div className="flex flex-col gap-1">
                  {cronRuns.runs.map((r, i) => (
                    <div key={i} className="rounded-lg border border-rule-soft bg-white/[0.02] px-2.5 py-1.5 font-mono text-xs text-ink">
                      {r.toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Panel>
    </div>
  )
}

function formatDuration(ms: number): string {
  const sign = ms < 0 ? '-' : ''
  const abs = Math.abs(ms)
  const s = Math.floor(abs / 1000) % 60
  const m = Math.floor(abs / 60_000) % 60
  const h = Math.floor(abs / 3_600_000) % 24
  const d = Math.floor(abs / 86_400_000)
  return `${sign}${d}d ${h}h ${m}m ${s}s  (${abs.toLocaleString()} ms)`
}
