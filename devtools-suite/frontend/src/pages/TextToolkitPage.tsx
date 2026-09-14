import { useMemo, useState } from 'react'
import { Panel, SectionLabel, Button, CopyButton } from '../components/ui'

function toCamel(s: string) {
  return s.replace(/[_\s-]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^(.)/, (c) => c.toLowerCase())
}
function toSnake(s: string) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase()
}
function toKebab(s: string) {
  return toSnake(s).replace(/_/g, '-')
}
function toTitle(s: string) {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
}

export function TextToolkitPage() {
  const [text, setText] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [columnIndex, setColumnIndex] = useState(0)
  const [wrapWidth, setWrapWidth] = useState(80)

  const lines = text.split('\n')
  const stats = useMemo(
    () => ({
      lines: lines.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      chars: text.length,
      charsNoSpace: text.replace(/\s/g, '').length,
    }),
    [text, lines.length]
  )

  function apply(fn: (s: string) => string) {
    setText(fn(text))
  }
  function applyLines(fn: (lines: string[]) => string[]) {
    setText(fn(text.split('\n')).join('\n'))
  }

  function extractColumn() {
    const rows = text.split('\n').map((line) => line.split(delimiter)[columnIndex] ?? '')
    setText(rows.join('\n'))
  }

  function wrap() {
    applyLines((ls) =>
      ls.flatMap((line) => {
        const words = line.split(' ')
        const out: string[] = []
        let cur = ''
        for (const w of words) {
          if ((cur + ' ' + w).trim().length > wrapWidth) {
            out.push(cur.trim())
            cur = w
          } else {
            cur = (cur + ' ' + w).trim()
          }
        }
        if (cur) out.push(cur)
        return out.length ? out : ['']
      })
    )
  }

  return (
    <div className="flex h-full gap-4">
      <div className="flex w-64 shrink-0 flex-col gap-3 overflow-auto">
        <Panel>
          <div className="flex flex-col gap-2 p-4">
            <SectionLabel>Case</SectionLabel>
            <Button variant="default" onClick={() => apply((s) => s.toUpperCase())}>UPPER</Button>
            <Button variant="default" onClick={() => apply((s) => s.toLowerCase())}>lower</Button>
            <Button variant="default" onClick={() => apply(toTitle)}>Title Case</Button>
            <Button variant="default" onClick={() => apply(toCamel)}>camelCase</Button>
            <Button variant="default" onClick={() => apply(toSnake)}>snake_case</Button>
            <Button variant="default" onClick={() => apply(toKebab)}>kebab-case</Button>
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-2 p-4">
            <SectionLabel>Lines</SectionLabel>
            <Button variant="default" onClick={() => applyLines((ls) => [...ls].sort())}>Sort A→Z</Button>
            <Button variant="default" onClick={() => applyLines((ls) => [...ls].sort().reverse())}>Sort Z→A</Button>
            <Button variant="default" onClick={() => applyLines((ls) => Array.from(new Set(ls)))}>Dedupe</Button>
            <Button variant="default" onClick={() => applyLines((ls) => ls.filter((l) => l.trim() !== ''))}>Remove blank lines</Button>
            <Button variant="default" onClick={() => applyLines((ls) => ls.map((l) => l.trim()))}>Trim each line</Button>
            <Button variant="default" onClick={() => applyLines((ls) => [...ls].reverse())}>Reverse order</Button>
            <Button variant="default" onClick={() => applyLines((ls) => ls.map((l, i) => `${i + 1}. ${l}`))}>Number lines</Button>
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-2 p-4">
            <SectionLabel>Column extract</SectionLabel>
            <div className="flex gap-2">
              <input className="devtools-input" value={delimiter} onChange={(e) => setDelimiter(e.target.value)} placeholder="delim" />
              <input
                type="number"
                className="devtools-input"
                value={columnIndex}
                onChange={(e) => setColumnIndex(Number(e.target.value) || 0)}
              />
            </div>
            <Button variant="default" onClick={extractColumn}>Extract column</Button>
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-2 p-4">
            <SectionLabel>Wrap</SectionLabel>
            <input type="number" className="devtools-input" value={wrapWidth} onChange={(e) => setWrapWidth(Number(e.target.value) || 80)} />
            <Button variant="default" onClick={wrap}>Wrap to width</Button>
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-1 p-4 text-xs text-ink-soft">
            <SectionLabel>Stats</SectionLabel>
            <div>{stats.lines} lines</div>
            <div>{stats.words} words</div>
            <div>{stats.chars} chars ({stats.charsNoSpace} no whitespace)</div>
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <SectionLabel>Text</SectionLabel>
            <CopyButton text={text} />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-cyan/50"
          />
        </div>
      </Panel>
    </div>
  )
}
