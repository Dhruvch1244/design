import { useMemo, useState } from 'react'
import { describeCron, nextRuns, parseCron } from '../lib/cron'
import { Panel, SectionLabel, Button, ErrorBanner, CopyButton } from '../components/ui'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CRON_PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 15 min', expr: '*/15 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily at 2am', expr: '0 2 * * *' },
  { label: 'Weekdays at 9am', expr: '0 9 * * 1-5' },
  { label: 'Weekly (Sun midnight)', expr: '0 0 * * 0' },
  { label: 'Monthly (1st, midnight)', expr: '0 0 1 * *' },
]

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

  const cron = useMemo(() => {
    try {
      const spec = parseCron(cronExpr)
      const grid: boolean[][] = Array.from({ length: 7 }, () => Array(24).fill(false))
      for (let d = 0; d < 7; d++) {
        if (!spec.dow.match(d)) continue
        for (let h = 0; h < 24; h++) {
          if (!spec.hour.match(h)) continue
          let active = false
          for (let m = 0; m < 60 && !active; m++) {
            if (spec.minute.match(m)) active = true
          }
          grid[d][h] = active
        }
      }
      return { description: describeCron(cronExpr), runs: nextRuns(cronExpr, 12), heatmap: grid, error: null as string | null }
    } catch (e) {
      return { description: '', runs: [], heatmap: null, error: e instanceof Error ? e.message : 'Invalid cron expression' }
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

      <Panel className="col-span-2">
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Cron explainer</SectionLabel>
          <div className="flex items-center gap-2">
            <input
              className="devtools-input flex-1 font-mono"
              value={cronExpr}
              onChange={(e) => setCronExpr(e.target.value)}
              placeholder="0 9 * * 1-5"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CRON_PRESETS.map((p) => (
              <button
                key={p.expr}
                onClick={() => setCronExpr(p.expr)}
                className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                  cronExpr === p.expr ? 'bg-glass-strong text-ink' : 'bg-glass text-ink-faint hover:text-ink-soft'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {cron.error ? (
            <ErrorBanner message={cron.error} />
          ) : (
            <>
              <div className="text-sm text-ink-soft">{cron.description}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SectionLabel>Weekly pattern (ignoring day-of-month/month)</SectionLabel>
                  <div className="overflow-x-auto rounded-2xl border border-rule bg-panel p-3">
                    <div className="flex gap-1">
                      <div className="flex w-10 shrink-0 flex-col justify-end gap-[3px] pt-[18px]">
                        {DAY_LABELS.map((d) => (
                          <div key={d} className="flex h-[14px] items-center text-[9px] text-ink-faint">{d}</div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        <div className="flex gap-[3px]">
                          {Array.from({ length: 24 }, (_, h) => (
                            <div key={h} className="w-[14px] shrink-0 text-center text-[8px] text-ink-faint">{h % 3 === 0 ? h : ''}</div>
                          ))}
                        </div>
                        {cron.heatmap!.map((row, d) => (
                          <div key={d} className="flex gap-[3px]">
                            {row.map((active, h) => (
                              <div
                                key={h}
                                title={`${DAY_LABELS[d]} ${h}:00`}
                                className="h-[14px] w-[14px] shrink-0 rounded-sm"
                                style={{ background: active ? 'var(--cyan)' : 'var(--glass)' }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <SectionLabel>Next 12 runs</SectionLabel>
                    <CopyButton text={cron.runs.map((r) => r.toLocaleString()).join('\n')} />
                  </div>
                  <div className="max-h-48 overflow-auto">
                    {cron.runs.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 border-l-2 border-rule-soft py-1.5 pl-3 text-xs">
                        <span className="-ml-[19px] h-2 w-2 shrink-0 rounded-full bg-cyan" />
                        <span className="text-ink">{r.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="font-mono text-ink-soft">{r.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                        {i > 0 && <span className="text-ink-faint">+{Math.round((r.getTime() - cron.runs[i - 1].getTime()) / 60000)}m</span>}
                      </div>
                    ))}
                  </div>
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
