export type ChartSeries = { key: string; values: number[] }
export type ChartData = { labels: string[]; series: ChartSeries[] } | null

const MAX_POINTS = 60
const MAX_SERIES = 4

function isNumeric(v: unknown): v is number {
  if (typeof v === 'number') return Number.isFinite(v)
  if (typeof v === 'string' && v.trim() !== '') return Number.isFinite(Number(v))
  return false
}

/** Picks numeric columns as series and the first non-numeric column as labels (row index otherwise). */
export function buildChartData(columns: string[], rows: unknown[][]): ChartData {
  if (rows.length === 0 || rows.length > MAX_POINTS) return null

  const numericCols: number[] = []
  columns.forEach((_, ci) => {
    if (rows.every((r) => r[ci] === null || isNumeric(r[ci]))) numericCols.push(ci)
  })
  if (numericCols.length === 0) return null

  const labelCol = columns.findIndex((_, ci) => !numericCols.includes(ci))
  const labels = rows.map((r, ri) => (labelCol >= 0 ? String(r[labelCol] ?? '') : String(ri + 1)))

  const series: ChartSeries[] = numericCols.slice(0, MAX_SERIES).map((ci) => ({
    key: columns[ci],
    values: rows.map((r) => (r[ci] == null ? 0 : Number(r[ci]))),
  }))

  return { labels, series }
}
