import { useMemo, useState } from 'react'
import { jsonToTypeScript } from '../lib/jsonToTs'
import { Panel, SectionLabel, ErrorBanner, CopyButton } from '../components/ui'

const SAMPLE = `{
  "id": 1,
  "name": "Ada Lovelace",
  "active": true,
  "tags": ["math", "computing"],
  "address": { "street": "5th Ave", "zip": "10001" },
  "orders": [{ "id": 1, "total": 9.99 }]
}`

export function JsonToTsPage() {
  const [text, setText] = useState(SAMPLE)
  const [rootName, setRootName] = useState('Root')

  const { output, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(text)
      return { output: jsonToTypeScript(parsed, rootName), error: null as string | null }
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' }
    }
  }, [text, rootName])

  return (
    <div className="grid h-full grid-cols-2 gap-4">
      <Panel className="flex flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <SectionLabel>Sample JSON</SectionLabel>
            <input
              className="devtools-input w-32"
              value={rootName}
              onChange={(e) => setRootName(e.target.value || 'Root')}
              placeholder="Root name"
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] text-ink outline-none focus:border-cyan/50"
          />
        </div>
      </Panel>

      <Panel className="flex flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <SectionLabel>TypeScript interfaces</SectionLabel>
            <CopyButton text={output} />
          </div>
          {error ? (
            <ErrorBanner message={error} />
          ) : (
            <pre className="flex-1 overflow-auto rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] leading-relaxed text-ink">
              {output}
            </pre>
          )}
        </div>
      </Panel>
    </div>
  )
}
