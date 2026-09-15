import { useEffect, useMemo, useState } from 'react'
import { isFrameworkNoise, parseStackTrace } from '../lib/stackTrace'
import { Panel, SectionLabel, Toggle, CopyButton, Button } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

const DRAFT_KEY = 'devtools.stack-trace-draft'

const SAMPLE = `java.lang.NullPointerException: Cannot invoke "com.example.orders.Order.getTotal()" because "order" is null
\tat com.dhruv.orders.OrderService.calculateTotal(OrderService.java:42)
\tat com.dhruv.orders.OrderController.checkout(OrderController.java:28)
\tat org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:205)
\tat org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:150)
\tat java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
Caused by: java.lang.IllegalStateException: Order not found in session
\tat com.dhruv.orders.OrderRepository.findActive(OrderRepository.java:19)
\tat com.dhruv.orders.OrderService.calculateTotal(OrderService.java:39)
\t... 4 more
`

function loadDraft(): { text: string; appPrefix: string; collapseFramework: boolean } {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupt storage — start fresh */
  }
  return { text: '', appPrefix: 'com.dhruv', collapseFramework: true }
}

export function StackTracePage() {
  const initial = loadDraft()
  const [text, setText] = useState(initial.text)
  const [appPrefix, setAppPrefix] = useState(initial.appPrefix)
  const [collapseFramework, setCollapseFramework] = useState(initial.collapseFramework)

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify({ text, appPrefix, collapseFramework })), 400)
    return () => clearTimeout(t)
  }, [text, appPrefix, collapseFramework])

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
              className="resize-none rounded-2xl border border-rule bg-panel p-3 font-mono text-[12px] leading-relaxed text-ink outline-none focus:border-cyan/50"
            />
            <Button variant="ghost" onClick={() => setText(SAMPLE)}>Try a sample</Button>
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
                  <div key={bi} className="rounded-2xl border border-rule bg-panel">
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
