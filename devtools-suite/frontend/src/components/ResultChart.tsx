import { useState } from 'react'
import type { ChartData } from '../lib/resultChart'

const SERIES_COLORS = ['var(--cyan)', 'var(--violet)', 'var(--emerald)', 'var(--warm)']

export function ResultChart({ data }: { data: ChartData }) {
  const [mode, setMode] = useState<'bar' | 'line'>('bar')
  if (!data) return null

  const width = 720
  const height = 260
  const padL = 40
  const padB = 28
  const padT = 12
  const padR = 12
  const plotW = width - padL - padR
  const plotH = height - padT - padB

  const max = Math.max(1, ...data.series.flatMap((s) => s.values))
  const min = Math.min(0, ...data.series.flatMap((s) => s.values))
  const range = max - min || 1
  const n = data.labels.length
  const groupW = plotW / n

  const y = (v: number) => padT + plotH - ((v - min) / range) * plotH

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-ink-faint">
          Auto-charted from {data.series.map((s) => s.key).join(', ')}
        </div>
        <div className="flex gap-1 rounded-lg border border-rule bg-void/70 p-0.5">
          {(['bar', 'line'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-2 py-0.5 text-[10.5px] capitalize transition-colors ${
                mode === m ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-2xl border border-rule bg-void/70">
        <line x1={padL} y1={y(0)} x2={width - padR} y2={y(0)} stroke="var(--rule)" strokeWidth={1} />
        <line x1={padL} y1={padT} x2={padL} y2={height - padB} stroke="var(--rule)" strokeWidth={1} />
        <text x={4} y={y(max) + 4} fontSize={10} fill="var(--ink-faint)">{fmt(max)}</text>
        <text x={4} y={y(min) + 4} fontSize={10} fill="var(--ink-faint)">{fmt(min)}</text>

        {mode === 'bar'
          ? data.series.map((s, si) => {
              const barW = (groupW * 0.7) / data.series.length
              return s.values.map((v, i) => {
                const x = padL + i * groupW + groupW * 0.15 + si * barW
                const yTop = Math.min(y(0), y(v))
                const h = Math.abs(y(0) - y(v))
                return (
                  <rect
                    key={`${si}-${i}`}
                    x={x}
                    y={yTop}
                    width={Math.max(1, barW - 1)}
                    height={Math.max(0.5, h)}
                    fill={SERIES_COLORS[si % SERIES_COLORS.length]}
                    opacity={0.85}
                    rx={2}
                  >
                    <title>{`${data.labels[i]} · ${s.key}: ${v}`}</title>
                  </rect>
                )
              })
            })
          : data.series.map((s, si) => (
              <polyline
                key={si}
                fill="none"
                stroke={SERIES_COLORS[si % SERIES_COLORS.length]}
                strokeWidth={2}
                points={s.values.map((v, i) => `${padL + i * groupW + groupW / 2},${y(v)}`).join(' ')}
              />
            ))}

        {data.labels.map((l, i) =>
          n <= 20 ? (
            <text
              key={i}
              x={padL + i * groupW + groupW / 2}
              y={height - 8}
              fontSize={9}
              textAnchor="middle"
              fill="var(--ink-faint)"
            >
              {truncate(l, 8)}
            </text>
          ) : null
        )}
      </svg>

      {data.series.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {data.series.map((s, si) => (
            <div key={s.key} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
              <span className="h-2 w-2 rounded-full" style={{ background: SERIES_COLORS[si % SERIES_COLORS.length] }} />
              {s.key}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
