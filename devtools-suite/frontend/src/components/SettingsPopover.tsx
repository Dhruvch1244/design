import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Gear, TextAa } from '@phosphor-icons/react'
import { THEMES, applyTheme, getStoredTheme } from '../lib/themes'
import { FONTS, applyFont, getStoredFont } from '../lib/fonts'

export function SettingsPopover() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(getStoredTheme())
  const [font, setFont] = useState(getStoredFont())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative mt-auto">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-ink-soft transition-colors hover:bg-white/[0.05] hover:text-ink"
      >
        <Gear size={16} weight="light" />
        <span className="text-[13px] font-medium">Appearance</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute bottom-full left-0 mb-2 w-72 rounded-[1.5rem] bg-white/[0.03] p-1.5 ring-1 ring-white/[0.08]"
          >
            <div className="rounded-[calc(1.5rem-0.375rem)] border border-rule-soft bg-surface p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">Theme</div>
              <div className="mb-4 grid grid-cols-2 gap-1.5">
                {THEMES.map((t) => {
                  const active = theme === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        applyTheme(t.id)
                        setTheme(t.id)
                      }}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition-colors ${
                        active ? 'border-cyan/50 bg-white/[0.05] text-ink' : 'border-rule-soft text-ink-soft hover:border-rule hover:text-ink'
                      }`}
                    >
                      <span className="flex h-4 w-4 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                        <span className="h-full w-1/3" style={{ background: t.swatch[0] }} />
                        <span className="h-full w-1/3" style={{ background: t.swatch[1] }} />
                        <span className="h-full w-1/3" style={{ background: t.swatch[2] }} />
                      </span>
                      <span className="flex-1 truncate">{t.name}</span>
                      {active && <Check size={12} weight="bold" className="text-cyan" />}
                    </button>
                  )
                })}
              </div>

              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                <TextAa size={12} weight="light" /> Code font
              </div>
              <div className="flex flex-col gap-1">
                {FONTS.map((f) => {
                  const active = font === f.id
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        applyFont(f.id)
                        setFont(f.id)
                      }}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors ${
                        active ? 'border-cyan/50 bg-white/[0.05]' : 'border-rule-soft hover:border-rule'
                      }`}
                    >
                      <span className="text-xs text-ink-soft">{f.name}</span>
                      <span style={{ fontFamily: f.stack }} className="text-sm text-ink">
                        {f.sample}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
