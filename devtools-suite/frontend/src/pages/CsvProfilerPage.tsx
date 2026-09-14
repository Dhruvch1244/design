import { useState } from 'react'
import { HardDrives, UploadSimple } from '@phosphor-icons/react'
import { profileCsvPath, profileCsvUpload, type CsvProfileResult } from '../lib/bigdataApi'
import { Panel, SectionLabel, Button, Toggle, ErrorBanner } from '../components/ui'

type Mode = 'upload' | 'path'

export function CsvProfilerPage() {
  const [mode, setMode] = useState<Mode>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [path, setPath] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [hasHeader, setHasHeader] = useState(true)
  const [result, setResult] = useState<CsvProfileResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const res = mode === 'upload' && file ? await profileCsvUpload(file, delimiter, hasHeader) : await profileCsvPath(path, delimiter, hasHeader)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profile failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const canRun = mode === 'upload' ? !!file : !!path.trim()

  return (
    <div className="flex h-full gap-4">
      <div className="flex w-72 shrink-0 flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex gap-1 rounded-xl border border-rule bg-void/70 p-1">
              <button onClick={() => setMode('upload')} className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium ${mode === 'upload' ? 'bg-white/[0.08] text-ink' : 'text-ink-faint'}`}>Upload</button>
              <button onClick={() => setMode('path')} className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium ${mode === 'path' ? 'bg-white/[0.08] text-ink' : 'text-ink-faint'}`}>Local path</button>
            </div>

            {mode === 'upload' ? (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule px-3 py-2.5 text-xs text-ink-soft hover:border-cyan/40 hover:text-ink">
                <UploadSimple size={14} weight="light" />
                <span className="truncate">{file ? file.name : 'Choose a CSV/TSV…'}</span>
                <input type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-rule bg-void/70 px-3 py-2.5">
                <HardDrives size={14} weight="light" className="shrink-0 text-ink-faint" />
                <input value={path} onChange={(e) => setPath(e.target.value)} placeholder="C:\data\huge.csv" className="w-full bg-transparent font-mono text-xs text-ink outline-none" />
              </div>
            )}

            <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
              Delimiter
              <input className="devtools-input" value={delimiter} onChange={(e) => setDelimiter(e.target.value)} maxLength={1} />
            </label>
            <Toggle checked={hasHeader} onChange={setHasHeader} label="First row is a header" />

            <Button variant="primary" onClick={run} disabled={!canRun || loading}>
              {loading ? 'Profiling…' : 'Profile'}
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {error && <ErrorBanner message={error} />}
          {!result && !error && (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">
              Streams the file column-by-column — memory use stays flat regardless of file size.
            </div>
          )}
          {result && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-ink-soft">
                <span className="font-semibold text-ink">{result.totalRows}</span> rows profiled
                {result.malformedRowCount > 0 && <span className="text-warm"> · {result.malformedRowCount} malformed (wrong column count)</span>}
              </div>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {result.columns.map((c) => (
                  <div key={c.name} className="rounded-xl border border-rule bg-void/70 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-sm text-cyan">{c.name}</span>
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] uppercase text-ink-faint">{c.inferredType}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-[11px] text-ink-soft">
                      <div>{c.nonNullCount} non-null, {c.nullCount} null</div>
                      <div>{c.approxDistinctCount}{c.distinctCountTruncated ? '+' : ''} distinct values</div>
                      {c.minValue != null && <div>range: {c.minValue} – {c.maxValue}</div>}
                      <div className="truncate text-ink-faint" title={c.sampleValues.join(', ')}>e.g. {c.sampleValues.slice(0, 3).join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
