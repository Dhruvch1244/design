import { useEffect, useMemo, useRef, useState } from 'react'
import { DownloadSimple, FileCode as FileCodeIcon, Note as NoteIcon, Plus, Star, Trash } from '@phosphor-icons/react'
import {
  createFolder,
  createNote,
  deleteFolder,
  deleteNote,
  getBacklinks,
  listFolders,
  listNotes,
  setNoteFavourite,
  updateNote,
  type Folder,
  type Note,
} from '../lib/notesApi'
import { buildFolderTree } from '../lib/folderTree'
import { exportNoteAsHtml, exportNoteAsMarkdown, markdownToSafeHtml } from '../lib/export'
import { FolderTree } from '../components/FolderTree'
import { Button, Panel, SectionLabel } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

export function NotesPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftTags, setDraftTags] = useState('')
  const [backlinks, setBacklinks] = useState<Note[]>([])
  const [preview, setPreview] = useState(true)
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [justCreatedId, setJustCreatedId] = useState<number | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const refreshFolders = () => listFolders().then(setFolders)
  const refreshNotes = () => listNotes(selectedFolderId ?? undefined).then(setNotes)

  useEffect(() => {
    refreshFolders()
  }, [])
  useEffect(() => {
    refreshNotes()
  }, [selectedFolderId])

  const tree = useMemo(() => buildFolderTree(folders), [folders])
  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null

  useEffect(() => {
    if (activeNote) {
      setDraftTitle(activeNote.title)
      setDraftBody(activeNote.body)
      setDraftTags(activeNote.tags ?? '')
      getBacklinks(activeNote.id).then(setBacklinks)
      if (activeNote.id === justCreatedId) {
        requestAnimationFrame(() => {
          titleInputRef.current?.focus()
          titleInputRef.current?.select()
        })
        setJustCreatedId(null)
      }
    } else {
      setBacklinks([])
    }
  }, [activeNoteId]) // eslint-disable-line react-hooks/exhaustive-deps

  function scheduleSave(title: string, body: string, tags: string) {
    if (!activeNote) return
    // Optimistic: reflect the rename in the sidebar immediately instead of waiting on the debounced save.
    setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? { ...n, title, body, tags } : n)))
    if (saveTimer) clearTimeout(saveTimer)
    const t = setTimeout(async () => {
      const saved = await updateNote(activeNote.id, { folderId: activeNote.folderId, title, body, tags, favourite: activeNote.favourite })
      setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)))
    }, 500)
    setSaveTimer(t)
  }

  async function newNote() {
    const note = await createNote({ folderId: selectedFolderId, title: 'Untitled', body: '', tags: '', favourite: false })
    await refreshNotes()
    setJustCreatedId(note.id)
    setActiveNoteId(note.id)
  }

  async function removeNote(id: number) {
    await deleteNote(id)
    if (activeNoteId === id) setActiveNoteId(null)
    refreshNotes()
  }

  async function toggleFavourite(note: Note) {
    await setNoteFavourite(note.id, !note.favourite)
    refreshNotes()
  }

  async function addSubfolder(parentId: number | null) {
    const name = window.prompt('Folder name')
    if (!name) return
    await createFolder({ parentId, name, colorTag: null })
    refreshFolders()
  }

  async function removeFolder(id: number) {
    if (!window.confirm('Delete this folder? Notes inside move to the root, they are not deleted.')) return
    await deleteFolder(id)
    if (selectedFolderId === id) setSelectedFolderId(null)
    refreshFolders()
  }

  function jumpToNoteByTitle(title: string) {
    const target = notes.find((n) => n.title.toLowerCase() === title.toLowerCase())
    if (target) setActiveNoteId(target.id)
  }

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="notes-folders" defaultWidth={256} className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-2 p-3">
            <div className="flex items-center justify-between px-1">
              <SectionLabel>Folders</SectionLabel>
              <button onClick={() => addSubfolder(null)} className="text-ink-faint hover:text-cyan" title="New root folder">
                <Plus size={12} weight="bold" />
              </button>
            </div>
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`rounded-lg px-2 py-1 text-left text-xs ${selectedFolderId === null ? 'bg-white/[0.08] text-ink' : 'text-ink-soft hover:bg-white/[0.04]'}`}
            >
              All notes
            </button>
            <FolderTree nodes={tree} selectedId={selectedFolderId} onSelect={setSelectedFolderId} onAddChild={addSubfolder} onDelete={removeFolder} />
          </div>
        </Panel>
      </ResizablePanel>

      <ResizablePanel storageKey="notes-list" defaultWidth={288}><Panel className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-1 flex-col p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <SectionLabel>Notes</SectionLabel>
            <Button variant="ghost" onClick={newNote}>
              <Plus size={12} weight="bold" /> New
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            {notes.length === 0 ? (
              <div className="p-2 text-xs text-ink-faint">No notes here yet.</div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${
                    activeNoteId === n.id ? 'bg-white/[0.08] text-ink' : 'text-ink-soft hover:bg-white/[0.04]'
                  }`}
                >
                  <button onClick={() => toggleFavourite(n)} className="shrink-0 text-ink-faint hover:text-warm">
                    <Star size={11} weight={n.favourite ? 'fill' : 'light'} className={n.favourite ? 'text-warm' : ''} />
                  </button>
                  <button onClick={() => setActiveNoteId(n.id)} className="flex-1 truncate text-left">
                    {n.title || 'Untitled'}
                  </button>
                  <button onClick={() => removeNote(n.id)} className="shrink-0 opacity-0 transition-opacity hover:text-rose group-hover:opacity-100">
                    <Trash size={11} weight="light" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Panel></ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        {!activeNote ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            <div className="flex flex-col items-center gap-2">
              <NoteIcon size={28} weight="light" />
              Pick a note, or create one.
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col p-4">
            <div className="mb-1 flex items-center gap-2">
              <input
                ref={titleInputRef}
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value)
                  scheduleSave(e.target.value, draftBody, draftTags)
                }}
                className="flex-1 bg-transparent text-lg font-semibold text-ink outline-none"
                placeholder="Title"
              />
              <button
                onClick={() => setPreview((p) => !p)}
                className={`rounded-lg px-2.5 py-1.5 text-xs ${preview ? 'bg-white/[0.08] text-ink' : 'text-ink-faint hover:text-ink-soft'}`}
              >
                Preview
              </button>
              <Button variant="ghost" onClick={() => exportNoteAsMarkdown(activeNote)}>
                <FileCodeIcon size={13} weight="light" /> .md
              </Button>
              <Button variant="ghost" onClick={() => exportNoteAsHtml(activeNote)}>
                <DownloadSimple size={13} weight="light" /> .html
              </Button>
            </div>

            <div className="mb-2 text-[10.5px] text-ink-faint">
              Started {formatTimestamp(activeNote.createdAt)} · Last edited {formatTimestamp(activeNote.updatedAt)}
            </div>

            <input
              value={draftTags}
              onChange={(e) => {
                setDraftTags(e.target.value)
                scheduleSave(draftTitle, draftBody, e.target.value)
              }}
              placeholder="tags, comma, separated"
              className="mb-3 bg-transparent text-[11px] text-ink-faint outline-none"
            />

            <div className="grid flex-1 grid-cols-2 gap-3 overflow-hidden">
              <textarea
                value={draftBody}
                onChange={(e) => {
                  setDraftBody(e.target.value)
                  scheduleSave(draftTitle, e.target.value, draftTags)
                }}
                spellCheck={false}
                placeholder={'Markdown supported. Link another note with [[Note Title]].'}
                className="resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-cyan/50"
              />
              {preview && (
                <div
                  className="prose-note overflow-auto rounded-2xl border border-rule bg-panel p-3.5 text-[13.5px] text-ink-soft"
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    const wikiTitle = target.dataset.wikiLink
                    if (wikiTitle) jumpToNoteByTitle(wikiTitle)
                  }}
                  dangerouslySetInnerHTML={{ __html: renderWithWikiLinks(draftBody) }}
                />
              )}
            </div>

            {backlinks.length > 0 && (
              <div className="mt-3 shrink-0">
                <SectionLabel>Linked from</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {backlinks.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setActiveNoteId(b.id)}
                      className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-cyan hover:bg-white/[0.1]"
                    >
                      {b.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return sameDay ? `today at ${time}` : `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${time}`
}

/** Renders markdown, then turns [[Title]] into a clickable pill (handled via the container's onClick + data attribute). */
function renderWithWikiLinks(markdown: string): string {
  const withLinks = markdown.replace(
    /\[\[([^\]]+)]]/g,
    (_m, title) => `<span data-wiki-link="${title.trim()}" class="wiki-link">${title.trim()}</span>`
  )
  return markdownToSafeHtml(withLinks)
}
