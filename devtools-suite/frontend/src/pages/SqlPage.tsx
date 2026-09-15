import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ChartBar,
  Clock,
  Database,
  FloppyDisk,
  Gear,
  Play,
  Star,
  Table as TableIcon,
  Trash,
  Warning,
} from '@phosphor-icons/react'
import { ResultChart } from '../components/ResultChart'
import { PlanView } from '../components/PlanView'
import { buildChartData } from '../lib/resultChart'
import { parseExplainPlan } from '../lib/sqlPlan'
import { lintSql, type LintIssue } from '../lib/sqlLint'
import {
  createSavedQuery,
  deleteSavedQuery,
  deleteSample,
  detectParams,
  executeQuery,
  getSchema,
  listConnections,
  listRuns,
  listSavedQueries,
  readSample,
  recentSamples,
  saveSample,
  setSavedQueryFavourite,
  updateSavedQuery,
  type DbConnection,
  type QueryResult,
  type QueryRun,
  type SavedQuery,
  type SampleOutput,
  type SchemaNode,
} from '../lib/sqlApi'
import { Button, CopyButton, ErrorBanner, Panel, SectionLabel } from '../components/ui'
import { ConnectionDialog } from '../components/ConnectionDialog'
import { ResizablePanel } from '../components/ResizablePanel'

type Tab = 'queries' | 'schema' | 'runs' | 'samples'

