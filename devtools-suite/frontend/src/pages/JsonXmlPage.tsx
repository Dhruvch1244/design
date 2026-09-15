import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TreeStructure, TextAlignLeft } from '@phosphor-icons/react'
import {
  formatJson,
  formatXml,
  jsonToString,
  stringToJson,
  type JsonFormatResult,
  type XmlFormatResult,
} from '../api'
import { Button, CopyButton, ErrorBanner, Panel, SectionLabel, TextArea } from '../components/ui'
import { JsonTree } from '../components/JsonTree'
import { HistoryPanel } from '../components/HistoryPanel'
import { ResizablePanel } from '../components/ResizablePanel'

type Mode = 'json' | 'xml' | 'json-string'

const MODE_LABEL: Record<Mode, string> = {
  json: 'JSON formatter',
  xml: 'XML / SOAP formatter',
  'json-string': 'JSON ↔ string',
}

export function JsonXmlPage() {
  const [mode, setMode] = useState<Mode>('json')
  const [input, setInput] = useState('')
  const [jsonResult, setJsonResult] = useState<JsonFormatResult | null>(null)
  const [xmlResult, setXmlResult] = useState<XmlFormatResult | null>(null)
  const [stringResult, setStringResult] = useState<{ output: string | null; error: string | null } | null>(null)
  const [view, setView] = useState<'tree' | 'text'>('tree')
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const historyTool = mode === 'json' ? 'json-format' : mode === 'xml' ? 'xml-format' : 'json-to-string'

  async function run() {
    setError(null)
    try {
      if (mode === 'json') setJsonResult(await formatJson(input))
      else if (mode === 'xml') setXmlResult(await formatXml(input))
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    }
  }

  async function runToString() {
    setError(null)
    try {
      setStringResult(await jsonToString(input))
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    }
  }

  async function runFromString() {
    setError(null)
    try {
      setStringResult(await stringToJson(input))
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    }
  }

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="json-xml" className="flex flex-col gap-4">
        <Panel>
          <div className="p-4">
            <SectionLabel>Mode</SectionLabel>
            <div className="relative mb-4 flex flex-col gap-1">
              {(['json', 'xml', 'json-string'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="relative rounded-xl px-3 py-2 text-left text-sm"
                >
                  {mode === m && (
                    <motion.div
                      layoutId="mode-active"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-cyan"
                    />
                  )}
                  <span className={`relative ${mode === m ? 'font-medium text-void' : 'text-ink-soft'}`}>
                    {MODE_LABEL[m]}
                  </span>
                </button>
              ))}
            </div>

            {mode === 'json-string' ? (
              <div className="flex flex-col gap-2">
                <Button variant="primary" className="justify-center" onClick={runToString} disabled={!input}>
                  Text → JSON string
                </Button>
                <Button variant="default" className="justify-center" onClick={runFromString} disabled={!input}>
                  JSON string → text
                </Button>
              </div>
            ) : (
              <Button variant="primary" className="w-full" onClick={run} disabled={!input}>
                Format
              </Button>
            )}

            {mode === 'json' && (
              <div className="mt-3 flex gap-1 rounded-xl bg-white/[0.03] p-1">
                <button
                  onClick={() => setView('tree')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors ${view === 'tree' ? 'bg-white/[0.08] text-ink' : 'text-ink-faint'}`}
                >
                  <TreeStructure size={13} weight="light" /> Tree
                </button>
                <button
                  onClick={() => setView('text')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors ${view === 'text' ? 'bg-white/[0.08] text-ink' : 'text-ink-faint'}`}
                >
                  <TextAlignLeft size={13} weight="light" /> Text
                </button>
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <div className="p-4">
            <HistoryPanel tool={historyTool} refreshKey={refreshKey} onReuse={setInput} />
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col">
        <div className="flex h-full flex-col gap-3 p-4">
          <SectionLabel>Input</SectionLabel>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'xml' ? '<soap:Envelope>...</soap:Envelope>' : '{"hello":"world"}'}
            className="!flex-none h-36"
          />

          <AnimatePresence mode="wait">{error && <ErrorBanner message={error} key="err" />}</AnimatePresence>

          <div className="flex items-center justify-between">
            <SectionLabel>Output</SectionLabel>
            {mode === 'json' && jsonResult?.pretty && <CopyButton text={jsonResult.pretty} />}
            {mode === 'xml' && (xmlResult?.pretty ?? xmlResult?.fallbackFormatted) && (
              <CopyButton text={(xmlResult?.pretty ?? xmlResult?.fallbackFormatted)!} />
            )}
            {mode === 'json-string' && stringResult?.output && <CopyButton text={stringResult.output} />}
          </div>

          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {mode === 'json' && jsonResult && (
                <motion.div key="json" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {jsonResult.valid ? (
                    view === 'tree' ? (
                      <JsonTree data={jsonResult.data} />
                    ) : (
                      <pre className="whitespace-pre-wrap rounded-2xl border border-rule bg-panel p-4 font-mono text-[13px] text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                        {jsonResult.pretty}
                      </pre>
                    )
                  ) : (
                    <div className="flex flex-col gap-2">
                      <ErrorBanner message={`Invalid JSON: ${jsonResult.error}`} />
                      <pre className="whitespace-pre-wrap rounded-2xl border border-rule bg-panel p-4 font-mono text-[13px] text-ink-soft">
                        {jsonResult.fallbackFormatted}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}

              {mode === 'xml' && xmlResult && (
                <motion.div key="xml" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {xmlResult.valid ? (
                    <pre className="whitespace-pre-wrap rounded-2xl border border-rule bg-panel p-4 font-mono text-[13px] text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                      {xmlResult.pretty}
                    </pre>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <ErrorBanner message={`Invalid XML: ${xmlResult.error}`} />
                      <pre className="whitespace-pre-wrap rounded-2xl border border-rule bg-panel p-4 font-mono text-[13px] text-ink-soft">
                        {xmlResult.fallbackFormatted}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}

              {mode === 'json-string' && stringResult && (
                <motion.div key="str" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {stringResult.error ? (
                    <ErrorBanner message={stringResult.error} />
                  ) : (
                    <pre className="whitespace-pre-wrap rounded-2xl border border-rule bg-panel p-4 font-mono text-[13px] text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                      {stringResult.output}
                    </pre>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Panel>
    </div>
  )
}
