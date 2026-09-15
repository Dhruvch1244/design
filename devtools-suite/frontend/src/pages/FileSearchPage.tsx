import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UploadSimple, Copy, FileText, HardDrives } from '@phosphor-icons/react'
import { searchFile, searchPath, type FileSearchResult } from '../api'
import { Button, CopyButton, ErrorBanner, Panel, SectionLabel, Toggle } from '../components/ui'
import { HistoryPanel } from '../components/HistoryPanel'
import { ResizablePanel } from '../components/ResizablePanel'

const DEFAULT_MAX_MB = 200
const DEFAULT_MAX_PATH_GB = 40

type SourceMode = 'upload' | 'path'

export function FileSearchPage() {
  const [mode, setMode] = useState<SourceMode>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [path, setPath] = useState('')
  const [terms, setTerms] = useState('')
  const [regex, setRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [maxSizeMb, setMaxSizeMb] = useState(DEFAULT_MAX_MB)
  const [maxSizeGb, setMaxSizeGb] = useState(DEFAULT_MAX_PATH_GB)
  const [result, setResult] = useState<FileSearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const termCount = terms.split('\n').map((t) => t.trim()).filter(Boolean).length
  const canSearch = (mode === 'upload' ? !!file : !!path.trim()) && !!terms.trim()

  async function runSearch() {
    if (!canSearch) return
    setLoading(true)
    setError(null)
    try {
      const res =
        mode === 'upload'
          ? await searchFile({
              file: file as File,
              terms,
              regex,
              caseSensitive,
              maxSizeBytes: maxSizeMb * 1024 * 1024,
            })
          : await searchPath({
              path,
              terms,
              regex,
              caseSensitive,
              maxSizeBytes: maxSizeGb * 1024 * 1024 * 1024,
            })
      setResult(res)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const allMatchedText = result
    ? result.termResults.flatMap((tr) => tr.matches.map((m) => m.line)).join('\n')
    : ''

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="file-search" className="flex flex-col gap-4">
        <Panel>
          <div className="p-4">
            <SectionLabel>File</SectionLabel>
            <div className="mb-3 flex gap-1 rounded-xl border border-rule bg-void/70 p-1">
              <button
                onClick={() => setMode('upload')}
                className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
                  mode === 'upload' ? 'bg-white/[0.08] text-ink' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setMode('path')}
                className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
                  mode === 'path' ? 'bg-white/[0.08] text-ink' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                Local path
              </button>
            </div>

            {mode === 'upload' ? (
              <>
                <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule px-3 py-2.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink">
                  <UploadSimple size={14} weight="light" />
                  <span className="truncate">{file ? file.name : 'Choose a file…'}</span>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                {file && (
                  <div className="mb-3 flex items-center gap-1.5 text-[11px] text-ink-faint">
                    <FileText size={12} weight="light" />
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-rule bg-void/70 px-3 py-2.5">
                  <HardDrives size={14} weight="light" className="shrink-0 text-ink-faint" />
                  <input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="C:\logs\app.log"
                    spellCheck={false}
                    className="w-full bg-transparent font-mono text-xs text-ink outline-none placeholder:text-ink-faint"
                  />
                </div>
                <div className="mb-3 text-[11px] text-ink-faint">
                  Read directly off disk by the backend — no upload, so this scales to tens of GB.
                </div>
              </>
            )}

            <div className="mb-1.5 flex items-center justify-between">
              <SectionLabel>Search terms (one per line)</SectionLabel>
              {termCount > 0 && <span className="text-[10px] text-ink-faint">{termCount}</span>}
            </div>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder={'apple\nbanana\ncherry'}
              rows={6}
              spellCheck={false}
              className="mb-3 w-full resize-none rounded-xl border border-rule bg-void/70 p-2.5 font-mono text-sm text-ink outline-none transition-shadow focus:border-cyan/50 focus:shadow-[0_0_0_3px_rgba(47,230,242,0.12)]"
            />

            <div className="mb-4 flex flex-col gap-2">
              <Toggle checked={regex} onChange={setRegex} label="Regex" />
              <Toggle checked={caseSensitive} onChange={setCaseSensitive} label="Case sensitive" />
            </div>

            {mode === 'upload' ? (
              <>
                <SectionLabel>Max file size (MB)</SectionLabel>
                <input
                  type="number"
                  min={1}
                  value={maxSizeMb}
                  onChange={(e) => setMaxSizeMb(Number(e.target.value) || DEFAULT_MAX_MB)}
                  className="mb-4 w-full rounded-xl border border-rule bg-void/70 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-cyan/50"
                />
              </>
            ) : (
              <>
                <SectionLabel>Max file size (GB)</SectionLabel>
                <input
                  type="number"
                  min={1}
                  value={maxSizeGb}
                  onChange={(e) => setMaxSizeGb(Number(e.target.value) || DEFAULT_MAX_PATH_GB)}
                  className="mb-4 w-full rounded-xl border border-rule bg-void/70 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-cyan/50"
                />
              </>
            )}

            <Button variant="primary" className="w-full" onClick={runSearch} disabled={!canSearch || loading}>
              {loading ? 'Searching…' : termCount > 1 ? `Search ${termCount} terms` : 'Search'}
            </Button>
          </div>
        </Panel>

        <Panel>
          <div className="p-4">
            <HistoryPanel tool="file-search" refreshKey={refreshKey} onReuse={(input) => setTerms(input)} />
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col p-4">
          <AnimatePresence mode="wait">
            {error && <ErrorBanner message={error} key="error" />}
          </AnimatePresence>

          {!error && !result && (
            <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
              Pick a file, enter one or more terms (one per line), and search — matches show up grouped by term here.
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col gap-4 overflow-auto"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{result.totalMatches}</span> matches ·{' '}
                  {result.totalLines} lines scanned in <span className="text-ink">{result.fileName}</span>
                </div>
                <CopyButton text={allMatchedText} label="Copy all" />
              </div>

              {result.termResults.map((tr) => (
                <div key={tr.term} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-xs text-cyan">{tr.term}</span>
                      <span className="text-xs text-ink-faint">
                        {tr.matchCount} match{tr.matchCount === 1 ? '' : 'es'}
                        {tr.truncated && ' (truncated)'}
                      </span>
                    </div>
                    {tr.matches.length > 0 && (
                      <CopyButton text={tr.matches.map((m) => m.line).join('\n')} label="Copy" />
                    )}
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-rule bg-void/70 font-mono text-[13px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                    {tr.matches.length === 0 ? (
                      <div className="p-3 text-ink-faint">No matches.</div>
                    ) : (
                      tr.matches.map((m, i) => (
                        <div
                          key={i}
                          className="group flex items-start gap-3 border-b border-rule-soft px-4 py-1.5 last:border-b-0 hover:bg-white/[0.03]"
                        >
                          <span className="w-12 shrink-0 select-none text-right text-ink-faint">{m.lineNumber}</span>
                          <span className="flex-1 whitespace-pre-wrap break-all text-ink">{m.line}</span>
                          <button
                            className="flex shrink-0 items-center gap-1 text-ink-faint opacity-0 transition-opacity hover:text-cyan group-hover:opacity-100"
                            onClick={() => navigator.clipboard.writeText(m.line)}
                            title="Copy this line"
                          >
                            <Copy size={12} weight="light" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </Panel>
    </div>
  )
}
