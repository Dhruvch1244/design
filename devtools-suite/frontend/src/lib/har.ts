export type HarRequest = {
  url: string
  method: string
  status: number
  startedDateTime: string
  timeMs: number
  sizeBytes: number
  mimeType: string
  startOffsetMs: number
}

export function parseHar(text: string): HarRequest[] {
  const doc = JSON.parse(text)
  const entries: any[] = doc?.log?.entries ?? []
  if (!Array.isArray(entries)) throw new Error('Not a HAR file — expected log.entries[]')

  const parsed = entries.map((e) => ({
    url: e.request?.url ?? '',
    method: e.request?.method ?? 'GET',
    status: e.response?.status ?? 0,
    startedDateTime: e.startedDateTime ?? '',
    timeMs: Number(e.time ?? 0),
    sizeBytes: Number(e.response?.content?.size ?? e.response?.bodySize ?? 0),
    mimeType: e.response?.content?.mimeType ?? '',
    startOffsetMs: 0,
  }))

  const firstStart = parsed.length ? new Date(parsed[0].startedDateTime).getTime() : 0
  for (const p of parsed) {
    const t = new Date(p.startedDateTime).getTime()
    p.startOffsetMs = Number.isNaN(t) || Number.isNaN(firstStart) ? 0 : t - firstStart
  }
  return parsed.sort((a, b) => a.startOffsetMs - b.startOffsetMs)
}

export function harSummary(requests: HarRequest[]) {
  const totalTime = requests.reduce((sum, r) => Math.max(sum, r.startOffsetMs + r.timeMs), 0)
  const totalBytes = requests.reduce((sum, r) => sum + r.sizeBytes, 0)
  const failed = requests.filter((r) => r.status >= 400 || r.status === 0).length
  const urlCounts = new Map<string, number>()
  for (const r of requests) urlCounts.set(r.url, (urlCounts.get(r.url) ?? 0) + 1)
  const duplicates = Array.from(urlCounts.entries()).filter(([, count]) => count > 1)
  return { totalTime, totalBytes, failed, duplicates, count: requests.length }
}
