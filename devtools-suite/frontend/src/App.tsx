import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BracketsCurly,
  ChartBar,
  ChartPieSlice,
  Database,
  Fingerprint,
  FileCode,
  FileText,
  FileZip,
  GitDiff,
  Globe,
  Hammer,
  Hash,
  ListMagnifyingGlass,
  ListNumbers,
  CircleDashed,
  SidebarSimple,
  TreeStructure,
  Table,
  FlowArrow,
  GitCommit,
  SquaresFour,
  Clock,
  MagicWand,
  NotePencil,
  Gauge,
  GitBranch,
  Notebook,
  GitMerge,
  Image,
  FilePdf,
  ListChecks,
  LinkSimple,
  SealCheck,
  ShieldCheck,
  Stack,
  Star,
  Terminal,
  TextAa,
  Warning,
  Waveform,
  Wrench,
  X,
} from '@phosphor-icons/react'
import { FileSearchPage } from './pages/FileSearchPage'
import { JsonXmlPage } from './pages/JsonXmlPage'
import { ListConverterPage } from './pages/ListConverterPage'
import { SqlPage } from './pages/SqlPage'
import { DiffPage } from './pages/DiffPage'
import { EncodeDecodePage } from './pages/EncodeDecodePage'
import { TimeToolkitPage } from './pages/TimeToolkitPage'
import { RegexLabPage } from './pages/RegexLabPage'
import { TextToolkitPage } from './pages/TextToolkitPage'
import { DataGeneratorPage } from './pages/DataGeneratorPage'
import { ScratchpadPage } from './pages/ScratchpadPage'
import { StackTracePage } from './pages/StackTracePage'
import { DependencyTreePage } from './pages/DependencyTreePage'
import { SpringConfigPage } from './pages/SpringConfigPage'
import { JarInspectPage } from './pages/JarInspectPage'
import { JsonToTsPage } from './pages/JsonToTsPage'
import { MarblePage } from './pages/MarblePage'
import { HarAnalyzerPage } from './pages/HarAnalyzerPage'
import { BundleStatsPage } from './pages/BundleStatsPage'
import { CorsCheckPage } from './pages/CorsCheckPage'
import { TopAnalyzerPage } from './pages/TopAnalyzerPage'
import { LinuxCommandsPage } from './pages/LinuxCommandsPage'
import { MakefilePage } from './pages/MakefilePage'
import { NotesPage } from './pages/NotesPage'
import { GitHandbookPage } from './pages/GitHandbookPage'
import { AvroSchemaPage } from './pages/AvroSchemaPage'
import { ArnToolPage } from './pages/ArnToolPage'
import { IamPolicyPage } from './pages/IamPolicyPage'
import { CertInspectPage } from './pages/CertInspectPage'
import { CsvProfilerPage } from './pages/CsvProfilerPage'
import { PartMergePage } from './pages/PartMergePage'
import { ImageToolsPage } from './pages/ImageToolsPage'
import { PdfToolsPage } from './pages/PdfToolsPage'
import { TaskListPage } from './pages/TaskListPage'
import { SpringVizPage } from './pages/SpringVizPage'
import { SqlErDiagramPage } from './pages/SqlErDiagramPage'
import { CronVisualizerPage } from './pages/CronVisualizerPage'
import { RegexVisualizerPage } from './pages/RegexVisualizerPage'
import { GitGraphPage } from './pages/GitGraphPage'
import { DiskTreemapPage } from './pages/DiskTreemapPage'
import { SettingsPopover } from './components/SettingsPopover'
import { CommandPalette, type PaletteItem } from './components/CommandPalette'
import { applyTheme, getStoredTheme } from './lib/themes'
import { applyFont, getStoredFont } from './lib/fonts'

