import { useMemo, useState } from 'react'
import { findPathsTo, parseDependencyTree, type DepNode } from '../lib/depTree'
import { Panel, SectionLabel, ErrorBanner } from '../components/ui'

export function DependencyTreePage() {
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('')

  const roots = useMemo(() => {
    try {
      return parseDependencyTree(text)
    } catch {
      return []
    }
  }, [text])

  const conflictCount = useMemo(() => {
    let n = 0
    const walk = (nodes: DepNode[]) => nodes.forEach((x) => { if (x.conflict) n++; walk(x.children) })
    walk(roots)
    return n
  }, [roots])

  const paths = useMemo(() => (filter.trim() ? findPathsTo(roots, filter.trim()) : []), [roots, filter])

  return (
    <div className="flex h-full gap-4">
      <Panel className="flex w-96 shrink-0 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col p-4">
          <SectionLabel>Paste `mvn dependency:tree` or `gradlew dependencies` output</SectionLabel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[12px] leading-relaxed text-ink outline-none focus:border-cyan/50"
          />
        </div>
      </Panel>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        <Panel>
          <div className="flex items-center gap-3 p-3.5">
            <input
              className="devtools-input flex-1"
              placeholder="Filter — find every path to an artifact (e.g. jackson-databind)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {conflictCount > 0 && <span className="shrink-0 text-xs text-warm">{conflictCount} version conflict{conflictCount === 1 ? '' : 's'}</span>}
          </div>
        </Panel>

        <Panel className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            {roots.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink-faint">Paste dependency-tree output on the left.</div>
            ) : filter.trim() ? (
              paths.length === 0 ? (
                <ErrorBanner message={`No artifact matching "${filter}" found.`} />
              ) : (
                <div className="flex flex-col gap-2">
                  {paths.map((path, i) => (
                    <div key={i} className="rounded-xl border border-rule-soft bg-white/[0.02] p-2.5 font-mono text-[12px] text-ink-soft">
                      {path.map((seg, si) => (
                        <div key={si} style={{ paddingLeft: si * 16 }} className={si === path.length - 1 ? 'text-cyan' : ''}>
                          {si > 0 && '↳ '}{seg}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <Tree nodes={roots} />
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Tree({ nodes }: { nodes: DepNode[] }) {
  return (
    <div className="flex flex-col">
      {nodes.map((n, i) => (
        <div key={i}>
          <div
            style={{ paddingLeft: n.depth * 18 }}
            className={`whitespace-pre-wrap break-all py-0.5 font-mono text-[12.5px] ${n.conflict ? 'text-warm' : 'text-ink-soft'}`}
          >
            {n.conflict && '⚠ '}{n.coordinate}
          </div>
          <Tree nodes={n.children} />
        </div>
      ))}
    </div>
  )
}
