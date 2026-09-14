import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BracketsCurly,
  ChartBar,
  ChartLineUp,
  ChartPieSlice,
  Cloud,
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
  Clock,
  MagicWand,
  NotePencil,
  Gauge,
  GitMerge,
  LinkSimple,
  SealCheck,
  ShieldCheck,
  Stack,
  Table,
  Terminal,
  TextAa,
  Warning,
  Waveform,
  Wrench,
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
import { SparkPlanPage } from './pages/SparkPlanPage'
import { AvroSchemaPage } from './pages/AvroSchemaPage'
import { HiveDdlDiffPage } from './pages/HiveDdlDiffPage'
import { ArnToolPage } from './pages/ArnToolPage'
import { IamPolicyPage } from './pages/IamPolicyPage'
import { CertInspectPage } from './pages/CertInspectPage'
import { CsvProfilerPage } from './pages/CsvProfilerPage'
import { PartMergePage } from './pages/PartMergePage'
import { YarnInspectorPage } from './pages/YarnInspectorPage'
import { SettingsPopover } from './components/SettingsPopover'
import { CommandPalette, type PaletteItem } from './components/CommandPalette'
import { applyTheme, getStoredTheme } from './lib/themes'
import { applyFont, getStoredFont } from './lib/fonts'

type Tool =
  | 'file-search'
  | 'json-xml'
  | 'sql'
  | 'list-convert'
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
  | 'spark-plan'
  | 'avro-schema'
  | 'hive-ddl-diff'
  | 'arn-tool'
  | 'iam-policy'
  | 'cert-inspect'
  | 'csv-profiler'
  | 'part-merge'
  | 'yarn-inspector'

type ToolDef = { id: Tool; label: string; hint: string; icon: React.ElementType }

const GROUPS: { label: string; tools: ToolDef[] }[] = [
  {
    label: 'Data & Files',
    tools: [
      { id: 'file-search', label: 'File Search', hint: 'grep any file', icon: ListMagnifyingGlass },
      { id: 'json-xml', label: 'JSON / XML', hint: 'format & convert', icon: BracketsCurly },
      { id: 'sql', label: 'SQL Workspace', hint: 'connect · query · save', icon: Database },
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
    ],
  },
  {
    label: 'Big Data',
    tools: [
      { id: 'spark-plan', label: 'Spark Plan Explainer', hint: 'shuffles · broadcasts', icon: ChartLineUp },
      { id: 'avro-schema', label: 'Avro Schema Tool', hint: 'compat check · hive ddl', icon: Database },
      { id: 'hive-ddl-diff', label: 'Hive DDL Diff', hint: 'compare two CREATE TABLEs', icon: Table },
      { id: 'csv-profiler', label: 'Delimited File Profiler', hint: 'streams huge CSV/TSV', icon: ChartPieSlice },
      { id: 'part-merge', label: 'Part-File Merger', hint: 'merge part-* output', icon: GitMerge },
      { id: 'yarn-inspector', label: 'YARN Inspector', hint: 'offline or live RM', icon: Cloud },
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

function App() {
  const [tool, setTool] = useState<Tool>('file-search')

  useEffect(() => {
    applyTheme(getStoredTheme())
    applyFont(getStoredFont())
  }, [])

  const paletteItems: PaletteItem<Tool>[] = GROUPS.flatMap((group) =>
    group.tools.map((t) => ({ id: t.id, label: t.label, hint: t.hint, group: group.label, icon: t.icon }))
  )

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-void text-ink">
      <div className="bg-glow" />
      <div className="noise-overlay" />

      <aside className="relative z-10 flex w-60 shrink-0 flex-col border-r border-rule-soft bg-surface">
        <div className="shrink-0 p-3 pb-0">
          <div className="mb-4 flex items-center gap-2 px-2 pt-2">
            <CircleDashed size={18} weight="light" className="text-cyan" />
            <div>
              <div className="text-sm font-semibold tracking-tight">Dev Tools</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">local · offline</div>
            </div>
          </div>
          <CommandPalette items={paletteItems} onSelect={setTool} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {GROUPS.map((group, gi) => (
            <nav key={group.label} className="flex flex-col gap-1 pb-2">
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {group.label}
              </div>
              {group.tools.map((t, i) => {
                const active = tool === t.id
                const Icon = t.icon
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (gi * 4 + i) * 0.03, type: 'spring', stiffness: 300, damping: 26 }}
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
          ))}
        </div>

        <div className="shrink-0 border-t border-rule-soft p-3">
          <SettingsPopover />
        </div>
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
            {tool === 'sql' && <SqlPage />}
            {tool === 'list-convert' && <ListConverterPage />}
            {tool === 'diff' && <DiffPage />}
            {tool === 'encode' && <EncodeDecodePage />}
            {tool === 'time' && <TimeToolkitPage />}
            {tool === 'regex' && <RegexLabPage />}
            {tool === 'text' && <TextToolkitPage />}
            {tool === 'data-gen' && <DataGeneratorPage />}
            {tool === 'scratchpad' && <ScratchpadPage />}
            {tool === 'stack-trace' && <StackTracePage />}
            {tool === 'dep-tree' && <DependencyTreePage />}
            {tool === 'spring-config' && <SpringConfigPage />}
            {tool === 'jar-inspect' && <JarInspectPage />}
            {tool === 'json-to-ts' && <JsonToTsPage />}
            {tool === 'marbles' && <MarblePage />}
            {tool === 'har' && <HarAnalyzerPage />}
            {tool === 'bundle-stats' && <BundleStatsPage />}
            {tool === 'cors-check' && <CorsCheckPage />}
            {tool === 'top-analyzer' && <TopAnalyzerPage />}
            {tool === 'linux-commands' && <LinuxCommandsPage />}
            {tool === 'makefile' && <MakefilePage />}
            {tool === 'spark-plan' && <SparkPlanPage />}
            {tool === 'avro-schema' && <AvroSchemaPage />}
            {tool === 'hive-ddl-diff' && <HiveDdlDiffPage />}
            {tool === 'arn-tool' && <ArnToolPage />}
            {tool === 'iam-policy' && <IamPolicyPage />}
            {tool === 'cert-inspect' && <CertInspectPage />}
            {tool === 'csv-profiler' && <CsvProfilerPage />}
            {tool === 'part-merge' && <PartMergePage />}
            {tool === 'yarn-inspector' && <YarnInspectorPage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
