import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UploadSimple, MagnifyingGlass, Copy, FileText } from '@phosphor-icons/react'
import { searchFile, type FileSearchResult } from '../api'
import { Button, CopyButton, ErrorBanner, Panel, SectionLabel } from '../components/ui'
import { HistoryPanel } from '../components/HistoryPanel'

const DEFAULT_MAX_MB = 200

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs text-ink-soft">
      <span
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${checked ? 'bg-cyan' : 'bg-white/10'}`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="absolute top-0.5 h-3 w-3 rounded-full bg-void shadow"
          style={{ left: checked ? '14px' : '2px' }}
        />
      </span>
      {label}
    </label>
  )
}

export function FileSearchPage() {
  const [file, setFile] = useState<File | null>(null)
  const [term, setTerm] = useState('')
  const [regex, setRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [maxSizeMb, setMaxSizeMb] = useState(DEFAULT_MAX_MB)
  const [result, setResult] = useState<FileSearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  async function runSearch() {
    if (!file || !term) return
    setLoading(true)
    setError(null)
    try {
      const res = await searchFile({
        file,
        term,
        regex,
        caseSensitive,
        maxSizeBytes: maxSizeMb * 1024 * 1024,
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

  const allMatchedText = result ? result.matches.map((m) => m.line).join('\n') : ''

  return (
    <div className="flex h-full gap-4">
      <div className="flex w-72 shrink-0 flex-col gap-4">
        <Panel>
          <div className="p-4">
            <SectionLabel>File</SectionLabel>
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

            <SectionLabel>Search term</SectionLabel>
            <div className="relative mb-3">
              <MagnifyingGlass size={13} weight="light" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="word or regex…"
                className="w-full rounded-xl border border-rule bg-void/70 py-2 pl-8 pr-3 font-mono text-sm text-ink outline-none transition-shadow focus:border-cyan/50 focus:shadow-[0_0_0_3px_rgba(47,230,242,0.12)]"
              />
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <Toggle checked={regex} onChange={setRegex} label="Regex" />
              <Toggle checked={caseSensitive} onChange={setCaseSensitive} label="Case sensitive" />
            </div>

            <SectionLabel>Max file size (MB)</SectionLabel>
            <input
              type="number"
              min={1}
              value={maxSizeMb}
              onChange={(e) => setMaxSizeMb(Number(e.target.value) || DEFAULT_MAX_MB)}
              className="mb-4 w-full rounded-xl border border-rule bg-void/70 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-cyan/50"
            />

            <Button variant="primary" className="w-full" onClick={runSearch} disabled={!file || !term || loading}>
              {loading ? 'Searching…' : 'Search'}
            </Button>
          </div>
        </Panel>

        <Panel>
          <div className="p-4">
            <HistoryPanel tool="file-search" refreshKey={refreshKey} onReuse={(input) => setTerm(input)} />
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col p-4">
          <AnimatePresence mode="wait">
            {error && <ErrorBanner message={error} key="error" />}
          </AnimatePresence>

          {!error && !result && (
            <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
              Pick a file, enter a term, and search — matches show up here.
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{result.matchCount}</span> matches ·{' '}
                  {result.totalLines} lines scanned in <span className="text-ink">{result.fileName}</span>
                  {result.truncated && <span className="ml-2 text-warm">(truncated to first 20,000 matches)</span>}
                </div>
                <CopyButton text={allMatchedText} label="Copy all" />
              </div>
              <div className="flex-1 overflow-auto rounded-2xl border border-rule bg-void/70 font-mono text-[13px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                {result.matches.length === 0 && (
                  <div className="p-4 text-ink-faint">No matches.</div>
                )}
                {result.matches.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.01, 0.3) }}
                    className="group flex items-start gap-3 border-b border-rule-soft px-4 py-1.5 hover:bg-white/[0.03]"
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
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </Panel>
    </div>
  )
}
