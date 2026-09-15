import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { convertList, type ListConvertResult } from '../api'
import { Button, CopyButton, ErrorBanner, Panel, SectionLabel, TextArea } from '../components/ui'
import { HistoryPanel } from '../components/HistoryPanel'

export function ListConverterPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ListConvertResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  async function run() {
    setError(null)
    try {
      setResult(await convertList(input))
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    }
  }

  return (
    <div className="flex h-full gap-4">
      <div className="flex w-96 shrink-0 flex-col gap-4">
        <Panel>
          <div className="p-4">
            <p className="mb-3 text-xs leading-relaxed text-ink-soft">
              Paste one item per line. Get back a quoted tuple and a plain tuple.
            </p>
            <Button variant="primary" className="w-full" onClick={run} disabled={!input}>
              Convert
            </Button>
          </div>
        </Panel>
        <Panel>
          <div className="p-4">
            <HistoryPanel tool="list-convert" refreshKey={refreshKey} onReuse={setInput} />
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-1 flex-col">
        <div className="flex h-full flex-col gap-4 p-4">
          <div>
            <SectionLabel>Input (one per line)</SectionLabel>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'a\nb\nc'}
              className="!flex-none h-36"
            />
          </div>

          <AnimatePresence mode="wait">{error && <ErrorBanner message={error} key="err" />}</AnimatePresence>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <SectionLabel>Quoted — ('a','b','c')</SectionLabel>
                    <CopyButton text={result.quoted} />
                  </div>
                  <pre className="whitespace-pre-wrap rounded-2xl border border-rule bg-void/70 p-4 font-mono text-[13px] text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                    {result.quoted}
                  </pre>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <SectionLabel>Plain — (a,b,c)</SectionLabel>
                    <CopyButton text={result.unquoted} />
                  </div>
                  <pre className="whitespace-pre-wrap rounded-2xl border border-rule bg-void/70 p-4 font-mono text-[13px] text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                    {result.unquoted}
                  </pre>
                </div>
                <div className="text-xs text-ink-faint">{result.itemCount} items</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Panel>
    </div>
  )
}
