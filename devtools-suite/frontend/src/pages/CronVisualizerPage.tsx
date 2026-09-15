import { useMemo, useState } from 'react'
import { Clock } from '@phosphor-icons/react'
import { describeCron, nextRuns, parseCron } from '../lib/cron'
import { Panel, SectionLabel, ErrorBanner } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 15 min', expr: '*/15 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily at 2am', expr: '0 2 * * *' },
  { label: 'Weekdays at 9am', expr: '0 9 * * 1-5' },
  { label: 'Weekly (Sun midnight)', expr: '0 0 * * 0' },
  { label: 'Monthly (1st, midnight)', expr: '0 0 1 * *' },
]

export function CronVisualizerPage() {
  const [expr, setExpr] = useState('0 9 * * 1-5')

  const { description, runs, heatmap, error } = useMemo(() => {
    try {
      const spec = parseCron(expr)
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
      return { description: describeCron(expr), runs: nextRuns(expr, 12), heatmap: grid, error: null as string | null }
    } catch (e) {
      return { description: '', runs: [], heatmap: null, error: e instanceof Error ? e.message : 'Invalid cron expression' }
    }
  }, [expr])

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="cron-viz" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <SectionLabel>Cron expression (5-field)</SectionLabel>
            <input
              className="devtools-input font-mono"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              placeholder="0 9 * * 1-5"
              spellCheck={false}
            />
            {error ? <ErrorBanner message={error} /> : <div className="text-xs text-ink-soft">{description}</div>}
          </div>
        </Panel>

        <Panel className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Presets</SectionLabel>
            <div className="flex flex-col gap-1">
              {PRESETS.map((p) => (
                <button
                  key={p.expr}
                  onClick={() => setExpr(p.expr)}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    expr === p.expr ? 'bg-glass-strong text-ink' : 'text-ink-soft hover:bg-glass'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="font-mono text-[10px] text-ink-faint">{p.expr}</span>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        {error ? (
          <div className="flex h-full items-center justify-center p-4">
            <div className="flex flex-col items-center gap-2 text-sm text-ink-faint">
              <Clock size={28} weight="light" />
              Fix the expression to see its visualization.
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-5 overflow-auto p-5">
            <div>
              <SectionLabel>Weekly pattern (which hours fire, ignoring day-of-month/month)</SectionLabel>
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
                    {heatmap!.map((row, d) => (
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
              <SectionLabel>Next 12 runs</SectionLabel>
              <div className="flex flex-col">
                {runs.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 border-l-2 border-rule-soft py-1.5 pl-3 text-xs">
                    <span className="-ml-[19px] h-2 w-2 shrink-0 rounded-full bg-cyan" />
                    <span className="text-ink">{r.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="font-mono text-ink-soft">{r.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                    {i > 0 && <span className="text-ink-faint">+{Math.round((r.getTime() - runs[i - 1].getTime()) / 60000)}m</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}
