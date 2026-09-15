import { useState } from 'react'
import { UploadSimple, DownloadSimple, Image as ImageIcon } from '@phosphor-icons/react'
import { convertImage, enhanceImage, type ImageFormat } from '../lib/mediaApi'
import { Button, Panel, SectionLabel, ErrorBanner } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

type Tab = 'convert' | 'enhance'

export function ImageToolsPage() {
  const [tab, setTab] = useState<Tab>('convert')
  const [file, setFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultName, setResultName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [format, setFormat] = useState<ImageFormat>('png')
  const [brightness, setBrightness] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [sharpen, setSharpen] = useState(false)
  const [scale, setScale] = useState(1)

  function pickFile(f: File | null) {
    setFile(f)
    setResultUrl(null)
    setError(null)
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    setSourceUrl(f ? URL.createObjectURL(f) : null)
  }

  async function run() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const { blob, fileName } = tab === 'convert' ? await convertImage(file, format) : await enhanceImage(file, { brightness, contrast, sharpen, scale })
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultUrl(URL.createObjectURL(blob))
      setResultName(fileName)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="image-tools" className="flex flex-col gap-3">
        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <div className="mb-1 flex gap-1 rounded-xl border border-rule bg-void/70 p-1">
              {(['convert', 'enhance'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium capitalize transition-colors ${
                    tab === t ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <SectionLabel>Image</SectionLabel>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule px-3 py-2.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink">
              <UploadSimple size={14} weight="light" />
              <span className="truncate">{file ? file.name : 'Choose an image…'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>

            {tab === 'convert' ? (
              <>
                <SectionLabel>Target format</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {(['png', 'jpg', 'bmp', 'gif'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium uppercase transition-colors ${
                        format === f ? 'bg-glass-strong text-ink' : 'bg-glass text-ink-faint hover:text-ink-soft'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Slider label="Brightness" value={brightness} min={0.3} max={2} step={0.05} onChange={setBrightness} format={(v) => `${Math.round(v * 100)}%`} />
                <Slider label="Contrast" value={contrast} min={0.3} max={2} step={0.05} onChange={setContrast} format={(v) => `${Math.round(v * 100)}%`} />
                <Slider label="Scale" value={scale} min={0.25} max={4} step={0.25} onChange={setScale} format={(v) => `${v}×`} />
                <label className="flex items-center gap-2 text-xs text-ink-soft">
                  <input type="checkbox" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} className="accent-cyan" />
                  Sharpen
                </label>
              </>
            )}

            <Button variant="primary" onClick={run} disabled={!file || loading}>
              {loading ? 'Processing…' : tab === 'convert' ? 'Convert' : 'Enhance'}
            </Button>
          </div>
        </Panel>
      </ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {error && <ErrorBanner message={error} />}

          {!file && !error && (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={28} weight="light" />
                Pick an image on the left to get started.
              </div>
            </div>
          )}

          {file && (
            <div className="grid h-full grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <SectionLabel>Original</SectionLabel>
                <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-rule bg-void/70 p-2">
                  {sourceUrl && <img src={sourceUrl} alt="original" className="max-h-full max-w-full object-contain" />}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <SectionLabel>Result</SectionLabel>
                <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-rule bg-void/70 p-2">
                  {resultUrl ? (
                    <img src={resultUrl} alt="result" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-ink-faint">Run {tab} to see the output here.</span>
                  )}
                </div>
                {resultUrl && (
                  <Button variant="default" onClick={() => downloadResult(resultUrl, resultName)}>
                    <DownloadSimple size={14} weight="light" /> Download {resultName}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

function downloadResult(url: string, fileName: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format: (v: number) => string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px] text-ink-soft">
        <span>{label}</span>
        <span className="font-mono text-ink-faint">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan"
      />
    </div>
  )
}