type Tool =
  | 'spring-viz'
  | 'sql-er'
  | 'cron-viz'
  | 'regex-viz'
  | 'git-graph'
  | 'disk-treemap'
  | 'image-tools'
  | 'pdf-tools'
  | 'task-list'
  | 'file-search'
  | 'json-xml'
  | 'sql'
  | 'list-convert'
  | 'notes'
  | 'diff'
  | 'encode'
  | 'time'
  | 'regex'
  | 'text'
  | 'data-gen'
  | 'scratchpad'
  | 'stack-trace'
  | 'dep-tree'
  | 'spring-config'
  | 'jar-inspect'
  | 'json-to-ts'
  | 'marbles'
  | 'har'
  | 'bundle-stats'
  | 'cors-check'
  | 'top-analyzer'
  | 'linux-commands'
  | 'makefile'
  | 'git-handbook'
  | 'avro-schema'
  | 'arn-tool'
  | 'iam-policy'
  | 'cert-inspect'
  | 'csv-profiler'
  | 'part-merge'

type ToolDef = { id: Tool; label: string; hint: string; icon: React.ElementType }

const GROUPS: { label: string; tools: ToolDef[] }[] = [
  {
    label: 'Visualizers',
    tools: [
      { id: 'spring-viz', label: 'Spring Boot Visualizer', hint: 'controllers · services · routes', icon: TreeStructure },
      { id: 'sql-er', label: 'DB Schema (ER Diagram)', hint: 'tables · foreign keys', icon: Table },
      { id: 'cron-viz', label: 'Cron Visualizer', hint: 'timeline · weekly heatmap', icon: Clock },
      { id: 'regex-viz', label: 'Regex Diagram', hint: 'railroad-style breakdown', icon: FlowArrow },
      { id: 'git-graph', label: 'Git Commit Graph', hint: 'branch & merge visualizer', icon: GitCommit },
      { id: 'disk-treemap', label: 'Disk Usage Treemap', hint: 'where the space went', icon: SquaresFour },
    ],
  },
  {
    label: 'Everyday Tools',
    tools: [
      { id: 'image-tools', label: 'Image Tools', hint: 'convert · enhance', icon: Image },
      { id: 'pdf-tools', label: 'PDF Converter', hint: 'images ↔ pdf', icon: FilePdf },
      { id: 'task-list', label: 'Task List', hint: 'to-dos with timings', icon: ListChecks },
    ],
  },
  {
    label: 'Data & Files',
    tools: [
      { id: 'file-search', label: 'File Search', hint: 'grep any file', icon: ListMagnifyingGlass },
      { id: 'json-xml', label: 'JSON / XML', hint: 'format & convert', icon: BracketsCurly },
      { id: 'sql', label: 'SQL Workspace', hint: 'connect · query · save', icon: Database },
      { id: 'notes', label: 'Notes', hint: 'folders · links · export', icon: Notebook },
      { id: 'list-convert', label: 'List Converter', hint: "a,b,c → ('a','b','c')", icon: ListNumbers },
    ],
  },
  {
    label: 'Text & Data Tools',
    tools: [
      { id: 'diff', label: 'Diff', hint: 'compare two texts', icon: GitDiff },
      { id: 'encode', label: 'Encode / Decode', hint: 'base64 · jwt · hash', icon: Hash },
      { id: 'time', label: 'Time Toolkit', hint: 'epoch · tz · cron', icon: Clock },
      { id: 'regex', label: 'Regex Lab', hint: 'test & explore', icon: MagicWand },
      { id: 'text', label: 'Text Toolkit', hint: 'case · sort · wrap', icon: TextAa },
      { id: 'data-gen', label: 'Data Generator', hint: 'uuid · ulid · fake data', icon: Fingerprint },
      { id: 'scratchpad', label: 'Scratchpad', hint: 'persistent notes', icon: NotePencil },
    ],
  },
  {
    label: 'Java & Spring',
    tools: [
      { id: 'stack-trace', label: 'Stack Trace Analyzer', hint: 'collapse the noise', icon: Warning },
      { id: 'dep-tree', label: 'Dependency Tree', hint: 'maven / gradle', icon: Stack },
      { id: 'spring-config', label: 'Spring Config', hint: 'yaml/properties diff', icon: Wrench },
      { id: 'jar-inspect', label: 'JAR Inspector', hint: 'manifest · classes · dupes', icon: FileZip },
    ],
  },
  {
    label: 'Angular & Frontend',
    tools: [
      { id: 'json-to-ts', label: 'JSON → TypeScript', hint: 'generate interfaces', icon: FileCode },
      { id: 'marbles', label: 'RxJS Marbles', hint: 'visualize operators', icon: Waveform },
      { id: 'har', label: 'HAR Analyzer', hint: 'waterfall · slow requests', icon: FileText },
      { id: 'bundle-stats', label: 'Bundle Stats', hint: "what's inflating it", icon: ChartBar },
      { id: 'cors-check', label: 'CORS Checker', hint: 'why the preflight failed', icon: Globe },
    ],
  },
  {
    label: 'Linux & Build',
    tools: [
      { id: 'top-analyzer', label: 'top / ps Analyzer', hint: 'sort · diff snapshots', icon: Gauge },
      { id: 'linux-commands', label: 'Command Builder', hint: 'chmod · flags · explain', icon: Terminal },
      { id: 'makefile', label: 'Makefile Explainer', hint: 'targets & build order', icon: Hammer },
      { id: 'git-handbook', label: 'Git Handbook', hint: 'reference · recipes · explain', icon: GitBranch },
    ],
  },
  {
    label: 'Data Formats',
    tools: [
      { id: 'avro-schema', label: 'Avro Schema Tool', hint: 'compat check · hive ddl', icon: Database },
      { id: 'csv-profiler', label: 'Delimited File Profiler', hint: 'streams huge CSV/TSV', icon: ChartPieSlice },
      { id: 'part-merge', label: 'Part-File Merger', hint: 'merge part-* output', icon: GitMerge },
    ],
  },
  {
    label: 'AWS Helpers (offline)',
    tools: [
      { id: 'arn-tool', label: 'ARN Parser / Builder', hint: 'no connection needed', icon: LinkSimple },
      { id: 'iam-policy', label: 'IAM Policy Tool', hint: 'explain · simulate · audit', icon: ShieldCheck },
      { id: 'cert-inspect', label: 'Cert & Key Inspector', hint: 'PEM/DER · expiry', icon: SealCheck },
    ],
  },
]

