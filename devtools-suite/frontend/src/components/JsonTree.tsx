import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretRight } from '@phosphor-icons/react'

function valueColor(value: unknown): string {
  if (value === null) return 'text-ink-faint'
  switch (typeof value) {
    case 'string': return 'text-emerald'
    case 'number': return 'text-warm'
    case 'boolean': return 'text-cyan'
    default: return 'text-ink'
  }
}

function Leaf({ value }: { value: unknown }) {
  const display = value === null ? 'null' : typeof value === 'string' ? `"${value}"` : String(value)
  return <span className={valueColor(value)}>{display}</span>
}

function Node({ label, value, depth }: { label: string | null; value: unknown; depth: number }) {
  const isArray = Array.isArray(value)
  const isObject = value !== null && typeof value === 'object' && !isArray
  const [open, setOpen] = useState(depth < 2)

  if (!isArray && !isObject) {
    return (
      <div className="py-0.5" style={{ paddingLeft: depth * 18 }}>
        {label !== null && <span className="text-ink-soft">{label}: </span>}
        <Leaf value={value} />
      </div>
    )
  }

  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>)

  const bracket = isArray ? ['[', ']'] : ['{', '}']

  return (
    <div>
      <div
        className="flex cursor-pointer select-none items-center gap-1.5 rounded-lg py-1 hover:bg-white/[0.04]"
        style={{ paddingLeft: depth * 18 }}
        onClick={() => setOpen((o) => !o)}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="flex text-ink-faint"
        >
          <CaretRight size={11} weight="bold" />
        </motion.span>
        {label !== null && <span className="text-ink-soft">{label}: </span>}
        <span className="text-ink-faint">
          {bracket[0]}
          {!open && `…${bracket[1]} (${entries.length})`}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            {entries.map(([k, v]) => (
              <Node key={k} label={isArray ? null : k} value={v} depth={depth + 1} />
            ))}
            <div className="text-ink-faint" style={{ paddingLeft: depth * 18 }}>
              {bracket[1]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function JsonTree({ data }: { data: unknown }) {
  return (
    <div className="overflow-auto rounded-2xl border border-rule bg-void/70 p-4 font-mono text-[13px] leading-relaxed shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
      <Node label={null} value={data} depth={0} />
    </div>
  )
}
