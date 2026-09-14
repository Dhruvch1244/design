export type HistoryEntry = {
  id: number
  tool: string
  label: string
  input: string
  output: string
  createdAt: string
}

async function jsonFetch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json()
}

export type FileSearchMatch = { lineNumber: number; line: string }
export type TermMatches = { term: string; matchCount: number; matches: FileSearchMatch[]; truncated: boolean }
export type FileSearchResult = {
  fileName: string
  fileSizeBytes: number
  totalLines: number
  totalMatches: number
  termResults: TermMatches[]
}

export async function searchFile(params: {
  file: File
  terms: string
  regex: boolean
  caseSensitive: boolean
  maxSizeBytes?: number
}): Promise<FileSearchResult> {
  const form = new FormData()
  form.append('file', params.file)
  form.append('terms', params.terms)
  form.append('regex', String(params.regex))
  form.append('caseSensitive', String(params.caseSensitive))
  if (params.maxSizeBytes) form.append('maxSizeBytes', String(params.maxSizeBytes))

  const res = await fetch('/api/file-search', { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json()
}

/**
 * Search a file already on local disk by absolute path — read directly by the backend, no upload.
 * This is the mode to use for large files (tens of GB): the browser-upload endpoint above copies
 * the whole file into a Tomcat temp file first, which doesn't scale past a few hundred MB.
 */
export async function searchPath(params: {
  path: string
  terms: string
  regex: boolean
  caseSensitive: boolean
  maxSizeBytes?: number
}): Promise<FileSearchResult> {
  return jsonFetch<FileSearchResult>('/api/file-search/path', {
    path: params.path,
    terms: params.terms.split('\n').map((t) => t.trim()).filter(Boolean),
    regex: params.regex,
    caseSensitive: params.caseSensitive,
    maxSizeBytes: params.maxSizeBytes,
  })
}

export type JsonFormatResult = {
  valid: boolean
  pretty: string | null
  data: unknown
  error: string | null
  fallbackFormatted: string | null
}
export const formatJson = (text: string) => jsonFetch<JsonFormatResult>('/api/format/json', { text })

export type XmlFormatResult = {
  valid: boolean
  pretty: string | null
  error: string | null
  fallbackFormatted: string | null
}
export const formatXml = (text: string) => jsonFetch<XmlFormatResult>('/api/format/xml', { text })

export type ConvertResult = { success: boolean; output: string | null; error: string | null }
export const jsonToString = (text: string) => jsonFetch<ConvertResult>('/api/format/json-to-string', { text })
export const stringToJson = (text: string) => jsonFetch<ConvertResult>('/api/format/string-to-json', { text })

export type ListConvertResult = { quoted: string; unquoted: string; itemCount: number }
export const convertList = (text: string) => jsonFetch<ListConvertResult>('/api/list-convert', { text })

export async function fetchHistory(tool: string): Promise<HistoryEntry[]> {
  const res = await fetch(`/api/history/${tool}`)
  if (!res.ok) return []
  return res.json()
}

export async function deleteHistory(id: number): Promise<void> {
  await fetch(`/api/history/${id}`, { method: 'DELETE' })
}
