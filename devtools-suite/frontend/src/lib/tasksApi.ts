async function jsonFetch<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: res.statusText }))).error ?? 'Request failed')
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return text ? JSON.parse(text) : (undefined as T)
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export type TaskItem = {
  id: number
  title: string
  notes: string | null
  status: TaskStatus
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

export type TaskRequest = { title: string; notes: string | null }

export const listTasks = () => jsonFetch<TaskItem[]>('/api/tasks', 'GET')
export const createTask = (req: TaskRequest) => jsonFetch<TaskItem>('/api/tasks', 'POST', req)
export const updateTask = (id: number, req: TaskRequest) => jsonFetch<TaskItem>(`/api/tasks/${id}`, 'PUT', req)
export const startTask = (id: number) => jsonFetch<TaskItem>(`/api/tasks/${id}/start`, 'POST')
export const completeTask = (id: number) => jsonFetch<TaskItem>(`/api/tasks/${id}/complete`, 'POST')
export const reopenTask = (id: number) => jsonFetch<TaskItem>(`/api/tasks/${id}/reopen`, 'POST')
export const deleteTask = (id: number) => jsonFetch<void>(`/api/tasks/${id}`, 'DELETE')
