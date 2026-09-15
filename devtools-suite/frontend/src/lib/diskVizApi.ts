async function jsonFetch<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: res.statusText }))).error ?? 'Request failed')
  const text = await res.text()
  return text ? JSON.parse(text) : (undefined as T)
}

export type DiskNode = {
  name: string
  path: string
  sizeBytes: number
  directory: boolean
  childCount: number
  children: DiskNode[]
}

export const scanDisk = (path: string, maxDepth = 2) => jsonFetch<DiskNode>('/api/diskviz/scan', 'POST', { path, maxDepth })
