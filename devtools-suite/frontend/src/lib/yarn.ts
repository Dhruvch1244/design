export type YarnAppStatus = Record<string, string>
export type YarnAppListRow = Record<string, string>

/** `yarn application -status <id>` — indented "Key : value" lines under an "Application Report :" header. */
export function parseYarnStatus(text: string): YarnAppStatus {
  const result: YarnAppStatus = {}
  for (const line of text.split('\n')) {
    const idx = line.indexOf(' : ')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 3).trim()
    if (key && key !== 'Application Report') result[key] = value
  }
  return result
}

/** `yarn application -list` — a tab/space-separated table with a header row of column names. */
export function parseYarnList(text: string): YarnAppListRow[] {
  const lines = text.split('\n').filter((l) => l.trim() !== '')
  const headerIdx = lines.findIndex((l) => /Application-Id/i.test(l))
  if (headerIdx === -1) return []

  const header = lines[headerIdx].trim().split(/\t+|\s{2,}/).map((h) => h.trim()).filter(Boolean)
  const rows: YarnAppListRow[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cells = lines[i].trim().split(/\t+|\s{2,}/).map((c) => c.trim()).filter(Boolean)
    if (cells.length === 0) continue
    const row: YarnAppListRow = {}
    for (let c = 0; c < header.length && c < cells.length; c++) row[header[c]] = cells[c]
    rows.push(row)
  }
  return rows
}

/** Auto-detects which of the two `yarn application` output shapes was pasted. */
export function parseYarnCliOutput(text: string): { mode: 'status'; status: YarnAppStatus } | { mode: 'list'; rows: YarnAppListRow[] } | { mode: 'unknown' } {
  if (/Application Report\s*:/.test(text)) return { mode: 'status', status: parseYarnStatus(text) }
  if (/Application-Id/i.test(text)) return { mode: 'list', rows: parseYarnList(text) }
  return { mode: 'unknown' }
}

/** Collapses the common multi-line "Diagnostics" blob to its first meaningful line + count, same idea as the Stack Trace Analyzer. */
export function summarizeDiagnostics(diagnostics: string | undefined): { headline: string; fullLineCount: number } | null {
  if (!diagnostics || !diagnostics.trim()) return null
  const lines = diagnostics.split('\n').filter((l) => l.trim() !== '')
  return { headline: lines[0], fullLineCount: lines.length }
}
