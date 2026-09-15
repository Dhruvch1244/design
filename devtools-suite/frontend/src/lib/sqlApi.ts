async function jsonFetch<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return text ? JSON.parse(text) : (undefined as T)
}

export type Driver = 'postgresql' | 'mysql' | 'sqlite' | 'h2' | 'sqlserver'

export const DRIVER_LABELS: Record<Driver, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL / MariaDB',
  sqlite: 'SQLite',
  h2: 'H2',
  sqlserver: 'SQL Server',
}

export type DbConnection = {
  id: number
  name: string
  driver: Driver
  jdbcUrl: string
  username: string | null
  hasPassword: boolean
  readOnly: boolean
  colorTag: string | null
  createdAt: string
}

export type ConnectionRequest = {
  name: string
  driver: Driver
  jdbcUrl: string
  username: string
  password: string | null
  readOnly: boolean
  colorTag: string
}

export const listConnections = () => jsonFetch<DbConnection[]>('/api/sql/connections', 'GET')
export const createConnection = (req: ConnectionRequest) => jsonFetch<DbConnection>('/api/sql/connections', 'POST', req)
export const updateConnection = (id: number, req: ConnectionRequest) =>
  jsonFetch<DbConnection>(`/api/sql/connections/${id}`, 'PUT', req)
export const deleteConnection = (id: number) => jsonFetch<void>(`/api/sql/connections/${id}`, 'DELETE')
export const testConnection = (id: number) => jsonFetch<{ message: string }>(`/api/sql/connections/${id}/test`, 'POST')

export type ColumnInfo = { name: string; type: string; nullable: boolean; primaryKey: boolean }
export type ForeignKey = { column: string; referencedTable: string; referencedColumn: string }
export type TableNode = { name: string; type: string; columns: ColumnInfo[]; foreignKeys: ForeignKey[] }
export type SchemaNode = { name: string; tables: TableNode[] }
export const getSchema = (connectionId: number) =>
  jsonFetch<{ schemas: SchemaNode[] }>(`/api/sql/connections/${connectionId}/schema`, 'GET')

export type QueryExecuteRequest = {
  connectionId: number
  sql: string
  params: Record<string, string>
  maxRows?: number
  timeoutSeconds?: number
  savedQueryId?: number
  explain?: boolean
}
export type QueryResult = {
  columns: string[]
  rows: unknown[][]
  rowCount: number
  durationMs: number
  truncated: boolean
  statementType: string
  queryRunId: number
}
export const executeQuery = (req: QueryExecuteRequest) => jsonFetch<QueryResult>('/api/sql/execute', 'POST', req)

export type QueryRun = {
  id: number
  savedQueryId: number | null
  connectionId: number
  sqlText: string
  paramsJson: string
  status: 'SUCCESS' | 'ERROR'
  rowCount: number
  durationMs: number
  errorText: string | null
  executedAt: string
}
export const listRuns = () => jsonFetch<QueryRun[]>('/api/sql/runs', 'GET')
export const listRunsForQuery = (savedQueryId: number) =>
  jsonFetch<QueryRun[]>(`/api/sql/runs/by-query/${savedQueryId}`, 'GET')

export type SavedQuery = {
  id: number
  name: string
  description: string | null
  sqlText: string
  connectionId: number | null
  paramSchemaJson: string
  tags: string | null
  favourite: boolean
  createdAt: string
  updatedAt: string
}
export type SavedQueryRequest = {
  name: string
  description: string
  sqlText: string
  connectionId: number | null
  paramNames: string[]
  tags: string
  favourite: boolean
}
export const listSavedQueries = () => jsonFetch<SavedQuery[]>('/api/sql/queries', 'GET')
export const createSavedQuery = (req: SavedQueryRequest) => jsonFetch<SavedQuery>('/api/sql/queries', 'POST', req)
export const updateSavedQuery = (id: number, req: SavedQueryRequest) =>
  jsonFetch<SavedQuery>(`/api/sql/queries/${id}`, 'PUT', req)
export const deleteSavedQuery = (id: number) => jsonFetch<void>(`/api/sql/queries/${id}`, 'DELETE')
export const setSavedQueryFavourite = (id: number, favourite: boolean) =>
  jsonFetch<SavedQuery>(`/api/sql/queries/${id}/favourite`, 'POST', { favourite })
export const detectParams = (sql: string) =>
  jsonFetch<{ params: string[] }>('/api/sql/queries/detect-params', 'POST', { sql })

export type SampleOutput = {
  id: number
  queryRunId: number | null
  savedQueryId: number | null
  label: string
  format: string
  rowCount: number
  columnsJson: string
  blobPath: string
  sizeBytes: number
  createdAt: string
}
export type SampleOutputRequest = {
  queryRunId?: number
  savedQueryId?: number
  label: string
  columns: string[]
  rows: unknown[][]
  redactColumns: string[]
}
export type SampleOutputDetail = { columns: string[]; rows: unknown[][] }

export const saveSample = (req: SampleOutputRequest) => jsonFetch<SampleOutput>('/api/sql/samples', 'POST', req)
export const recentSamples = () => jsonFetch<SampleOutput[]>('/api/sql/samples', 'GET')
export const samplesForQuery = (savedQueryId: number) =>
  jsonFetch<SampleOutput[]>(`/api/sql/samples/by-query/${savedQueryId}`, 'GET')
export const readSample = (id: number) => jsonFetch<SampleOutputDetail>(`/api/sql/samples/${id}`, 'GET')
export const deleteSample = (id: number) => jsonFetch<void>(`/api/sql/samples/${id}`, 'DELETE')
