import { useState } from 'react'
import { UploadSimple } from '@phosphor-icons/react'
import { inspectJars, type JarInspectResponse } from '../lib/javaApi'
import { Panel, SectionLabel, Button, ErrorBanner } from '../components/ui'

export function JarInspectPage() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<JarInspectResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      setResult(await inspectJars(files))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Inspect failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full gap-4">
      <div className="flex w-96 shrink-0 flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <SectionLabel>JAR files</SectionLabel>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule px-3 py-2.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink">
              <UploadSimple size={14} weight="light" />
              <span className="truncate">{files.length ? `${files.length} file(s) selected` : 'Choose one or more .jar files…'}</span>
              <input
                type="file"
                multiple
                accept=".jar,.war"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="hidden"
              />
            </label>
            {files.length > 1 && (
              <div className="text-[11px] text-ink-faint">
                Multiple jars — duplicate classes across them will be flagged (the usual root cause of a runtime NoSuchMethodError).
              </div>
            )}
            <Button variant="primary" onClick={run} disabled={files.length === 0 || loading}>
              {loading ? 'Inspecting…' : 'Inspect'}
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {error && <ErrorBanner message={error} />}
          {!result && !error && (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">Pick one or more jars and hit Inspect.</div>
          )}
          {result && (
            <div className="flex flex-col gap-4">
              {result.duplicateClasses.length > 0 && (
                <div className="rounded-2xl border border-warm/30 bg-warm/[0.06] p-3.5">
                  <div className="mb-2 text-sm font-medium text-warm">{result.duplicateClasses.length} duplicate class(es) across jars</div>
                  <div className="flex flex-col gap-1 font-mono text-[12px] text-ink-soft">
                    {result.duplicateClasses.slice(0, 200).map((d) => (
                      <div key={d.className}>
                        {d.className} — <span className="text-ink-faint">{d.foundInJars.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.jars.map((jar) => (
                <div key={jar.fileName} className="rounded-2xl border border-rule bg-void/70 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-mono text-sm text-ink">{jar.fileName}</div>
                    <div className="text-xs text-ink-faint">{jar.entryCount} entries · {(jar.totalUncompressedSize / 1024).toFixed(1)} KB</div>
                  </div>

                  <div className="mb-2">
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-ink-faint">Class file versions</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(jar.classMajorVersions).map(([label, count]) => (
                        <span key={label} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-cyan">
                          {label} × {count}
                        </span>
                      ))}
                    </div>
                  </div>

                  {Object.keys(jar.manifestMainAttributes).length > 0 && (
                    <div>
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-ink-faint">Manifest</div>
                      <div className="flex flex-col gap-0.5 font-mono text-[11.5px] text-ink-soft">
                        {Object.entries(jar.manifestMainAttributes).map(([k, v]) => (
                          <div key={k}>
                            {k}: <span className="text-ink-faint">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
