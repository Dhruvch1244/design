import { useEffect, useState } from 'react'
import { Plus, X } from '@phosphor-icons/react'
import { Panel, CopyButton } from '../components/ui'

type Tab = { id: string; title: string; content: string }

const STORAGE_KEY = 'devtools.scratchpad.tabs'

function load(): Tab[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupt or unavailable storage — fall back to a fresh tab */
  }
  return [{ id: crypto.randomUUID(), title: 'Untitled', content: '' }]
}

export function ScratchpadPage() {
  const [tabs, setTabs] = useState<Tab[]>(load)
  const [activeId, setActiveId] = useState(tabs[0]?.id)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs))
  }, [tabs])

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]

  function addTab() {
    const t: Tab = { id: crypto.randomUUID(), title: `Untitled ${tabs.length + 1}`, content: '' }
    setTabs([...tabs, t])
    setActiveId(t.id)
  }

  function closeTab(id: string) {
    const next = tabs.filter((t) => t.id !== id)
    setTabs(next.length ? next : [{ id: crypto.randomUUID(), title: 'Untitled', content: '' }])
    if (activeId === id) setActiveId(next[0]?.id)
  }

  function update(id: string, patch: Partial<Tab>) {
    setTabs(tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-rule bg-void/70 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`group flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition-colors ${
              t.id === active?.id ? 'bg-white/[0.08] text-ink' : 'text-ink-faint hover:text-ink-soft'
            }`}
          >
            {t.title || 'Untitled'}
            <X
              size={11}
              weight="bold"
              className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                closeTab(t.id)
              }}
            />
          </button>
        ))}
        <button onClick={addTab} className="shrink-0 rounded-xl px-2.5 py-1.5 text-ink-faint hover:text-cyan">
          <Plus size={13} weight="bold" />
        </button>
      </div>

      {active && (
        <Panel className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <input
                value={active.title}
                onChange={(e) => update(active.id, { title: e.target.value })}
                className="flex-1 bg-transparent text-sm font-medium text-ink outline-none"
                placeholder="Tab title"
              />
              <CopyButton text={active.content} />
            </div>
            <textarea
              value={active.content}
              onChange={(e) => update(active.id, { content: e.target.value })}
              spellCheck={false}
              className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-cyan/50"
            />
          </div>
        </Panel>
      )}
    </div>
  )
}