const ALL_TOOLS: ToolDef[] = GROUPS.flatMap((g) => g.tools)
const TOOL_DEFS: Record<Tool, ToolDef> = Object.fromEntries(ALL_TOOLS.map((t) => [t.id, t])) as Record<Tool, ToolDef>

const FAVOURITES_KEY = 'devtools.favourite-tools'

function loadFavourites(): Tool[] {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupt storage — start with no favourites */
  }
  return []
}

function renderPage(tool: Tool) {
  switch (tool) {
    case 'spring-viz': return <SpringVizPage />
    case 'sql-er': return <SqlErDiagramPage />
    case 'cron-viz': return <CronVisualizerPage />
    case 'regex-viz': return <RegexVisualizerPage />
    case 'git-graph': return <GitGraphPage />
    case 'disk-treemap': return <DiskTreemapPage />
    case 'image-tools': return <ImageToolsPage />
    case 'pdf-tools': return <PdfToolsPage />
    case 'task-list': return <TaskListPage />
    case 'file-search': return <FileSearchPage />
    case 'json-xml': return <JsonXmlPage />
    case 'sql': return <SqlPage />
    case 'list-convert': return <ListConverterPage />
    case 'notes': return <NotesPage />
    case 'diff': return <DiffPage />
    case 'encode': return <EncodeDecodePage />
    case 'time': return <TimeToolkitPage />
    case 'regex': return <RegexLabPage />
    case 'text': return <TextToolkitPage />
    case 'data-gen': return <DataGeneratorPage />
    case 'scratchpad': return <ScratchpadPage />
    case 'stack-trace': return <StackTracePage />
    case 'dep-tree': return <DependencyTreePage />
    case 'spring-config': return <SpringConfigPage />
    case 'jar-inspect': return <JarInspectPage />
    case 'json-to-ts': return <JsonToTsPage />
    case 'marbles': return <MarblePage />
    case 'har': return <HarAnalyzerPage />
    case 'bundle-stats': return <BundleStatsPage />
    case 'cors-check': return <CorsCheckPage />
    case 'top-analyzer': return <TopAnalyzerPage />
    case 'linux-commands': return <LinuxCommandsPage />
    case 'makefile': return <MakefilePage />
    case 'git-handbook': return <GitHandbookPage />
    case 'avro-schema': return <AvroSchemaPage />
    case 'arn-tool': return <ArnToolPage />
    case 'iam-policy': return <IamPolicyPage />
    case 'cert-inspect': return <CertInspectPage />
    case 'csv-profiler': return <CsvProfilerPage />
    case 'part-merge': return <PartMergePage />
  }
}

