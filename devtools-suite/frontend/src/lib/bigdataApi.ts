export type ColumnStat = {
  name: string
  nonNullCount: number
  nullCount: number
  approxDistinctCount: number
  distinctCountTruncated: boolean
  sampleValues: string[]
  inferredType: string
  minValue: string | null
  maxValue: string | null
}
export type CsvProfileResult = { totalRows: number; malformedRowCount: number; columns: ColumnStat[] }

export async function profileCsvPath(path: string, delimiter: string, hasHeader: boolean): Promise<CsvProfileResult> {
  const res = await fetch('/api/bigdata/csv-profile/path', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, delimiter, hasHeader }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: res.statusText }))).error)
  return res.json()
}

export async function profileCsvUpload(file: File, delimiter: string, hasHeader: boolean): Promise<CsvProfileResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('delimiter', delimiter)
  form.append('hasHeader', String(hasHeader))
  const res = await fetch('/api/bigdata/csv-profile', { method: 'POST', body: form })
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: res.statusText }))).error)
  return res.json()
}