export function SqlPage() {
  const [connections, setConnections] = useState<DbConnection[]>([])
  const [connectionId, setConnectionId] = useState<number | null>(null)
  const [connDialogOpen, setConnDialogOpen] = useState(false)

  const [sql, setSql] = useState('SELECT 1')
  const [paramNames, setParamNames] = useState<string[]>([])
  const [paramValues, setParamValues] = useState<Record<string, string>>({})

  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [activeSavedQueryId, setActiveSavedQueryId] = useState<number | null>(null)
  const [saveName, setSaveName] = useState('')

  const [tab, setTab] = useState<Tab>('queries')
  const [schema, setSchema] = useState<SchemaNode[]>([])
  const [runs, setRuns] = useState<QueryRun[]>([])
  const [samples, setSamples] = useState<SampleOutput[]>([])
  const [sampleView, setSampleView] = useState<{ label: string; columns: string[]; rows: unknown[][] } | null>(null)
  const [resultView, setResultView] = useState<'table' | 'chart'>('table')

  const activeConnection = useMemo(() => connections.find((c) => c.id === connectionId) ?? null, [connections, connectionId])

  const lintIssues: LintIssue[] = useMemo(
    () => lintSql(sql, { readOnlyConnection: activeConnection?.readOnly }),
    [sql, activeConnection?.readOnly]
  )

  const chartData = useMemo(
    () => (result && result.statementType !== 'EXPLAIN' ? buildChartData(result.columns, result.rows) : null),
    [result]
  )

  const plan = useMemo(() => (result ? parseExplainPlan(result) : null), [result])

  function refreshConnections() {
    listConnections().then((list) => {
      setConnections(list)
      if (connectionId == null && list.length > 0) setConnectionId(list[0].id)
    })
  }

  useEffect(() => {
    refreshConnections()
    listSavedQueries().then(setSavedQueries)
    listRuns().then(setRuns)
    recentSamples().then(setSamples)
  }, [])

  useEffect(() => {
    if (tab === 'schema' && connectionId != null) {
      getSchema(connectionId).then((r) => setSchema(r.schemas)).catch((e) => setError(String(e)))
    }
  }, [tab, connectionId])

  useEffect(() => {
    const t = setTimeout(() => {
      detectParams(sql)
        .then((r) => setParamNames(r.params))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [sql])

  async function run(explain: boolean) {
    if (!connectionId || !sql.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await executeQuery({
        connectionId,
        sql,
        params: paramValues,
        savedQueryId: activeSavedQueryId ?? undefined,
        explain,
      })
      setResult(res)
      listRuns().then(setRuns)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  async function saveQuery() {
    if (!saveName.trim()) return
    const req = {
      name: saveName.trim(),
      description: '',
      sqlText: sql,
      connectionId,
      paramNames,
      tags: '',
      favourite: false,
    }
    const saved = activeSavedQueryId
      ? await updateSavedQuery(activeSavedQueryId, req)
      : await createSavedQuery(req)
    setActiveSavedQueryId(saved.id)
    setSaveName('')
    listSavedQueries().then(setSavedQueries)
  }

  function loadSavedQuery(q: SavedQuery) {
    setActiveSavedQueryId(q.id)
    setSql(q.sqlText)
    if (q.connectionId) setConnectionId(q.connectionId)
    setResult(null)
    setError(null)
  }

  async function toggleFavourite(q: SavedQuery) {
    await setSavedQueryFavourite(q.id, !q.favourite)
    listSavedQueries().then(setSavedQueries)
  }

  async function removeSavedQuery(id: number) {
    await deleteSavedQuery(id)
    if (activeSavedQueryId === id) setActiveSavedQueryId(null)
    listSavedQueries().then(setSavedQueries)
  }

  async function saveResultAsSample(scope: 'full' | 'first100') {
    if (!result) return
    const rows = scope === 'first100' ? result.rows.slice(0, 100) : result.rows
    const label = window.prompt('Label this sample (e.g. "happy path — 3 orders")', '')
    if (label == null) return
    await saveSample({
      queryRunId: result.queryRunId,
      savedQueryId: activeSavedQueryId ?? undefined,
      label: label || `Sample ${new Date().toLocaleString()}`,
      columns: result.columns,
      rows,
      redactColumns: [],
    })
    recentSamples().then(setSamples)
  }

  async function viewSample(s: SampleOutput) {
    const detail = await readSample(s.id)
    setSampleView({ label: s.label, columns: detail.columns, rows: detail.rows })
  }

  async function removeSample(id: number) {
    await deleteSample(id)
    recentSamples().then(setSamples)
  }

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="sql" className="flex flex-col gap-4">
        <Panel>
          <div className="p-4">
            <SectionLabel>Connection</SectionLabel>
            <div className="mb-3 flex items-center gap-2">
              <select
                className="devtools-input"
                value={connectionId ?? ''}
                onChange={(e) => setConnectionId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Choose…</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.readOnly ? '(read-only)' : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setConnDialogOpen(true)}
                className="shrink-0 rounded-xl border border-rule bg-void/70 p-2 text-ink-faint hover:text-cyan"
                title="Manage connections"
              >
                <Gear size={16} weight="light" />
              </button>
            </div>
            {activeConnection && (
              <div className="mb-1 flex items-center gap-1.5 text-[11px] text-ink-faint">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeConnection.colorTag ?? '#2fe6f2' }} />
                {activeConnection.driver} · {activeConnection.readOnly ? 'read-only' : 'read-write'}
              </div>
            )}
          </div>
        </Panel>

        <Panel className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-col p-3 pb-0">
            <div className="mb-2 flex gap-1 rounded-xl border border-rule bg-void/70 p-1">
              {(
                [
                  ['queries', BookOpen, 'Saved'],
                  ['schema', Database, 'Schema'],
                  ['runs', Clock, 'History'],
                  ['samples', TableIcon, 'Samples'],
                ] as const
              ).map(([id, Icon, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10.5px] font-medium transition-colors ${
                    tab === id ? 'bg-white/[0.08] text-ink' : 'text-ink-faint hover:text-ink-soft'
                  }`}
                >
                  <Icon size={12} weight="light" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 pt-1">
            {tab === 'queries' && (
              <div className="flex flex-col gap-1.5">
                {savedQueries.length === 0 && <div className="p-2 text-xs text-ink-faint">No saved queries yet.</div>}
                {savedQueries.map((q) => (
                  <div
                    key={q.id}
                    className={`group flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs transition-colors ${
                      activeSavedQueryId === q.id ? 'border-cyan/40 bg-cyan/[0.06]' : 'border-rule-soft bg-white/[0.02] hover:border-rule'
                    }`}
                  >
                    <button onClick={() => toggleFavourite(q)} className="shrink-0 text-ink-faint hover:text-warm">
                      <Star size={12} weight={q.favourite ? 'fill' : 'light'} className={q.favourite ? 'text-warm' : ''} />
                    </button>
                    <button className="flex-1 truncate text-left text-ink-soft hover:text-ink" onClick={() => loadSavedQuery(q)} title={q.sqlText}>
                      {q.name}
                    </button>
                    <button
                      onClick={() => removeSavedQuery(q.id)}
                      className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                    >
                      <Trash size={11} weight="light" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'schema' && (
              <div className="flex flex-col gap-2 text-xs">
                {schema.length === 0 && <div className="p-2 text-ink-faint">Pick a connection to browse its schema.</div>}
                {schema.map((s) => (
                  <div key={s.name}>
                    <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{s.name}</div>
                    {s.tables.map((t) => (
                      <details key={t.name} className="mb-1 rounded-lg border border-rule-soft bg-white/[0.02] px-2 py-1.5">
                        <summary className="cursor-pointer select-none text-ink-soft">{t.name}</summary>
                        <div className="mt-1 flex flex-col gap-0.5 pl-2">
                          {t.columns.map((c) => (
                            <div key={c.name} className="flex items-center justify-between text-ink-faint">
                              <span className={c.primaryKey ? 'font-semibold text-cyan' : ''}>{c.name}</span>
                              <span>{c.type}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {tab === 'runs' && (
              <div className="flex flex-col gap-1.5">
                {runs.length === 0 && <div className="p-2 text-xs text-ink-faint">No runs yet.</div>}
                {runs.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSql(r.sqlText)}
                    className="flex flex-col gap-0.5 rounded-xl border border-rule-soft bg-white/[0.02] px-2.5 py-2 text-left text-xs hover:border-rule"
                  >
                    <span className="truncate font-mono text-ink-soft">{r.sqlText}</span>
                    <span className={`text-[10px] ${r.status === 'ERROR' ? 'text-rose' : 'text-ink-faint'}`}>
                      {r.status} · {r.rowCount} rows · {r.durationMs}ms · {new Date(r.executedAt).toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'samples' && (
              <div className="flex flex-col gap-1.5">
                {samples.length === 0 && <div className="p-2 text-xs text-ink-faint">No saved samples yet.</div>}
                {samples.map((s) => (
                  <div key={s.id} className="group flex items-center gap-1.5 rounded-xl border border-rule-soft bg-white/[0.02] px-2.5 py-2 text-xs">
                    <button onClick={() => viewSample(s)} className="flex-1 truncate text-left text-ink-soft hover:text-ink">
                      {s.label}
                    </button>
                    <span className="shrink-0 text-[10px] text-ink-faint">{s.rowCount} rows</span>
                    <button onClick={() => removeSample(s.id)} className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100">
                      <Trash size={11} weight="light" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-3 p-4">
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            spellCheck={false}
            rows={7}
            placeholder="SELECT * FROM orders WHERE status = :status"
            className="w-full resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none transition-shadow focus:border-cyan/50 focus:shadow-[0_0_0_3px_rgba(47,230,242,0.12)]"
          />

          {lintIssues.length > 0 && (
            <div className="flex flex-col gap-1">
              {lintIssues.map((issue, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] ${
                    issue.severity === 'error' ? 'bg-rose/[0.08] text-rose' : 'bg-warm/[0.08] text-warm'
                  }`}
                >
                  <Warning size={13} weight="fill" className="mt-0.5 shrink-0" />
                  <span>
                    <span className="font-mono opacity-70">L{issue.line}</span> {issue.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {paramNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {paramNames.map((name) => (
                <label key={name} className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <span className="font-mono text-cyan">:{name}</span>
                  <input
                    className="devtools-input w-40"
                    value={paramValues[name] ?? ''}
                    onChange={(e) => setParamValues({ ...paramValues, [name]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={() => run(false)} disabled={!connectionId || loading}>
                <Play size={14} weight="fill" /> {loading ? 'Running…' : 'Run'}
              </Button>
              <Button variant="default" onClick={() => run(true)} disabled={!connectionId || loading}>
                Explain
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="devtools-input w-44"
                placeholder="Name to save as…"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
              <Button variant="default" onClick={saveQuery} disabled={!saveName.trim()}>
                <FloppyDisk size={14} weight="light" /> {activeSavedQueryId ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col gap-2 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="text-xs text-ink-soft">
                  <span className="font-semibold text-ink">{result.rowCount}</span> rows
                  {result.truncated && ' (truncated)'} · {result.durationMs}ms · {result.statementType}
                </div>
                <div className="flex items-center gap-2">
                  {chartData && (
                    <div className="mr-1 flex gap-1 rounded-lg border border-rule bg-void/70 p-0.5">
                      {(['table', 'chart'] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => setResultView(v)}
                          className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] capitalize transition-colors ${
                            resultView === v ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
                          }`}
                        >
                          {v === 'chart' && <ChartBar size={11} weight="light" />}
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                  <Button variant="ghost" onClick={() => saveResultAsSample('first100')}>
                    Save first 100
                  </Button>
                  <Button variant="ghost" onClick={() => saveResultAsSample('full')}>
                    Save full result
                  </Button>
                  <CopyButton text={toTsv(result.columns, result.rows)} label="Copy TSV" />
                </div>
              </div>

              {plan ? (
                <div className="flex-1 overflow-auto">
                  <PlanView plan={plan} />
                </div>
              ) : chartData && resultView === 'chart' ? (
                <div className="flex-1 overflow-auto">
                  <ResultChart data={chartData} />
                </div>
              ) : (
                <div className="flex-1 overflow-auto rounded-2xl border border-rule bg-void/70">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="sticky top-0 bg-panel">
                      <tr>
                        {result.columns.map((c) => (
                          <th key={c} className="border-b border-rule px-3 py-2 font-medium text-ink-faint">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, i) => (
                        <tr key={i} className="border-b border-rule-soft hover:bg-white/[0.02]">
                          {row.map((cell, j) => (
                            <td key={j} className="whitespace-pre-wrap break-all px-3 py-1.5 font-mono text-ink">
                              {cell === null ? <span className="italic text-ink-faint">NULL</span> : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {!result && !error && (
            <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
              Pick a connection, write a query (use <code className="mx-1 font-mono text-ink-soft">:name</code> for parameters), and run it.
            </div>
          )}
        </div>
      </Panel>

      <ConnectionDialog open={connDialogOpen} onClose={() => setConnDialogOpen(false)} onChanged={refreshConnections} />

      {sampleView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={() => setSampleView(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-[32rem] w-[48rem] flex-col overflow-hidden rounded-[1.75rem] border border-rule-soft bg-surface p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-ink">{sampleView.label}</div>
              <Button variant="ghost" onClick={() => setSampleView(null)}>
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl border border-rule bg-void/70">
              <table className="w-full text-left text-[12.5px]">
                <thead className="sticky top-0 bg-panel">
                  <tr>
                    {sampleView.columns.map((c) => (
                      <th key={c} className="border-b border-rule px-3 py-2 font-medium text-ink-faint">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleView.rows.map((row, i) => (
                    <tr key={i} className="border-b border-rule-soft">
                      {row.map((cell, j) => (
                        <td key={j} className="whitespace-pre-wrap break-all px-3 py-1.5 font-mono text-ink">
                          {cell === null ? <span className="italic text-ink-faint">NULL</span> : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function toTsv(columns: string[], rows: unknown[][]): string {
  const lines = [columns.join('\t')]
  for (const row of rows) lines.push(row.map((c) => (c === null ? '' : String(c))).join('\t'))
  return lines.join('\n')
}