const SESSION_KEY = 'devtools.session'
const RECENTS_KEY = 'devtools.recent-tools'
const MAX_RECENTS = 8
const SIDEBAR_KEY = 'devtools.sidebar-open'

function loadSession(): { openTabs: Tool[]; activeTab: Tool } {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.openTabs) && parsed.openTabs.length > 0 && parsed.activeTab) return parsed
    }
  } catch {
    /* corrupt storage — start fresh */
  }
  return { openTabs: ['file-search'], activeTab: 'file-search' }
}

function loadRecents(): Tool[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupt storage — start with no recents */
  }
  return []
}

function App() {
  const initialSession = useMemo(loadSession, [])
  const [openTabs, setOpenTabs] = useState<Tool[]>(initialSession.openTabs)
  const [activeTab, setActiveTab] = useState<Tool>(initialSession.activeTab)
  const [favourites, setFavourites] = useState<Tool[]>(loadFavourites)
  const [recents, setRecents] = useState<Tool[]>(loadRecents)
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem(SIDEBAR_KEY) !== '0')

  useEffect(() => {
    applyTheme(getStoredTheme())
    applyFont(getStoredFont())
  }, [])

  useEffect(() => {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favourites))
  }, [favourites])

  // Restores exactly which tools were open and which was active on reload — a real session, not a fresh start.
  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ openTabs, activeTab }))
  }, [openTabs, activeTab])

  useEffect(() => {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents))
  }, [recents])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? '1' : '0')
  }, [sidebarOpen])

  function openTool(id: Tool) {
    setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]))
    setActiveTab(id)
    setRecents((r) => [id, ...r.filter((x) => x !== id)].slice(0, MAX_RECENTS))
  }

  function closeTab(id: Tool) {
    setOpenTabs((tabs) => {
      const idx = tabs.indexOf(id)
      const next = tabs.filter((t) => t !== id)
      if (next.length === 0) return ['file-search']
      if (id === activeTab) {
        setActiveTab(next[Math.min(idx, next.length - 1)])
      }
      return next
    })
  }

  function toggleFavourite(id: Tool) {
    setFavourites((favs) => (favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]))
  }

  // Ctrl+W and Ctrl+Tab are hard-reserved by every real browser for its own tab chrome — page JS
  // can never intercept them, even with preventDefault. Alt+W / Alt+] / Alt+[ aren't reserved.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.altKey) return
      if (e.key.toLowerCase() === 'w') {
        e.preventDefault()
        closeTab(activeTab)
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setSidebarOpen((v) => !v)
      } else if (e.key === ']' || e.key === '[') {
        e.preventDefault()
        const idx = openTabs.indexOf(activeTab)
        const delta = e.key === ']' ? 1 : -1
        const nextIdx = (idx + delta + openTabs.length) % openTabs.length
        setActiveTab(openTabs[nextIdx])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openTabs, activeTab])

  const paletteItems: PaletteItem<Tool>[] = useMemo(
    () => GROUPS.flatMap((group) => group.tools.map((t) => ({ id: t.id, label: t.label, hint: t.hint, group: group.label, icon: t.icon }))),
    []
  )

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-void text-ink">
      <div className="bg-glow" />
      <div className="noise-overlay" />

      <aside
        className="relative z-10 flex shrink-0 flex-col overflow-hidden border-r border-rule-soft bg-surface transition-[width] duration-200 ease-out"
        style={{ width: sidebarOpen ? 240 : 0 }}
      >
        <div className="flex w-60 shrink-0 flex-col overflow-hidden">
        <div className="shrink-0 p-3 pb-0">
          <div className="mb-4 flex items-center gap-2 px-2 pt-2">
            <CircleDashed size={18} weight="light" className="text-cyan" />
            <div>
              <div className="text-sm font-semibold tracking-tight">Dev Tools</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">local · offline</div>
            </div>
          </div>
          <CommandPalette items={paletteItems} onSelect={openTool} favourites={favourites} recents={recents} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {favourites.length > 0 && (
            <nav className="flex flex-col gap-1 pb-2">
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-warm">Favourites</div>
              {favourites
                .map((id) => TOOL_DEFS[id])
                .filter(Boolean)
                .map((t) => (
                  <NavRow key={t.id} tool={t} active={activeTab === t.id} isFavourite onOpen={openTool} onToggleFavourite={toggleFavourite} />
                ))}
            </nav>
          )}

          {GROUPS.map((group) => (
            <nav key={group.label} className="flex flex-col gap-1 pb-2">
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {group.label}
              </div>
              {group.tools.map((t) => (
                <NavRow
                  key={t.id}
                  tool={t}
                  active={activeTab === t.id}
                  isFavourite={favourites.includes(t.id)}
                  onOpen={openTool}
                  onToggleFavourite={toggleFavourite}
                />
              ))}
            </nav>
          ))}
        </div>

        <div className="shrink-0 border-t border-rule-soft p-3">
          <SettingsPopover />
        </div>
        </div>
      </aside>

      <main className="relative z-10 flex flex-1 flex-col overflow-hidden p-5">
        <div className="mb-3 flex shrink-0 items-center gap-1">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={`${sidebarOpen ? 'Hide' : 'Show'} sidebar (Alt+B)`}
            className="shrink-0 rounded-xl p-1.5 text-ink-faint transition-colors hover:bg-glass hover:text-ink"
          >
            <SidebarSimple size={16} weight="light" />
          </button>
          {openTabs.length > 1 && (
            <>
            <div className="flex flex-1 items-center gap-1 overflow-x-auto">
              {openTabs.map((id) => {
                const t = TOOL_DEFS[id]
                const Icon = t.icon
                const active = id === activeTab
                const isFav = favourites.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    title="Alt+] / Alt+[ to cycle tabs, Alt+W to close"
                    className={`group flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition-colors ${
                      active ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:bg-glass hover:text-ink-soft'
                    }`}
                  >
                    <Icon size={13} weight="light" className={active ? 'text-cyan' : ''} />
                    {t.label}
                    <Star
                      size={11}
                      weight={isFav ? 'fill' : 'light'}
                      className={`transition-opacity ${isFav ? 'text-warm' : 'opacity-0 hover:text-warm group-hover:opacity-100'}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavourite(id)
                      }}
                    />
                    <X
                      size={11}
                      weight="bold"
                      className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(id)
                      }}
                    />
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setOpenTabs([activeTab])}
              className="shrink-0 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[11px] text-ink-faint transition-colors hover:bg-glass hover:text-ink-soft"
              title="Close all other tabs"
            >
              Close others
            </button>
            </>
          )}
        </div>

        <div className="relative flex-1 overflow-hidden">
          {openTabs.map((id) => (
            <div key={id} className="absolute inset-0" style={{ display: id === activeTab ? 'block' : 'none' }}>
              {renderPage(id)}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function NavRow({
  tool,
  active,
  isFavourite,
  onOpen,
  onToggleFavourite,
}: {
  tool: ToolDef
  active: boolean
  isFavourite: boolean
  onOpen: (id: Tool) => void
  onToggleFavourite: (id: Tool) => void
}) {
  const Icon = tool.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      whileHover={{ x: active ? 0 : 2 }}
      className="group relative rounded-2xl"
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="absolute inset-0 rounded-2xl bg-glass-strong ring-1 ring-glass-strong"
        />
      )}
      <button onClick={() => onOpen(tool.id)} className="relative flex w-full items-center gap-2.5 px-3 py-2.5 text-left">
        <Icon size={16} weight="light" className={active ? 'text-cyan' : 'text-ink-faint'} />
        <div className="flex-1">
          <div className={`text-[13px] font-medium ${active ? 'text-ink' : 'text-ink-soft'}`}>{tool.label}</div>
          <div className="text-[10.5px] text-ink-faint">{tool.hint}</div>
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavourite(tool.id)
        }}
        className={`absolute right-2 top-1/2 -translate-y-1/2 transition-opacity ${
          isFavourite ? 'text-warm' : 'text-ink-faint opacity-0 hover:text-warm group-hover:opacity-100'
        }`}
        title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      >
        <Star size={13} weight={isFavourite ? 'fill' : 'light'} />
      </button>
    </motion.div>
  )
}

export default App
