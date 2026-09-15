import { useMemo, useState } from 'react'
import { diffLines } from '../lib/diff'
import { Panel, SectionLabel, CopyButton } from '../components/ui'

export function DiffPage() {
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')

  const ops = useMemo(() => diffLines(before, after), [before, after])
  const added = ops.filter((o) => o.type === 'add').length
  const removed = ops.filter((o) => o.type === 'remove').length

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Before</SectionLabel>
            <textarea
              value={before}
              onChange={(e) => setBefore(e.target.value)}
              spellCheck={false}
              placeholder="Paste the original text…"
              className="flex-1 resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-cyan/50"
            />
          </div>
        </Panel>
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>After</SectionLabel>
            <textarea
              value={after}
              onChange={(e) => setAfter(e.target.value)}
              spellCheck={false}
              placeholder="Paste the changed text…"
              className="flex-1 resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-cyan/50"
            />
          </div>
        </Panel>
      </div>

      <Panel className="flex max-h-[45%] shrink-0 flex-col">
        <div className="flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs text-ink-soft">
              <span className="text-emerald">+{added}</span> <span className="text-rose">-{removed}</span>
            </div>
            <CopyButton text={ops.map((o) => (o.type === 'add' ? '+ ' : o.type === 'remove' ? '- ' : '  ') + o.line).join('\n')} />
          </div>
          <div className="max-h-72 overflow-auto rounded-2xl border border-rule bg-panel font-mono text-[12.5px]">
            {before === '' && after === '' ? (
              <div className="p-3 text-ink-faint">Paste text in both panes to see the diff.</div>
            ) : (
              ops.map((op, i) => (
                <div
                  key={i}
                  className={`whitespace-pre-wrap break-all px-3 py-0.5 ${
                    op.type === 'add' ? 'bg-emerald/[0.08] text-emerald' : op.type === 'remove' ? 'bg-rose/[0.08] text-rose' : 'text-ink-soft'
                  }`}
                >
                  {op.type === 'add' ? '+ ' : op.type === 'remove' ? '- ' : '  '}
                  {op.line}
                </div>
              ))
            )}
          </div>
        </div>
      </Panel>
    </div>
  )
}
