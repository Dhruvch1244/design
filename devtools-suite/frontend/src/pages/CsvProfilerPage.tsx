import { useEffect, useState } from 'react'
import { HardDrives, UploadSimple } from '@phosphor-icons/react'
import { profileCsvPath, profileCsvUpload, type CsvProfileResult } from '../lib/bigdataApi'
import { Panel, Button, Toggle, ErrorBanner } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

type Mode = 'upload' | 'path'

const SETTINGS_KEY = 'devtools.csv-profiler-settings'

const SAMPLE_CSV = `id,name,city,signup_date,plan\n1,Alice Chen,Toronto,2023-04-12,pro\n2,Bilal Rana,Karachi,2023-05-02,free\n3,Carla Diaz,Bogota,2023-05-30,pro\n4,,Toronto,2023-06-01,free\n5,Erin Walsh,Dublin,2023-07-19,enterprise\n`

function loadSettings(): { mode: Mode; path: string; delimiter: string; hasHeader: boolean } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupt storage — start fresh */
  }
  return { mode: 'upload', path: '', delimiter: ',', hasHeader: true }
}

export function CsvProfilerPage() {
  const initial = loadSettings()
  const [mode, setMode] = useState<Mode>(initial.mode)
  const [file, setFile] = useState<File | null>(null)
  const [path, setPath] = useState(initial.path)
  const [delimiter, setDelimiter] = useState(initial.delimiter)
  const [hasHeader, setHasHeader] = useState(initial.hasHeader)
  const [result, setResult] = useState<CsvProfileResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode, path, delimiter, hasHeader })), 400)
    return () => clearTimeout(t)
  }, [mode, path, delimiter, hasHeader])

  function loadSample() {
    setMode('upload')
    setFile(new File([SAMPLE_CSV], 'sample.csv', { type: 'text/csv' }))
  }

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
      <ResizablePanel storageKey="csv-profiler" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex gap-1 rounded-xl border border-rule bg-panel p-1">
              <button onClick={() => setMode('upload')} className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium ${mode === 'upload' ? 'bg-glass-strong text-ink' : 'text-ink-faint'}`}>Upload</button>
              <button onClick={() => setMode('path')} className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium ${mode === 'path' ? 'bg-glass-strong text-ink' : 'text-ink-faint'}`}>Local path</button>
            </div>

            {mode === 'upload' ? (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule px-3 py-2.5 text-xs text-ink-soft hover:border-cyan/40 hover:text-ink">
                <UploadSimple size={14} weight="light" />
                <span className="truncate">{file ? file.name : 'Choose a CSV/TSV…'}</span>
                <input type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-rule bg-panel px-3 py-2.5">
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
            <Button variant="ghost" onClick={loadSample}>Try a sample CSV</Button>
          </div>
        </Panel>
      </ResizablePanel>

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
                  <div key={c.name} className="rounded-xl border border-rule bg-panel p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-sm text-cyan">{c.name}</span>
                      <span className="rounded bg-glass-strong px-1.5 py-0.5 text-[10px] uppercase text-ink-faint">{c.inferredType}</span>
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
