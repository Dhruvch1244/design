import { useEffect, useState } from 'react'
import { CheckCircle, Circle, DotsThreeCircle, Plus, Trash } from '@phosphor-icons/react'
import {
  completeTask,
  createTask,
  deleteTask,
  listTasks,
  reopenTask,
  startTask,
  updateTask,
  type TaskItem,
  type TaskStatus,
} from '../lib/tasksApi'
import { Button, Panel, SectionLabel } from '../components/ui'

export function TaskListPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const refresh = () => listTasks().then(setTasks)
  useEffect(() => { refresh() }, [])

  async function add() {
    if (!newTitle.trim()) return
    await createTask({ title: newTitle.trim(), notes: null })
    setNewTitle('')
    refresh()
  }

  async function cycleStatus(t: TaskItem) {
    if (t.status === 'TODO') await startTask(t.id)
    else if (t.status === 'IN_PROGRESS') await completeTask(t.id)
    else await reopenTask(t.id)
    refresh()
  }

  async function saveTitle(id: number) {
    if (editTitle.trim()) await updateTask(id, { title: editTitle.trim(), notes: tasks.find((t) => t.id === id)?.notes ?? null })
    setEditingId(null)
    refresh()
  }

  async function remove(id: number, title: string) {
    if (!window.confirm(`Delete task "${title}"? This can't be undone.`)) return
    await deleteTask(id)
    refresh()
  }

  const groups: { label: string; status: TaskStatus }[] = [
    { label: 'In progress', status: 'IN_PROGRESS' },
    { label: 'To do', status: 'TODO' },
    { label: 'Done', status: 'DONE' },
  ]

  return (
    <div className="flex h-full gap-4">
      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <input
              className="devtools-input flex-1"
              placeholder="Add a task…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <Button variant="primary" onClick={add} disabled={!newTitle.trim()}>
              <Plus size={14} weight="bold" /> Add
            </Button>
          </div>

          {tasks.length === 0 && <div className="p-4 text-center text-sm text-ink-faint">No tasks yet — add one above.</div>}

          {groups.map(({ label, status }) => {
            const items = tasks.filter((t) => t.status === status)
            if (items.length === 0) return null
            return (
              <div key={status} className="flex flex-col gap-1.5">
                <SectionLabel>{label} ({items.length})</SectionLabel>
                {items.map((t) => (
                  <div key={t.id} className="group flex items-start gap-2.5 rounded-xl border border-rule-soft bg-glass px-3 py-2.5">
                    <button onClick={() => cycleStatus(t)} className="mt-0.5 shrink-0 text-ink-faint hover:text-cyan">
                      <StatusIcon status={t.status} />
                    </button>

                    <div className="flex flex-1 flex-col gap-0.5">
                      {editingId === t.id ? (
                        <input
                          autoFocus
                          className="devtools-input py-1"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => saveTitle(t.id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveTitle(t.id)}
                        />
                      ) : (
                        <button
                          onClick={() => { setEditingId(t.id); setEditTitle(t.title) }}
                          className={`text-left text-sm ${t.status === 'DONE' ? 'text-ink-faint line-through' : 'text-ink'}`}
                        >
                          {t.title}
                        </button>
                      )}
                      <div className="text-[10.5px] text-ink-faint">{timingLine(t)}</div>
                    </div>

                    <button onClick={() => remove(t.id, t.title)} className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100">
                      <Trash size={13} weight="light" />
                    </button>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'DONE') return <CheckCircle size={18} weight="fill" className="text-emerald" />
  if (status === 'IN_PROGRESS') return <DotsThreeCircle size={18} weight="fill" className="text-cyan" />
  return <Circle size={18} weight="light" />
}

function timingLine(t: TaskItem): string {
  const created = fmt(t.createdAt)
  if (t.status === 'DONE' && t.completedAt && t.startedAt) {
    return `Started ${fmt(t.startedAt)} · Done ${fmt(t.completedAt)} · took ${duration(t.startedAt, t.completedAt)}`
  }
  if (t.status === 'IN_PROGRESS' && t.startedAt) {
    return `Started ${fmt(t.startedAt)} · running for ${duration(t.startedAt, new Date().toISOString())}`
  }
  return `Created ${created}`
}

function fmt(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return sameDay ? `today at ${time}` : `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${time}`
}

function duration(fromIso: string, toIso: string): string {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime()
  const mins = Math.max(0, Math.round(ms / 60000))
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const rem = mins % 60
  if (hours < 24) return `${hours}h ${rem}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}
