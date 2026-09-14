import { useMemo, useState } from 'react'
import { UploadSimple } from '@phosphor-icons/react'
import { extractAssets } from '../lib/bundleStats'
import { Panel, SectionLabel, ErrorBanner } from '../components/ui'

function formatBytes(n: number): string {
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`
  if (n > 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${n} B`
}

export function BundleStatsPage() {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const assets = useMemo(() => {
    if (!text.trim()) return []
    try {
      setError(null)
      return extractAssets(JSON.parse(text))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      return []
    }
  }, [text])

  const total = assets.reduce((s, a) => s + a.size, 0) || 1

  async function handleFile(file: File) {
    setText(await file.text())
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Panel>
        <div className="flex items-center gap-3 p-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule px-3 py-2.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink">
            <UploadSimple size={14} weight="light" />
            Load a stats.json (webpack --json, rollup-plugin-visualizer, vite build --json)
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
          {assets.length > 0 && <div className="text-xs text-ink-soft">{assets.length} assets · {formatBytes(total)} total</div>}
        </div>
      </Panel>

      {error && <ErrorBanner message={error} />}

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {assets.length === 0 && !error ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">Load a bundle stats JSON to see what's inflating it.</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {assets.map((a) => (
                <div key={a.name} className="flex items-center gap-3">
                  <span className="w-96 shrink-0 truncate font-mono text-[11.5px] text-ink-soft" title={a.name}>
                    {a.name}
                  </span>
                  <div className="relative h-4 flex-1 rounded bg-white/[0.03]">
                    <div className="absolute top-0 h-4 rounded bg-cyan/50" style={{ width: `${(a.size / total) * 100}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right font-mono text-[11.5px] text-ink-faint">{formatBytes(a.size)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
