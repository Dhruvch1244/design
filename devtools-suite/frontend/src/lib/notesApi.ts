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

export type Folder = { id: number; parentId: number | null; name: string; colorTag: string | null; createdAt: string }
export type FolderRequest = { parentId: number | null; name: string; colorTag: string | null }

export const listFolders = () => jsonFetch<Folder[]>('/api/notes/folders', 'GET')
export const createFolder = (req: FolderRequest) => jsonFetch<Folder>('/api/notes/folders', 'POST', req)
export const updateFolder = (id: number, req: FolderRequest) => jsonFetch<Folder>(`/api/notes/folders/${id}`, 'PUT', req)
export const deleteFolder = (id: number) => jsonFetch<void>(`/api/notes/folders/${id}`, 'DELETE')

export type Note = {
  id: number
  folderId: number | null
  title: string
  body: string
  tags: string | null
  favourite: boolean
  createdAt: string
  updatedAt: string
}
export type NoteRequest = { folderId: number | null; title: string; body: string; tags: string; favourite: boolean }

export const listNotes = (folderId?: number) => jsonFetch<Note[]>(`/api/notes${folderId != null ? `?folderId=${folderId}` : ''}`, 'GET')
export const searchNotes = (q: string) => jsonFetch<Note[]>(`/api/notes/search?q=${encodeURIComponent(q)}`, 'GET')
export const getNote = (id: number) => jsonFetch<Note>(`/api/notes/${id}`, 'GET')
export const getBacklinks = (id: number) => jsonFetch<Note[]>(`/api/notes/${id}/backlinks`, 'GET')
export const createNote = (req: NoteRequest) => jsonFetch<Note>('/api/notes', 'POST', req)
export const updateNote = (id: number, req: NoteRequest) => jsonFetch<Note>(`/api/notes/${id}`, 'PUT', req)
export const deleteNote = (id: number) => jsonFetch<void>(`/api/notes/${id}`, 'DELETE')
export const setNoteFavourite = (id: number, favourite: boolean) => jsonFetch<Note>(`/api/notes/${id}/favourite`, 'POST', { favourite })
