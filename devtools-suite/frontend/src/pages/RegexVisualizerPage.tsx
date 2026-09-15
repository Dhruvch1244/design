import { useMemo, useState } from 'react'
import { MagicWand } from '@phosphor-icons/react'
import { parseRegex } from '../lib/regexAst'
import { Panel, SectionLabel, ErrorBanner } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'
import { RegexDiagram } from '../components/RegexDiagram'

const EXAMPLES = [
  { label: 'Email', pattern: '[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}' },
  { label: 'IPv4', pattern: '(\\d{1,3}\\.){3}\\d{1,3}' },
  { label: 'Hex color', pattern: '#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})' },
  { label: 'US phone', pattern: '\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}' },
  { label: 'Semver', pattern: '\\d+\\.\\d+\\.\\d+(-[\\w.]+)?' },
]

export function RegexVisualizerPage() {
  const [pattern, setPattern] = useState(EXAMPLES[0].pattern)

  const { ast, error } = useMemo(() => {
    try {
      return { ast: parseRegex(pattern), error: null as string | null }
    } catch (e) {
      return { ast: null, error: e instanceof Error ? e.message : 'Could not parse pattern' }
    }
  }, [pattern])

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="regex-viz" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <SectionLabel>Pattern</SectionLabel>
            <div className="flex items-center gap-2">
              <span className="font-mono text-ink-faint">/</span>
              <input
                className="devtools-input flex-1 font-mono"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                spellCheck={false}
              />
              <span className="font-mono text-ink-faint">/</span>
            </div>
            {error && <ErrorBanner message={error} />}
          </div>
        </Panel>

        <Panel className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Examples</SectionLabel>
            <div className="flex flex-col gap-1">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setPattern(ex.pattern)}
                  className={`rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    pattern === ex.pattern ? 'bg-glass-strong text-ink' : 'text-ink-soft hover:bg-glass'
                  }`}
                >
                  <div>{ex.label}</div>
                  <div className="truncate font-mono text-[10px] text-ink-faint">{ex.pattern}</div>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        {error || !ast ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            <div className="flex flex-col items-center gap-2">
              <MagicWand size={28} weight="light" />
              Fix the pattern to see its diagram.
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <RegexDiagram node={ast} />
          </div>
        )}
      </Panel>
    </div>
  )
}
