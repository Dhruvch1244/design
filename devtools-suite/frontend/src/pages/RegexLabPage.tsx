import { useMemo, useState } from 'react'
import { Panel, SectionLabel, ErrorBanner, Toggle } from '../components/ui'

export function RegexLabPage() {
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

  return (
    <div className="flex h-full flex-col gap-4">
      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Pattern</SectionLabel>
          <div className="flex items-center gap-2">
            <span className="font-mono text-ink-faint">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              className="devtools-input flex-1"
            />
            <span className="font-mono text-ink-faint">/{flagString}</span>
          </div>
          <div className="flex gap-4">
            {(['g', 'i', 'm', 's'] as const).map((f) => (
              <Toggle key={f} checked={flags[f]} onChange={(v) => setFlags({ ...flags, [f]: v })} label={f} />
            ))}
          </div>
          {error && <ErrorBanner message={error} />}
        </div>
      </Panel>

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
    </div>
  )
}
