import { useEffect, useRef } from 'react'
import type { SlashCommand } from '../lib/noteSnippets'

export function SlashMenu({
  commands,
  activeIndex,
  position,
  onSelect,
}: {
  commands: SlashCommand[]
  activeIndex: number
  position: { top: number; left: number }
  onSelect: (cmd: SlashCommand) => void
}) {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (commands.length === 0) return null

  return (
    <div
      className="absolute z-50 flex max-h-56 w-56 flex-col gap-0.5 overflow-auto rounded-xl border border-rule bg-surface p-1.5 shadow-2xl"
      style={{ top: position.top, left: position.left }}
    >
      {commands.map((cmd, i) => (
        <button
          key={cmd.id}
          ref={i === activeIndex ? activeRef : undefined}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(cmd)
          }}
          className={`flex flex-col items-start rounded-lg px-2.5 py-1.5 text-left transition-colors ${
            i === activeIndex ? 'bg-glass-strong text-ink' : 'text-ink-soft hover:bg-glass'
          }`}
        >
          <span className="text-xs font-medium">{cmd.label}</span>
          {cmd.hint && <span className="text-[10px] text-ink-faint">{cmd.hint}</span>}
        </button>
      ))}
    </div>
  )
}
