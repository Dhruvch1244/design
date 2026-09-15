import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PlugsConnected, Trash, X } from '@phosphor-icons/react'
import {
  createConnection,
  deleteConnection,
  DRIVER_LABELS,
  DRIVER_URL_EXAMPLES,
  listConnections,
  testConnection,
  updateConnection,
  type ConnectionRequest,
  type DbConnection,
  type Driver,
} from '../lib/sqlApi'
import { Button, ErrorBanner, Toggle } from './ui'

const DRIVERS: Driver[] = ['postgresql', 'mysql', 'sqlite', 'h2', 'sqlserver', 'oracle']

const EMPTY: ConnectionRequest = {
  name: '',
  driver: 'postgresql',
  jdbcUrl: '',
  username: '',
  password: '',
  readOnly: true,
  colorTag: '#2fe6f2',
}

export function ConnectionDialog({
  open,
  onClose,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  onChanged: () => void
}) {
  const [connections, setConnections] = useState<DbConnection[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ConnectionRequest>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = () => listConnections().then(setConnections).catch((e) => setError(String(e)))

  useEffect(() => {
    if (open) refresh()
  }, [open])

  function startEdit(c: DbConnection) {
    setEditingId(c.id)
    setForm({
      name: c.name,
      driver: c.driver,
      jdbcUrl: c.jdbcUrl,
      username: c.username ?? '',
      password: null, // leave unchanged unless the user types a new one
      readOnly: c.readOnly,
      colorTag: c.colorTag ?? '#2fe6f2',
    })
    setTestMessage(null)
  }

  function startNew() {
    setEditingId(null)
    setForm(EMPTY)
    setTestMessage(null)
  }

  async function save() {
    setBusy(true)
    setError(null)
    try {
      if (editingId != null) {
        await updateConnection(editingId, form)
      } else {
        await createConnection(form)
      }
      startNew()
      refresh()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number) {
    setBusy(true)
    try {
      await deleteConnection(id)
      if (editingId === id) startNew()
      refresh()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function test(id: number) {
    setTestMessage(null)
    try {
      const res = await testConnection(id)
      setTestMessage(res.message)
    } catch (e) {
      setTestMessage(e instanceof Error ? e.message : 'Test failed')
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[36rem] w-[52rem] overflow-hidden rounded-[1.75rem] border border-rule-soft bg-surface shadow-2xl"
        >
          <div className="flex w-64 shrink-0 flex-col border-r border-rule-soft p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Connections</span>
              <button onClick={onClose} className="text-ink-faint hover:text-ink">
                <X size={14} weight="bold" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {connections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => startEdit(c)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                    editingId === c.id ? 'bg-white/[0.08] text-ink' : 'text-ink-soft hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.colorTag ?? '#2fe6f2' }} />
                  <span className="flex-1 truncate">{c.name}</span>
                  {c.readOnly && <span className="text-[9px] text-ink-faint">RO</span>}
                </button>
              ))}
            </div>
            <Button variant="default" className="mt-2 w-full" onClick={startNew}>
              + New connection
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-auto p-5">
            {error && <ErrorBanner message={error} />}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Name">
                <input className="devtools-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Driver">
                <select
                  className="devtools-input"
                  value={form.driver}
                  onChange={(e) => setForm({ ...form, driver: e.target.value as Driver })}
                >
                  {DRIVERS.map((d) => (
                    <option key={d} value={d}>
                      {DRIVER_LABELS[d]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="JDBC URL">
              <input
                className="devtools-input font-mono"
                placeholder={DRIVER_URL_EXAMPLES[form.driver]}
                value={form.jdbcUrl}
                onChange={(e) => setForm({ ...form, jdbcUrl: e.target.value })}
              />
              <div className="mt-1 text-[10.5px] text-ink-faint">e.g. {DRIVER_URL_EXAMPLES[form.driver]}</div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Username">
                <input className="devtools-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  className="devtools-input"
                  placeholder={editingId != null ? '(unchanged)' : ''}
                  value={form.password ?? ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-rule bg-panel px-3.5 py-2.5">
              <Toggle checked={form.readOnly} onChange={(v) => setForm({ ...form, readOnly: v })} label="Read-only (blocks INSERT/UPDATE/DELETE/DDL)" />
              <input
                type="color"
                value={form.colorTag}
                onChange={(e) => setForm({ ...form, colorTag: e.target.value })}
                className="h-6 w-8 cursor-pointer rounded border border-rule bg-transparent"
              />
            </div>

            {testMessage && <div className="text-xs text-ink-soft">{testMessage}</div>}

            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
              <div className="flex gap-2">
                {editingId != null && (
                  <>
                    <Button variant="ghost" onClick={() => test(editingId)} disabled={busy}>
                      <PlugsConnected size={14} weight="light" /> Test
                    </Button>
                    <Button variant="ghost" onClick={() => remove(editingId)} disabled={busy}>
                      <Trash size={14} weight="light" /> Delete
                    </Button>
                  </>
                )}
              </div>
              <Button variant="primary" onClick={save} disabled={busy || !form.name || !form.jdbcUrl}>
                {editingId != null ? 'Save changes' : 'Add connection'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</span>
      {children}
    </label>
  )
}
