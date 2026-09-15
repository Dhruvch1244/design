import { useEffect, useMemo, useState } from 'react'
import { Database } from '@phosphor-icons/react'
import { getSchema, listConnections, type DbConnection, type SchemaNode } from '../lib/sqlApi'
import { Panel, SectionLabel, ErrorBanner } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'
import { ErDiagram } from '../components/ErDiagram'

export function SqlErDiagramPage() {
  const [connections, setConnections] = useState<DbConnection[]>([])
  const [connectionId, setConnectionId] = useState<number | null>(null)
  const [schemas, setSchemas] = useState<SchemaNode[]>([])
  const [schemaName, setSchemaName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listConnections().then((list) => {
      setConnections(list)
      if (list.length > 0) setConnectionId(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (connectionId == null) return
    setLoading(true)
    setError(null)
    getSchema(connectionId)
      .then((r) => {
        setSchemas(r.schemas)
        setSchemaName(r.schemas[0]?.name ?? null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load schema'))
      .finally(() => setLoading(false))
  }, [connectionId])

  const activeSchema = useMemo(() => schemas.find((s) => s.name === schemaName) ?? null, [schemas, schemaName])
  const fkCount = useMemo(() => activeSchema?.tables.reduce((n, t) => n + t.foreignKeys.length, 0) ?? 0, [activeSchema])

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="sql-er" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <SectionLabel>Connection</SectionLabel>
            <select className="devtools-input" value={connectionId ?? ''} onChange={(e) => setConnectionId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Choose…</option>
              {connections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {schemas.length > 1 && (
              <>
                <SectionLabel>Schema</SectionLabel>
                <select className="devtools-input" value={schemaName ?? ''} onChange={(e) => setSchemaName(e.target.value)}>
                  {schemas.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </>
            )}

            {activeSchema && (
              <div className="text-[11px] text-ink-faint">
                {activeSchema.tables.length} tables · {fkCount} foreign key relationship{fkCount === 1 ? '' : 's'}
              </div>
            )}
            {connections.length === 0 && (
              <div className="text-[11px] text-ink-faint">Add a connection in SQL Workspace first.</div>
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
        {!error && loading && <div className="flex h-full items-center justify-center text-sm text-ink-faint">Loading schema…</div>}
        {!error && !loading && !activeSchema && (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            <div className="flex flex-col items-center gap-2">
              <Database size={28} weight="light" />
              Pick a connection to see its ER diagram.
            </div>
          </div>
        )}
        {!error && !loading && activeSchema && (
          <div className="flex-1 overflow-hidden">
            <ErDiagram tables={activeSchema.tables} />
          </div>
        )}
      </Panel>
    </div>
  )
}
