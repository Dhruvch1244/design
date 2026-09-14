import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { MagnifyingGlass } from '@phosphor-icons/react'

export type PaletteItem<T extends string> = {
  id: T
  label: string
  hint: string
  group: string
  icon: React.ElementType
}

function score(item: PaletteItem<string>, query: string): number {
  const q = query.toLowerCase()
  const label = item.label.toLowerCase()
  if (label.startsWith(q)) return 3
  if (label.includes(q)) return 2
  if (item.hint.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)) return 1
  return 0
}

/**
 * Global fuzzy launcher over every tool, opened with Ctrl/Cmd+K from anywhere in the app —
 * the thing that makes a 30+ tool sidebar navigable without scanning seven collapsed groups.
 */
export function CommandPalette<T extends string>({ items, onSelect }: { items: PaletteItem<T>[]; onSelect: (id: T) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    if (!query.trim()) return items
    return items
      .map((item) => ({ item, s: score(item, query) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.item)
  }, [items, query])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isPaletteShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (isPaletteShortcut) {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => setActiveIndex(0), [query])

  function select(item: PaletteItem<T>) {
    onSelect(item.id)
    setOpen(false)
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[activeIndex]) select(results[activeIndex])
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-3 flex items-center gap-2 rounded-xl border border-rule bg-void/70 px-3 py-2 text-xs text-ink-faint transition-colors hover:border-cyan/40 hover:text-ink-soft"
      >
        <MagnifyingGlass size={13} weight="light" />
        <span className="flex-1 text-left">Search tools…</span>
        <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
      </button>

      {createPortal(
        <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-6 pt-[12vh]"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[28rem] w-full max-w-lg flex-col overflow-hidden rounded-[1.5rem] border border-rule-soft bg-surface shadow-2xl"
            >
              <div className="flex items-center gap-2.5 border-b border-rule-soft px-4 py-3.5">
                <MagnifyingGlass size={15} weight="light" className="text-ink-faint" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Jump to a tool…"
                  className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
                />
                <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">Esc</kbd>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {results.length === 0 ? (
                  <div className="p-4 text-center text-sm text-ink-faint">No tools match "{query}"</div>
                ) : (
                  results.map((item, i) => {
                    const Icon = item.icon
                    const active = i === activeIndex
                    return (
                      <button
                        key={item.id}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => select(item)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon size={16} weight="light" className={active ? 'text-cyan' : 'text-ink-faint'} />
                        <div className="flex-1">
                          <div className={`text-[13px] font-medium ${active ? 'text-ink' : 'text-ink-soft'}`}>{item.label}</div>
                          <div className="text-[10.5px] text-ink-faint">
                            {item.group} · {item.hint}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
