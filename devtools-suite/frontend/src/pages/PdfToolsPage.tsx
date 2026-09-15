import { useState } from 'react'
import { UploadSimple, DownloadSimple, FilePdf, X } from '@phosphor-icons/react'
import { imagesToPdf, pdfToImages, triggerDownload } from '../lib/mediaApi'
import { Button, Panel, SectionLabel, ErrorBanner } from '../components/ui'

type Tab = 'to-pdf' | 'from-pdf'

export function PdfToolsPage() {
  const [tab, setTab] = useState<Tab>('to-pdf')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultName, setResultName] = useState('')

  const [images, setImages] = useState<File[]>([])

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [outFormat, setOutFormat] = useState<'png' | 'jpg'>('png')
  const [dpi, setDpi] = useState(150)

  function clearResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setResultUrl(null)
  }

  async function runImagesToPdf() {
    if (images.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const { blob, fileName } = await imagesToPdf(images)
      clearResult()
      setResultUrl(URL.createObjectURL(blob))
      setResultName(fileName)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
    } finally {
      setLoading(false)
    }
  }

  async function runPdfToImages() {
    if (!pdfFile) return
    setLoading(true)
    setError(null)
    try {
      const { blob, fileName } = await pdfToImages(pdfFile, outFormat, dpi)
      clearResult()
      setResultUrl(URL.createObjectURL(blob))
      setResultName(fileName)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full gap-4">
      <div className="flex w-96 shrink-0 flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <div className="mb-1 flex gap-1 rounded-xl border border-rule bg-void/70 p-1">
              <button
                onClick={() => { setTab('to-pdf'); clearResult(); setError(null) }}
                className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${tab === 'to-pdf' ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'}`}
              >
                Images → PDF
              </button>
              <button
                onClick={() => { setTab('from-pdf'); clearResult(); setError(null) }}
                className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${tab === 'from-pdf' ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'}`}
              >
                PDF → Images
              </button>
            </div>

            {tab === 'to-pdf' ? (
              <>
                <SectionLabel>Images (one page each, in order)</SectionLabel>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule px-3 py-2.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink">
                  <UploadSimple size={14} weight="light" />
                  <span className="truncate">{images.length ? `${images.length} image(s) selected` : 'Choose images…'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files ?? []))}
                    className="hidden"
                  />
                </label>
                {images.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {images.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 rounded-lg bg-glass px-2 py-1 text-[11px] text-ink-soft">
                        <span className="flex-1 truncate">{i + 1}. {f.name}</span>
                        <button onClick={() => setImages((prev) => prev.filter((_, pi) => pi !== i))} className="text-ink-faint hover:text-rose">
                          <X size={11} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="primary" onClick={runImagesToPdf} disabled={images.length === 0 || loading}>
                  {loading ? 'Building…' : 'Build PDF'}
                </Button>
              </>
            ) : (
              <>
                <SectionLabel>PDF file</SectionLabel>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule px-3 py-2.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink">
                  <UploadSimple size={14} weight="light" />
                  <span className="truncate">{pdfFile ? pdfFile.name : 'Choose a PDF…'}</span>
                  <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} className="hidden" />
                </label>

                <SectionLabel>Output format</SectionLabel>
                <div className="flex gap-1.5">
                  {(['png', 'jpg'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setOutFormat(f)}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium uppercase transition-colors ${
                        outFormat === f ? 'bg-glass-strong text-ink' : 'bg-glass text-ink-faint hover:text-ink-soft'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px] text-ink-soft">
                    <span>DPI</span>
                    <span className="font-mono text-ink-faint">{dpi}</span>
                  </div>
                  <input type="range" min={72} max={300} step={12} value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="w-full accent-cyan" />
                </div>

                <Button variant="primary" onClick={runPdfToImages} disabled={!pdfFile || loading}>
                  {loading ? 'Rendering…' : 'Render pages'}
                </Button>
              </>
            )}
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-3 p-4">
          {error && (
            <div className="flex flex-1 items-center justify-center">
              <ErrorBanner message={error} />
            </div>
          )}
          {!error && !resultUrl && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-ink-faint">
              <FilePdf size={28} weight="light" />
              {tab === 'to-pdf' ? 'Pick images and build a PDF.' : 'Pick a PDF and render its pages to images.'}
            </div>
          )}
          {resultUrl && !error && (
            <>
              {tab === 'to-pdf' ? (
                <iframe src={resultUrl} title="PDF preview" className="w-full flex-1 rounded-2xl border border-rule bg-white" />
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-2xl border border-rule bg-void/70 text-sm text-ink-soft">
                  Pages rendered — download the zip below.
                </div>
              )}
              <Button
                variant="default"
                onClick={() => {
                  fetch(resultUrl)
                    .then((r) => r.blob())
                    .then((b) => triggerDownload(b, resultName))
                }}
                className="self-center"
              >
                <DownloadSimple size={14} weight="light" /> Download {resultName}
              </Button>
            </>
          )}
        </div>
      </Panel>
    </div>
  )
}
