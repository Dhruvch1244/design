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
import { listTasks, type TaskItem } from '../lib/tasksApi'
import { buildFolderTree } from '../lib/folderTree'
import { exportNoteAsHtml, exportNoteAsMarkdown, markdownToSafeHtml } from '../lib/export'
import { getCaretCoordinates } from '../lib/textareaCaret'
import { SLASH_COMMANDS, resolveTemplate, imageMarkdown, taskRefMarkdown, type SlashCommand } from '../lib/noteSnippets'
import { FolderTree } from '../components/FolderTree'
import { SlashMenu } from '../components/SlashMenu'
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
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [slash, setSlash] = useState<{ start: number; query: string; pos: { top: number; left: number } } | null>(null)
  const [slashIndex, setSlashIndex] = useState(0)
  const [pendingInsertAt, setPendingInsertAt] = useState<number | null>(null)
  const [taskPickerOpen, setTaskPickerOpen] = useState(false)
  const [tasks, setTasks] = useState<TaskItem[]>([])

  const tasksById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks])
  const filteredSlashCommands = useMemo(() => {
    if (!slash) return []
    const q = slash.query.toLowerCase()
    return q ? SLASH_COMMANDS.filter((c) => c.id.includes(q) || c.label.toLowerCase().includes(q)) : SLASH_COMMANDS
  }, [slash])

  const refreshFolders = () => listFolders().then(setFolders)
  const refreshNotes = () => listNotes(selectedFolderId ?? undefined).then(setNotes)

  useEffect(() => {
    refreshFolders()
    listTasks().then(setTasks)
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

  async function removeNote(id: number, title: string) {
    if (!window.confirm(`Delete note "${title || 'Untitled'}"? This can't be undone.`)) return
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

  function detectSlash(text: string, caret: number): { start: number; query: string } | null {
    const upToCaret = text.slice(0, caret)
    const lineStart = upToCaret.lastIndexOf('\n') + 1
    const linePrefix = upToCaret.slice(lineStart)
    const match = linePrefix.match(/(?:^|\s)\/(\w*)$/)
    if (!match) return null
    const slashOffsetInLine = linePrefix.lastIndexOf('/')
    return { start: lineStart + slashOffsetInLine, query: match[1] }
  }

  function updateSlashState() {
    const el = bodyRef.current
    if (!el) return
    const caret = el.selectionStart
    const found = detectSlash(el.value, caret)
    if (!found) {
      setSlash(null)
      return
    }
    const caretPx = getCaretCoordinates(el, caret)
    setSlashIndex(0)
    setSlash({ start: found.start, query: found.query, pos: { top: caretPx.top + caretPx.height + 4, left: caretPx.left } })
  }

  function insertAtCursor(text: string, replaceFrom?: number, replaceTo?: number) {
    const el = bodyRef.current
    if (!el) return
    const from = replaceFrom ?? el.selectionStart
    const to = replaceTo ?? el.selectionEnd
    const next = draftBody.slice(0, from) + text + draftBody.slice(to)
    setDraftBody(next)
    scheduleSave(draftTitle, next, draftTags)
    requestAnimationFrame(() => {
      el.focus()
      const pos = from + text.length
      el.setSelectionRange(pos, pos)
    })
  }

  function selectSlashCommand(cmd: SlashCommand) {
    if (!slash) return
    const el = bodyRef.current
    const caret = el?.selectionStart ?? slash.start

    if (cmd.special === 'image' || cmd.special === 'task-ref') {
      // Remove the typed "/query" text now; the picked image/task gets inserted at the same spot later.
      const next = draftBody.slice(0, slash.start) + draftBody.slice(caret)
      setDraftBody(next)
      scheduleSave(draftTitle, next, draftTags)
      setPendingInsertAt(slash.start)
      setSlash(null)
      if (cmd.special === 'image') imageInputRef.current?.click()
      else setTaskPickerOpen(true)
      return
    }

    const template = resolveTemplate(cmd)
    const cursorMarker = template.indexOf('{cursor}')
    const text = template.replace('{cursor}', '')
    const next = draftBody.slice(0, slash.start) + text + draftBody.slice(caret)
    setDraftBody(next)
    scheduleSave(draftTitle, next, draftTags)
    setSlash(null)
    requestAnimationFrame(() => {
      el?.focus()
      const pos = slash.start + (cursorMarker >= 0 ? cursorMarker : text.length)
      el?.setSelectionRange(pos, pos)
    })
  }

  function handleBodyKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!slash || filteredSlashCommands.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSlashIndex((i) => (i + 1) % filteredSlashCommands.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSlashIndex((i) => (i - 1 + filteredSlashCommands.length) % filteredSlashCommands.length)
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      selectSlashCommand(filteredSlashCommands[slashIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setSlash(null)
    }
  }

  function readImageAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function insertImageFile(file: File, at: number | null) {
    const dataUrl = await readImageAsDataUrl(file)
    const md = imageMarkdown(file.name.replace(/\.[^.]+$/, ''), dataUrl)
    if (at != null) insertAtCursor(md, at, at)
    else insertAtCursor(md)
  }

  function handleImageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    insertImageFile(file, pendingInsertAt)
    setPendingInsertAt(null)
  }

  function handleBodyPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'))
    if (!item) return
    e.preventDefault()
    const file = item.getAsFile()
    if (file) insertImageFile(file, null)
  }

  function handleBodyDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'))
    if (!file) return
    e.preventDefault()
    insertImageFile(file, null)
  }

  function pickTaskRef(taskId: number) {
    const at = pendingInsertAt
    if (at != null) insertAtCursor(taskRefMarkdown(taskId), at, at)
    else insertAtCursor(taskRefMarkdown(taskId))
    setPendingInsertAt(null)
    setTaskPickerOpen(false)
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
              className={`rounded-lg px-2 py-1 text-left text-xs ${selectedFolderId === null ? 'bg-glass-strong text-ink' : 'text-ink-soft hover:bg-glass'}`}
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
                    activeNoteId === n.id ? 'bg-glass-strong text-ink' : 'text-ink-soft hover:bg-glass'
                  }`}
                >
                  <button onClick={() => toggleFavourite(n)} className="shrink-0 text-ink-faint hover:text-warm">
                    <Star size={11} weight={n.favourite ? 'fill' : 'light'} className={n.favourite ? 'text-warm' : ''} />
                  </button>
                  <button onClick={() => setActiveNoteId(n.id)} className="flex-1 truncate text-left">
                    {n.title || 'Untitled'}
                  </button>
                  <button onClick={() => removeNote(n.id, n.title)} className="shrink-0 opacity-0 transition-opacity hover:text-rose group-hover:opacity-100">
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
                className={`rounded-lg px-2.5 py-1.5 text-xs ${preview ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'}`}
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
              <div className="relative">
                <textarea
                  ref={bodyRef}
                  value={draftBody}
                  onChange={(e) => {
                    setDraftBody(e.target.value)
                    scheduleSave(draftTitle, e.target.value, draftTags)
                    updateSlashState()
                  }}
                  onKeyDown={handleBodyKeyDown}
                  onKeyUp={(e) => {
                    if (!['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) updateSlashState()
                  }}
                  onClick={updateSlashState}
                  onPaste={handleBodyPaste}
                  onDrop={handleBodyDrop}
                  onDragOver={(e) => e.preventDefault()}
                  spellCheck={false}
                  placeholder={'Markdown supported. Link a note with [[Note Title]]. Type / for tables, tasks, images…'}
                  className="h-full w-full resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-cyan/50"
                />
                {slash && (
                  <SlashMenu commands={filteredSlashCommands} activeIndex={slashIndex} position={slash.pos} onSelect={selectSlashCommand} />
                )}
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageInputChange} className="hidden" />
                {taskPickerOpen && (
                  <div className="absolute inset-0 z-50 flex items-start justify-center bg-void/60 pt-8" onClick={() => setTaskPickerOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="flex max-h-64 w-64 flex-col gap-0.5 overflow-auto rounded-xl border border-rule bg-surface p-1.5 shadow-2xl">
                      {tasks.length === 0 && <div className="p-2 text-xs text-ink-faint">No tasks yet — add one in Task List.</div>}
                      {tasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => pickTaskRef(t.id)}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-ink-soft hover:bg-glass"
                        >
                          <span>{t.status === 'DONE' ? '✅' : t.status === 'IN_PROGRESS' ? '🔵' : '⬜'}</span>
                          <span className="truncate">{t.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {preview && (
                <div
                  className="prose-note overflow-auto rounded-2xl border border-rule bg-panel p-3.5 text-[13.5px] text-ink-soft"
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    const wikiTitle = target.dataset.wikiLink
                    if (wikiTitle) jumpToNoteByTitle(wikiTitle)
                  }}
                  dangerouslySetInnerHTML={{ __html: renderWithWikiLinks(draftBody, tasksById) }}
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
                      className="rounded-full bg-glass-strong px-2.5 py-1 text-[11px] text-cyan hover:bg-glass-strong"
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

/**
 * Renders markdown, then turns [[Title]] into a clickable pill (handled via the container's
 * onClick + data attribute), and [[task:ID]] into a live status pill sourced from tasksById
 * (resolved here, before sanitizing, since the preview is static HTML not a live component tree).
 */
function renderWithWikiLinks(markdown: string, tasksById: Map<number, TaskItem>): string {
  const withTaskRefs = markdown.replace(/\[\[task:(\d+)]]/g, (_m, id) => {
    const task = tasksById.get(Number(id))
    if (!task) return `<span class="wiki-link task-ref-missing">task #${id} — not found</span>`
    const icon = task.status === 'DONE' ? '✅' : task.status === 'IN_PROGRESS' ? '🔵' : '⬜'
    const strike = task.status === 'DONE' ? ' style="text-decoration:line-through;opacity:0.7"' : ''
    return `<span class="wiki-link task-ref"${strike}>${icon} ${escapeHtmlLite(task.title)}</span>`
  })
  const withLinks = withTaskRefs.replace(
    /\[\[([^\]]+)]]/g,
    (_m, title) => `<span data-wiki-link="${title.trim()}" class="wiki-link">${title.trim()}</span>`
  )
  return markdownToSafeHtml(withLinks)
}

function escapeHtmlLite(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))
}
