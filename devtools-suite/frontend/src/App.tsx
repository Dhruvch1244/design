import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BracketsCurly, ListMagnifyingGlass, ListNumbers, CircleDashed } from '@phosphor-icons/react'
import { FileSearchPage } from './pages/FileSearchPage'
import { JsonXmlPage } from './pages/JsonXmlPage'
import { ListConverterPage } from './pages/ListConverterPage'
import { SettingsPopover } from './components/SettingsPopover'
import { applyTheme, getStoredTheme } from './lib/themes'
import { applyFont, getStoredFont } from './lib/fonts'

type Tool = 'file-search' | 'json-xml' | 'list-convert'

const TOOLS: { id: Tool; label: string; hint: string; icon: React.ElementType }[] = [
  { id: 'file-search', label: 'File Search', hint: 'grep any file', icon: ListMagnifyingGlass },
  { id: 'json-xml', label: 'JSON / XML', hint: 'format & convert', icon: BracketsCurly },
  { id: 'list-convert', label: 'List Converter', hint: "a,b,c → ('a','b','c')", icon: ListNumbers },
]

function App() {
  const [tool, setTool] = useState<Tool>('file-search')

  useEffect(() => {
    applyTheme(getStoredTheme())
    applyFont(getStoredFont())
  }, [])

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-void text-ink">
      <div className="bg-glow" />
      <div className="noise-overlay" />

      <aside className="relative z-10 flex w-60 shrink-0 flex-col gap-1 border-r border-rule-soft bg-surface p-3">
        <div className="mb-5 flex items-center gap-2 px-2 pt-2">
          <CircleDashed size={18} weight="light" className="text-cyan" />
          <div>
            <div className="text-sm font-semibold tracking-tight">Dev Tools</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">local · offline</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {TOOLS.map((t, i) => {
            const active = tool === t.id
            const Icon = t.icon
            return (
              <motion.button
                key={t.id}
                onClick={() => setTool(t.id)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 26 }}
                whileHover={{ x: active ? 0 : 2 }}
                className="relative rounded-2xl px-3 py-2.5 text-left"
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.08]"
                  />
                )}
                <div className="relative flex items-center gap-2.5">
                  <Icon size={16} weight="light" className={active ? 'text-cyan' : 'text-ink-faint'} />
                  <div>
                    <div className={`text-[13px] font-medium ${active ? 'text-ink' : 'text-ink-soft'}`}>{t.label}</div>
                    <div className="text-[10.5px] text-ink-faint">{t.hint}</div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </nav>

        <SettingsPopover />
      </aside>

      <main className="relative z-10 flex-1 overflow-hidden p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tool}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="h-full"
          >
            {tool === 'file-search' && <FileSearchPage />}
            {tool === 'json-xml' && <JsonXmlPage />}
            {tool === 'list-convert' && <ListConverterPage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
