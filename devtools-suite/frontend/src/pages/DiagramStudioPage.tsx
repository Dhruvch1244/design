import { useState } from 'react'
import { Code, FloppyDisk, Plus, Trash } from '@phosphor-icons/react'
import { Panel, SectionLabel, Button, CopyButton } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'
import { MermaidView } from '../components/MermaidView'
import { DiagramCanvasEditor } from '../components/DiagramCanvasEditor'
import { listSavedDiagrams, saveDiagram, deleteSavedDiagram, type DiagramData } from '../lib/diagramCanvas'

type Mode = 'code' | 'canvas'

const EXAMPLES: { label: string; code: string }[] = [
  {
    label: 'Flowchart',
    code: 'flowchart TD\n  A[Start] --> B{Is it working?}\n  B -->|Yes| C[Ship it]\n  B -->|No| D[Debug]\n  D --> B',
  },
  {
    label: 'Sequence',
    code: 'sequenceDiagram\n  participant Client\n  participant Server\n  Client->>Server: Request\n  Server-->>Client: Response',
  },
  {
    label: 'Class diagram',
    code: 'classDiagram\n  class Animal {\n    +String name\n    +makeSound()\n  }\n  Animal <|-- Dog\n  Animal <|-- Cat',
  },
  {
    label: 'State machine',
    code: 'stateDiagram-v2\n  [*] --> Idle\n  Idle --> Running: start\n  Running --> Idle: stop\n  Running --> [*]: done',
  },
  {
    label: 'ER diagram',
    code: 'erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains',
  },
  {
    label: 'Gantt',
    code: 'gantt\n  title Project\n  dateFormat YYYY-MM-DD\n  section Phase 1\n  Task A :a1, 2024-01-01, 7d\n  Task B :after a1, 5d',
  },
  {
    label: 'Pie chart',
    code: 'pie title Distribution\n  "A" : 40\n  "B" : 35\n  "C" : 25',
  },
]

const EMPTY_CANVAS: DiagramData = { shapes: [], connectors: [] }

export function DiagramStudioPage() {
  const [mode, setMode] = useState<Mode>('code')
  const [code, setCode] = useState(EXAMPLES[0].code)

  const [canvasData, setCanvasData] = useState<DiagramData>(EMPTY_CANVAS)
  const [savedCanvases, setSavedCanvases] = useState(() => listSavedDiagrams())
  const [activeCanvasName, setActiveCanvasName] = useState<string | null>(null)

  function saveCanvas() {
    const name = window.prompt('Save this diagram as…', activeCanvasName ?? 'Untitled diagram')
    if (!name) return
    saveDiagram(name, canvasData)
    setSavedCanvases(listSavedDiagrams())
    setActiveCanvasName(name)
  }

  function loadCanvas(name: string) {
    setCanvasData(savedCanvases[name])
    setActiveCanvasName(name)
  }

  function removeCanvas(name: string) {
    if (!window.confirm(`Delete diagram "${name}"? This can't be undone.`)) return
    deleteSavedDiagram(name)
    setSavedCanvases(listSavedDiagrams())
    if (activeCanvasName === name) setActiveCanvasName(null)
  }

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="diagram-studio" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex gap-1 rounded-xl border border-rule bg-panel p-1">
              {(['code', 'canvas'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium capitalize transition-colors ${
                    mode === m ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
                  }`}
                >
                  {m === 'code' ? 'Code (Mermaid)' : 'Canvas'}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        {mode === 'code' ? (
          <Panel className="flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col p-4">
              <SectionLabel>Examples</SectionLabel>
              <div className="flex flex-col gap-1">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => setCode(ex.code)}
                    className={`rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                      code === ex.code ? 'bg-glass-strong text-ink' : 'text-ink-soft hover:bg-glass'
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-ink-faint">
                Mermaid syntax — flowcharts, sequence/class/state/ER diagrams, gantt charts, pie charts. Renders as you type.
              </div>
            </div>
          </Panel>
        ) : (
          <Panel className="flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <SectionLabel>Saved diagrams</SectionLabel>
                <button onClick={() => { setCanvasData(EMPTY_CANVAS); setActiveCanvasName(null) }} className="text-ink-faint hover:text-cyan" title="New diagram">
                  <Plus size={13} weight="bold" />
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                {Object.keys(savedCanvases).length === 0 && <div className="p-2 text-xs text-ink-faint">Nothing saved yet.</div>}
                {Object.keys(savedCanvases).map((name) => (
                  <div
                    key={name}
                    className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${
                      activeCanvasName === name ? 'bg-glass-strong text-ink' : 'text-ink-soft hover:bg-glass'
                    }`}
                  >
                    <button onClick={() => loadCanvas(name)} className="flex-1 truncate text-left">{name}</button>
                    <button onClick={() => removeCanvas(name)} className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100">
                      <Trash size={11} weight="light" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="default" onClick={saveCanvas} className="mt-2">
                <FloppyDisk size={14} weight="light" /> Save current
              </Button>
            </div>
          </Panel>
        )}
      </ResizablePanel>

      {mode === 'code' ? (
        <>
          <ResizablePanel storageKey="diagram-studio-code" defaultWidth={416}><Panel className="flex h-full flex-col overflow-hidden">
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <SectionLabel>Diagram code</SectionLabel>
                <div className="flex items-center gap-1 text-ink-faint">
                  <Code size={12} weight="light" />
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[12.5px] leading-relaxed text-ink outline-none focus:border-cyan/50"
              />
              <CopyButton text={code} label="Copy code" />
            </div>
          </Panel></ResizablePanel>

          <Panel className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-6">
              <MermaidView code={code} />
            </div>
          </Panel>
        </>
      ) : (
        <Panel className="flex flex-1 flex-col overflow-hidden">
          <DiagramCanvasEditor data={canvasData} onChange={setCanvasData} />
        </Panel>
      )}
    </div>
  )
}
