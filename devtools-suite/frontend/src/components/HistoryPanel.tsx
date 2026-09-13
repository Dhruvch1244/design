import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ClockCounterClockwise, X } from '@phosphor-icons/react'
import { deleteHistory, fetchHistory, type HistoryEntry } from '../api'
import { SectionLabel } from './ui'

export function HistoryPanel({
  tool,
  refreshKey,
  onReuse,
}: {
  tool: string
  refreshKey: number
  onReuse: (input: string) => void
}) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  const load = useCallback(() => {
    fetchHistory(tool).then(setEntries)
  }, [tool])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  return (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <ClockCounterClockwise size={12} weight="light" />
          History {entries.length > 0 && `(${entries.length})`}
        </span>
      </SectionLabel>

      {entries.length === 0 ? (
        <div className="text-xs text-ink-faint">Run the tool once to see entries here.</div>
      ) : (
        <div className="flex max-h-64 flex-col gap-1.5 overflow-auto pr-1">
          {entries.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), type: 'spring', stiffness: 380, damping: 30 }}
              className="group flex items-center justify-between gap-2 rounded-xl border border-rule-soft bg-white/[0.02] px-2.5 py-2 text-xs transition-colors hover:border-rule hover:bg-white/[0.04]"
            >
              <button
                className="flex-1 truncate text-left text-ink-soft transition-colors hover:text-ink"
                title={e.label}
                onClick={() => onReuse(e.input)}
              >
                {e.label || '(empty)'}
              </button>
              <span className="shrink-0 text-ink-faint">{new Date(e.createdAt).toLocaleTimeString()}</span>
              <button
                className="shrink-0 rounded-full p-1 text-ink-faint opacity-0 transition-all hover:bg-rose/10 hover:text-rose group-hover:opacity-100"
                onClick={async () => {
                  await deleteHistory(e.id)
                  load()
                }}
              >
                <X size={11} weight="bold" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
