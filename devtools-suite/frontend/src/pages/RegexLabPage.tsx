import { useMemo, useState } from 'react'
import { MagicWand } from '@phosphor-icons/react'
import { parseRegex } from '../lib/regexAst'
import { Panel, SectionLabel, ErrorBanner, Toggle } from '../components/ui'
import { RegexDiagram } from '../components/RegexDiagram'

type Mode = 'test' | 'diagram'

const EXAMPLES = [
  { label: 'Email', pattern: '[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}' },
  { label: 'IPv4', pattern: '(\\d{1,3}\\.){3}\\d{1,3}' },
  { label: 'Hex color', pattern: '#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})' },
  { label: 'US phone', pattern: '\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}' },
  { label: 'Semver', pattern: '\\d+\\.\\d+\\.\\d+(-[\\w.]+)?' },
]

export function RegexLabPage() {
  const [mode, setMode] = useState<Mode>('test')
  const [pattern, setPattern] = useState('(\\w+)@(\\w+)\\.com')
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false })
  const [text, setText] = useState('Contact: alice@example.com or bob@example.com')

  const flagString = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')

  const { matches, error, segments } = useMemo(() => {
    try {
      const re = new RegExp(pattern, flagString.includes('g') ? flagString : flagString + 'g')
      const found: RegExpExecArray[] = []
      let m: RegExpExecArray | null
      let guard = 0
      while ((m = re.exec(text)) !== null && guard++ < 10000) {
        found.push(m)
        if (m[0] === '') re.lastIndex++
      }

      const segs: { text: string; matched: boolean }[] = []
      let last = 0
      for (const m of found) {
        if (m.index > last) segs.push({ text: text.slice(last, m.index), matched: false })
        segs.push({ text: m[0], matched: true })
        last = m.index + m[0].length
      }
      if (last < text.length) segs.push({ text: text.slice(last), matched: false })

      return { matches: found, error: null as string | null, segments: segs }
    } catch (e) {
      return { matches: [], error: e instanceof Error ? e.message : 'Invalid regex', segments: [{ text, matched: false }] }
    }
  }, [pattern, flagString, text])

  const { ast, error: diagramError } = useMemo(() => {
    try {
      return { ast: parseRegex(pattern), error: null as string | null }
    } catch (e) {
      return { ast: null, error: e instanceof Error ? e.message : 'Could not parse pattern' }
    }
  }, [pattern])

  return (
    <div className="flex h-full flex-col gap-4">
      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Pattern</SectionLabel>
            <div className="flex gap-1 rounded-xl border border-rule bg-panel p-1">
              {(['test', 'diagram'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-lg px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                    mode === m ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-ink-faint">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              className="devtools-input flex-1 font-mono"
            />
            <span className="font-mono text-ink-faint">/{mode === 'test' ? flagString : ''}</span>
          </div>
          {mode === 'test' && (
            <div className="flex gap-4">
              {(['g', 'i', 'm', 's'] as const).map((f) => (
                <Toggle key={f} checked={flags[f]} onChange={(v) => setFlags({ ...flags, [f]: v })} label={f} />
              ))}
            </div>
          )}
          {mode === 'test' && error && <ErrorBanner message={error} />}
          {mode === 'diagram' && diagramError && <ErrorBanner message={diagramError} />}
        </div>
      </Panel>

      {mode === 'test' ? (
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
          <Panel className="flex flex-col overflow-hidden">
            <div className="flex flex-1 flex-col p-4">
              <SectionLabel>Test string</SectionLabel>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                className="flex-1 resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[13px] text-ink outline-none focus:border-cyan/50"
              />
            </div>
          </Panel>

          <div className="flex flex-col gap-4 overflow-hidden">
            <Panel className="flex flex-col overflow-hidden">
              <div className="p-4">
                <SectionLabel>Highlighted ({matches.length} match{matches.length === 1 ? '' : 'es'})</SectionLabel>
                <div className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-2xl border border-rule bg-panel p-3 font-mono text-[13px] text-ink">
                  {segments.map((s, i) => (
                    <span key={i} className={s.matched ? 'rounded bg-cyan/20 text-cyan' : ''}>
                      {s.text}
                    </span>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-auto p-4">
                <SectionLabel>Capture groups</SectionLabel>
                {matches.length === 0 ? (
                  <div className="text-xs text-ink-faint">No matches.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {matches.map((m, i) => (
                      <div key={i} className="rounded-xl border border-rule-soft bg-glass p-2.5 text-xs">
                        <div className="mb-1 font-mono text-cyan">{m[0]}</div>
                        {m.length > 1 && (
                          <div className="flex flex-col gap-0.5 text-ink-faint">
                            {Array.from(m).slice(1).map((g, gi) => (
                              <div key={gi}>
                                group {gi + 1}: <span className="font-mono text-ink-soft">{g ?? '(undefined)'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-[16rem_1fr] gap-4 overflow-hidden">
          <Panel className="flex flex-col overflow-hidden">
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

          <Panel className="flex flex-1 flex-col overflow-hidden">
            {diagramError || !ast ? (
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
      )}
    </div>
  )
}
