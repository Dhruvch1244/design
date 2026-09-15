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

export type BeanKind = 'RestController' | 'Controller' | 'Service' | 'Repository' | 'Component' | 'Configuration'

export type SpringVizNode = { id: string; simpleName: string; packageName: string; kind: BeanKind; endpointCount: number }
export type SpringVizEdge = { from: string; to: string }
export type SpringVizEndpoint = { httpMethod: string; path: string; controllerClass: string; methodName: string }

export type SpringVizResponse = {
  nodes: SpringVizNode[]
  edges: SpringVizEdge[]
  endpoints: SpringVizEndpoint[]
  contextPath: string | null
  port: number | null
  javaFilesScanned: number
}

export const analyzeSpringRepo = (path: string) =>
  jsonFetch<SpringVizResponse>('/api/springviz/analyze', 'POST', { path })
