import { useState } from 'react'
import { FolderOpen, GitBranch, Trash } from '@phosphor-icons/react'
import { analyzeSpringRepo, type SpringVizResponse } from '../lib/springVizApi'
import { Button, Panel, SectionLabel, ErrorBanner } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'
import { SpringVizGraph, GraphLegend } from '../components/SpringVizGraph'

const RECENTS_KEY = 'devtools.springviz-recent-paths'
const MAX_RECENTS = 8

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecents(list: string[]) {
  localStorage.setItem(RECENTS_KEY, JSON.stringify(list))
}

type Tab = 'graph' | 'endpoints'

export function SpringVizPage() {
  const [path, setPath] = useState('')
  const [recents, setRecents] = useState<string[]>(loadRecents)
  const [result, setResult] = useState<SpringVizResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('graph')

  async function run(targetPath: string) {
    if (!targetPath.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await analyzeSpringRepo(targetPath.trim())
      setResult(res)
      const next = [targetPath.trim(), ...recents.filter((p) => p !== targetPath.trim())].slice(0, MAX_RECENTS)
      setRecents(next)
      saveRecents(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  function removeRecent(p: string) {
    const next = recents.filter((r) => r !== p)
    setRecents(next)
    saveRecents(next)
  }

  const baseUrl = result ? `http://localhost:${result.port ?? 8080}${result.contextPath ?? ''}` : ''

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="springviz" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <SectionLabel>Spring Boot project path</SectionLabel>
            <input
              className="devtools-input font-mono text-xs"
              placeholder="C:\code\my-orders-service"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && run(path)}
            />
            <Button variant="primary" onClick={() => run(path)} disabled={!path.trim() || loading}>
              <GitBranch size={14} weight="light" /> {loading ? 'Scanning…' : 'Analyze'}
            </Button>
            <div className="text-[11px] text-ink-faint">
              Point it at a project's root folder (the one containing <code className="font-mono text-ink-soft">src/main/java</code>). Everything runs
              locally by reading the source files — nothing is compiled or executed.
            </div>
          </div>
        </Panel>

        {recents.length > 0 && (
          <Panel className="flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col p-3">
              <SectionLabel>Recent projects</SectionLabel>
              <div className="flex-1 overflow-auto">
                {recents.map((p) => (
                  <div key={p} className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-ink-soft hover:bg-glass">
                    <button onClick={() => { setPath(p); run(p) }} className="flex flex-1 items-center gap-1.5 truncate text-left">
                      <FolderOpen size={12} weight="light" className="shrink-0 text-ink-faint" />
                      <span className="truncate font-mono">{p}</span>
                    </button>
                    <button onClick={() => removeRecent(p)} className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100">
                      <Trash size={11} weight="light" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        {error && (
          <div className="p-4">
            <ErrorBanner message={error} />
          </div>
        )}

        {!result && !error && (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            <div className="flex flex-col items-center gap-2">
              <GitBranch size={28} weight="light" />
              Point it at a Spring Boot project and hit Analyze.
            </div>
          </div>
        )}

        {result && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-rule-soft p-3.5">
              <div className="flex gap-1 rounded-xl border border-rule bg-panel p-1">
                {(['graph', 'endpoints'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-medium capitalize transition-colors ${
                      tab === t ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
                    }`}
                  >
                    {t} {t === 'endpoints' ? `(${result.endpoints.length})` : `(${result.nodes.length})`}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-ink-faint">
                {result.javaFilesScanned} .java files scanned · base URL <span className="font-mono text-ink-soft">{baseUrl}</span>
              </div>
            </div>

            {tab === 'graph' ? (
              <>
                <div className="shrink-0 border-b border-rule-soft px-3.5 py-2">
                  <GraphLegend />
                </div>
                <div className="flex-1 overflow-hidden">
                  <SpringVizGraph nodes={result.nodes} edges={result.edges} />
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-auto p-4">
                {result.endpoints.length === 0 ? (
                  <div className="text-sm text-ink-faint">No @RestController/@Controller endpoints found.</div>
                ) : (
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="sticky top-0 bg-panel">
                      <tr>
                        <th className="border-b border-rule px-3 py-2 font-medium text-ink-faint">Method</th>
                        <th className="border-b border-rule px-3 py-2 font-medium text-ink-faint">URL</th>
                        <th className="border-b border-rule px-3 py-2 font-medium text-ink-faint">Controller</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.endpoints.map((e, i) => (
                        <tr key={i} className="border-b border-rule-soft hover:bg-glass">
                          <td className="px-3 py-1.5">
                            <span className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ${methodColor(e.httpMethod)}`}>{e.httpMethod}</span>
                          </td>
                          <td className="px-3 py-1.5 font-mono text-ink">
                            {baseUrl}
                            {e.path}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-ink-faint">
                            {e.controllerClass}.{e.methodName}()
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}

function methodColor(method: string): string {
  switch (method) {
    case 'GET': return 'bg-cyan/15 text-cyan'
    case 'POST': return 'bg-emerald/15 text-emerald'
    case 'PUT': return 'bg-warm/15 text-warm'
    case 'PATCH': return 'bg-violet/15 text-violet'
    case 'DELETE': return 'bg-rose/15 text-rose'
    default: return 'bg-glass text-ink-soft'
  }
}
