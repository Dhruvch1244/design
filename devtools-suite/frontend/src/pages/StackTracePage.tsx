import { useMemo, useState } from 'react'
import { isFrameworkNoise, parseStackTrace } from '../lib/stackTrace'
import { Panel, SectionLabel, Toggle, CopyButton } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

export function StackTracePage() {
  const [text, setText] = useState('')
  const [appPrefix, setAppPrefix] = useState('com.dhruv')
  const [collapseFramework, setCollapseFramework] = useState(true)

  const blocks = useMemo(
    () => parseStackTrace(text, appPrefix.split(',').map((s) => s.trim()).filter(Boolean)),
    [text, appPrefix]
  )

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="stack-trace" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-2 p-4">
            <SectionLabel>Paste stack trace</SectionLabel>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              rows={14}
              placeholder={'java.lang.NullPointerException: ...\n\tat com.dhruv.app.Service.doThing(Service.java:42)\n\t...'}
              className="resize-none rounded-2xl border border-rule bg-void/70 p-3 font-mono text-[12px] leading-relaxed text-ink outline-none focus:border-cyan/50"
            />
          </div>
        </Panel>
        <Panel>
          <div className="flex flex-col gap-2 p-4">
            <SectionLabel>Your package prefix(es)</SectionLabel>
            <input className="devtools-input font-mono" value={appPrefix} onChange={(e) => setAppPrefix(e.target.value)} placeholder="com.yourcompany" />
            <Toggle checked={collapseFramework} onChange={setCollapseFramework} label="Collapse framework frames" />
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {blocks.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">Paste a stack trace to see it broken down.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {blocks.map((block, bi) => {
                const shown = block.frames.filter((f) => !collapseFramework || f.isAppCode || !isFrameworkNoise(f.className))
                const hiddenCount = block.frames.length - shown.length
                return (
                  <div key={bi} className="rounded-2xl border border-rule bg-void/70">
                    <div className="flex items-center justify-between border-b border-rule-soft px-3.5 py-2.5">
                      <div className={`font-mono text-[13px] ${block.causedByIndex != null ? 'text-warm' : 'text-rose'}`}>{block.header}</div>
                      <CopyButton text={block.header + '\n' + block.frames.map((f) => f.raw).join('\n')} />
                    </div>
                    {shown.length > 0 && (
                      <div className="flex flex-col">
                        {shown.map((f, fi) => (
                          <div
                            key={fi}
                            className={`whitespace-pre-wrap break-all px-3.5 py-1 font-mono text-[12px] ${
                              f.isAppCode ? 'bg-cyan/[0.06] text-cyan' : 'text-ink-faint'
                            }`}
                          >
                            {f.raw}
                          </div>
                        ))}
                        {hiddenCount > 0 && (
                          <div className="px-3.5 py-1.5 text-[11px] italic text-ink-faint">
                            … {hiddenCount} framework frame{hiddenCount === 1 ? '' : 's'} hidden
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
