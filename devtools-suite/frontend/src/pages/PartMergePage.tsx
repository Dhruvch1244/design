import { useState } from 'react'
import { Panel, SectionLabel, Button, Toggle, ErrorBanner } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

type MergeResult = { outputPath: string; filesMerged: number; totalBytesWritten: number; mergedFileNames: string[] }

export function PartMergePage() {
  const [directory, setDirectory] = useState('')
  const [globPattern, setGlobPattern] = useState('part-*')
  const [outputPath, setOutputPath] = useState('')
  const [skipHeader, setSkipHeader] = useState(true)
  const [decompressGzip, setDecompressGzip] = useState(true)
  const [result, setResult] = useState<MergeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/bigdata/merge-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directory, globPattern, outputPath, skipHeaderAfterFirst: skipHeader, decompressGzip }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({ error: res.statusText }))).error)
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Merge failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="part-merge"><Panel className="h-full">
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Merge Hadoop/Spark part-files into one</SectionLabel>
          <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
            Directory
            <input className="devtools-input font-mono" value={directory} onChange={(e) => setDirectory(e.target.value)} placeholder="C:\output\dataset" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
            File pattern
            <input className="devtools-input font-mono" value={globPattern} onChange={(e) => setGlobPattern(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
            Output file (must not already exist)
            <input className="devtools-input font-mono" value={outputPath} onChange={(e) => setOutputPath(e.target.value)} placeholder="C:\output\merged.csv" />
          </label>
          <Toggle checked={skipHeader} onChange={setSkipHeader} label="Skip repeated header line after the first file" />
          <Toggle checked={decompressGzip} onChange={setDecompressGzip} label="Decompress .gz inputs" />
          <Button variant="primary" onClick={run} disabled={!directory || !outputPath || loading}>
            {loading ? 'Merging…' : 'Merge'}
          </Button>
        </div>
      </Panel></ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {error && <ErrorBanner message={error} />}
          {!result && !error && (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">
              Pure sequential I/O — nothing is held in memory, so this scales to hundreds of GB the same way local-path File Search does.
            </div>
          )}
          {result && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-emerald/30 bg-emerald/[0.06] px-3.5 py-2.5 text-sm text-emerald">
                Merged {result.filesMerged} files ({(result.totalBytesWritten / 1024).toFixed(1)} KB) into{' '}
                <span className="font-mono">{result.outputPath}</span>
              </div>
              <div>
                <SectionLabel>Files merged, in order</SectionLabel>
                <div className="flex flex-col gap-0.5 font-mono text-[11.5px] text-ink-soft">
                  {result.mergedFileNames.map((n, i) => <div key={i}>{n}</div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
