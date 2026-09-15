import { useState } from 'react'
import { octalToSymbolic, symbolicToOctal } from '../lib/chmod'
import { explainCommand, FLAG_REFERENCE } from '../lib/linuxCommands'
import { Panel, SectionLabel, ErrorBanner, CopyButton } from '../components/ui'

export function LinuxCommandsPage() {
  const [octal, setOctal] = useState('755')
  const [symbolic, setSymbolic] = useState('rwxr-xr-x')
  const [octalError, setOctalError] = useState<string | null>(null)
  const [symbolicError, setSymbolicError] = useState<string | null>(null)

  const [explainInput, setExplainInput] = useState('find . -mtime -7 -type f -name "*.log"')
  const explained = explainCommand(explainInput)

  function onOctalChange(v: string) {
    setOctal(v)
    try {
      setSymbolic(octalToSymbolic(v))
      setOctalError(null)
    } catch (e) {
      setOctalError(e instanceof Error ? e.message : 'Invalid')
    }
  }
  function onSymbolicChange(v: string) {
    setSymbolic(v)
    try {
      setOctal(symbolicToOctal(v))
      setSymbolicError(null)
    } catch (e) {
      setSymbolicError(e instanceof Error ? e.message : 'Invalid')
    }
  }

  return (
    <div className="grid h-full grid-cols-2 gap-4 overflow-auto">
      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>chmod octal ↔ symbolic</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
              Octal
              <input className="devtools-input font-mono" value={octal} onChange={(e) => onOctalChange(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
              Symbolic
              <input className="devtools-input font-mono" value={symbolic} onChange={(e) => onSymbolicChange(e.target.value)} />
            </label>
          </div>
          {octalError && <ErrorBanner message={octalError} />}
          {symbolicError && <ErrorBanner message={symbolicError} />}
          <div className="rounded-xl border border-rule-soft bg-glass p-3 font-mono text-sm text-ink">
            chmod {octal} file  ⇔  -rw{symbolic.slice(1)} file
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Explain a command</SectionLabel>
          <input className="devtools-input font-mono" value={explainInput} onChange={(e) => setExplainInput(e.target.value)} />
          {explained.length === 0 ? (
            <div className="text-xs text-ink-faint">Supported: {Object.keys(FLAG_REFERENCE).join(', ')}</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {explained.map((d) => (
                <div key={d.flag} className="rounded-lg border border-rule-soft bg-glass px-2.5 py-1.5 text-xs">
                  <span className="font-mono text-cyan">{d.flag}</span> — <span className="text-ink-soft">{d.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <Panel className="col-span-2">
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Flag reference</SectionLabel>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(FLAG_REFERENCE).map(([cmd, docs]) => (
              <div key={cmd}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-sm text-cyan">{cmd}</span>
                  <CopyButton text={docs.map((d) => d.flag).join(' ')} label="" />
                </div>
                <div className="flex flex-col gap-1 text-[11px]">
                  {docs.map((d) => (
                    <div key={d.flag}>
                      <span className="font-mono text-ink-soft">{d.flag}</span>
                      <div className="text-ink-faint">{d.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  )
}
