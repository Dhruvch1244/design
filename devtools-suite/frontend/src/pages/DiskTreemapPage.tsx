import { useMemo, useState } from 'react'
import { ArrowLeft, ChartBar, File as FileIcon, Folder } from '@phosphor-icons/react'
import { scanDisk, type DiskNode } from '../lib/diskVizApi'
import { layoutRow } from '../lib/treemap'
import { Panel, SectionLabel, ErrorBanner, Button } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

const COLORS = ['var(--cyan)', 'var(--violet)', 'var(--emerald)', 'var(--warm)', 'var(--rose)']

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let v = bytes
  let i = -1
  do {
    v /= 1024
    i++
  } while (v >= 1024 && i < units.length - 1)
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`
}

export function DiskTreemapPage() {
  const [pathInput, setPathInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [root, setRoot] = useState<DiskNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState<DiskNode | null>(null)

  async function scan(path: string, pushHistory: boolean) {
    if (!path.trim()) return
    setLoading(true)
    setError(null)
    try {
      const node = await scanDisk(path.trim(), 2)
      if (pushHistory && root) setHistory((h) => [...h, root.path])
      setRoot(node)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  function goBack() {
    const prev = history[history.length - 1]
    if (!prev) return
    setHistory((h) => h.slice(0, -1))
    scan(prev, false)
  }

  const rects = useMemo(() => {
    if (!root || root.children.length === 0) return []
    return layoutRow(root.children.map((c) => ({ size: c.sizeBytes, node: c })), 0, 0, 1000, 560)
  }, [root])

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="disk-treemap" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <SectionLabel>Folder to scan</SectionLabel>
            <input
              className="devtools-input font-mono text-xs"
              placeholder="C:\code\my-project"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && scan(pathInput, false)}
            />
            <Button variant="primary" onClick={() => scan(pathInput, false)} disabled={!pathInput.trim() || loading}>
              {loading ? 'Scanning…' : 'Scan'}
            </Button>
            {history.length > 0 && (
              <Button variant="default" onClick={goBack}>
                <ArrowLeft size={14} weight="light" /> Back
              </Button>
            )}
            <div className="text-[11px] text-ink-faint">Click a box to drill into that folder. Runs entirely locally off disk.</div>
            {root && (
              <div className="rounded-xl border border-rule-soft bg-white/[0.02] p-2.5 text-[11px] text-ink-soft">
                <div className="truncate font-mono text-ink">{root.path}</div>
                <div className="mt-1 text-ink-faint">
                  {formatSize(root.sizeBytes)} · {root.childCount} item{root.childCount === 1 ? '' : 's'}
                </div>
              </div>
            )}
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        {error && (
          <div className="p-4">
            <ErrorBanner message={error} />
          </div>
        )}
        {!error && !root && (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            <div className="flex flex-col items-center gap-2">
              <ChartBar size={28} weight="light" />
              Pick a folder and scan it to see where the space went.
            </div>
          </div>
        )}
        {!error && root && (
          <div className="flex flex-1 flex-col overflow-hidden p-4">
            <div className="mb-2 flex h-5 shrink-0 items-center text-[11px] text-ink-faint">
              {hovered ? (
                <>
                  <span className="truncate font-mono text-ink-soft">{hovered.name}</span>
                  <span className="ml-2 shrink-0">{formatSize(hovered.sizeBytes)}</span>
                </>
              ) : (
                'Hover a box for details'
              )}
            </div>
            <div className="relative flex-1 overflow-hidden rounded-2xl border border-rule">
              <svg viewBox="0 0 1000 560" className="h-full w-full" preserveAspectRatio="none">
                {rects.map((r, i) => (
                  <g key={r.node.path}>
                    <rect
                      x={r.x}
                      y={r.y}
                      width={Math.max(0, r.w - 1.5)}
                      height={Math.max(0, r.h - 1.5)}
                      fill={COLORS[i % COLORS.length]}
                      opacity={r.node.directory ? 0.5 : 0.28}
                      stroke="var(--surface)"
                      strokeWidth={1.5}
                      className={r.node.directory ? 'cursor-pointer' : ''}
                      onMouseEnter={() => setHovered(r.node)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => r.node.directory && scan(r.node.path, true)}
                    />
                  </g>
                ))}
              </svg>
              <div className="pointer-events-none absolute inset-0">
                {rects
                  .filter((r) => r.w > 46 && r.h > 24)
                  .map((r) => (
                    <div
                      key={r.node.path}
                      className="absolute flex items-center gap-1 overflow-hidden px-1.5 py-1 text-[10.5px] text-ink"
                      style={{ left: `${(r.x / 1000) * 100}%`, top: `${(r.y / 560) * 100}%`, width: `${(r.w / 1000) * 100}%`, height: `${(r.h / 560) * 100}%` }}
                    >
                      {r.node.directory ? <Folder size={11} weight="fill" className="shrink-0 opacity-70" /> : <FileIcon size={11} weight="light" className="shrink-0 opacity-70" />}
                      <span className="truncate">{r.node.name}</span>
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
