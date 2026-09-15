import { useMemo, useState } from 'react'
import { GitCommit as GitCommitIcon } from '@phosphor-icons/react'
import { parseGitLog, layoutCommits, type PositionedCommit } from '../lib/gitGraph'
import { Panel, SectionLabel, ErrorBanner, CopyButton } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

const LANE_COLORS = ['var(--cyan)', 'var(--violet)', 'var(--emerald)', 'var(--warm)', 'var(--rose)']
const ROW_H = 32
const LANE_W = 22
const DOT_R = 5

const LOG_COMMAND = 'git log --all --format="%H|%P|%s|%an|%ad" --date=short'

export function GitGraphPage() {
  const [text, setText] = useState('')

  const { positioned, laneCount, error } = useMemo(() => {
    if (!text.trim()) return { positioned: [] as PositionedCommit[], laneCount: 0, error: null as string | null }
    try {
      const commits = parseGitLog(text)
      if (commits.length === 0) return { positioned: [], laneCount: 0, error: 'No commits parsed — check the format matches the command above.' }
      const { positioned, laneCount } = layoutCommits(commits)
      return { positioned, laneCount, error: null }
    } catch (e) {
      return { positioned: [], laneCount: 0, error: e instanceof Error ? e.message : 'Could not parse log' }
    }
  }, [text])

  const byHash = useMemo(() => new Map(positioned.map((c) => [c.hash, c])), [positioned])
  const width = laneCount * LANE_W + 20
  const height = positioned.length * ROW_H + 20

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="git-graph" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <SectionLabel>Paste git log output</SectionLabel>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-glass px-2 py-1.5">
              <code className="truncate text-[10px] text-ink-soft">{LOG_COMMAND}</code>
              <CopyButton text={LOG_COMMAND} label="" />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              rows={10}
              placeholder="Run the command above in your repo and paste its output here."
              className="w-full resize-none rounded-2xl border border-rule bg-panel p-3 font-mono text-[11px] leading-relaxed text-ink outline-none focus:border-cyan/50"
            />
            {error && <ErrorBanner message={error} />}
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        {positioned.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            <div className="flex flex-col items-center gap-2">
              <GitCommitIcon size={28} weight="light" />
              Paste git log output on the left to see the branch graph.
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-auto">
            <div className="relative shrink-0" style={{ width, height }}>
              <svg width={width} height={height} className="absolute inset-0">
                {positioned.map((c) =>
                  c.parents.map((parentHash) => {
                    const parent = byHash.get(parentHash)
                    if (!parent) return null
                    const x1 = c.lane * LANE_W + 14
                    const y1 = c.row * ROW_H + 16
                    const x2 = parent.lane * LANE_W + 14
                    const y2 = parent.row * ROW_H + 16
                    const color = LANE_COLORS[c.lane % LANE_COLORS.length]
                    if (x1 === x2) {
                      return <line key={`${c.hash}-${parentHash}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} />
                    }
                    const midY = (y1 + y2) / 2
                    return (
                      <path
                        key={`${c.hash}-${parentHash}`}
                        d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                      />
                    )
                  })
                )}
                {positioned.map((c) => (
                  <circle
                    key={c.hash}
                    cx={c.lane * LANE_W + 14}
                    cy={c.row * ROW_H + 16}
                    r={DOT_R}
                    fill={LANE_COLORS[c.lane % LANE_COLORS.length]}
                  />
                ))}
              </svg>
            </div>

            <div className="flex-1 overflow-hidden">
              <div style={{ height: 20 }} />
              {positioned.map((c) => (
                <div key={c.hash} className="flex items-center gap-3 pr-4 text-xs" style={{ height: ROW_H }}>
                  <span className="shrink-0 font-mono text-[10.5px] text-ink-faint">{c.hash.slice(0, 7)}</span>
                  <span className="truncate text-ink">{c.subject}</span>
                  <span className="ml-auto shrink-0 text-[10.5px] text-ink-faint">{c.author}</span>
                  <span className="shrink-0 text-[10.5px] text-ink-faint">{c.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}
