export type ImageFormat = 'png' | 'jpg' | 'bmp' | 'gif'

async function downloadFetch(url: string, body: FormData): Promise<{ blob: Blob; fileName: string }> {
  const res = await fetch(url, { method: 'POST', body })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="?([^"]+)"?/)
  const fileName = match?.[1] ?? 'download'
  const blob = await res.blob()
  return { blob, fileName }
}

export function convertImage(file: File, format: ImageFormat) {
  const fd = new FormData()
  fd.set('file', file)
  fd.set('format', format)
  return downloadFetch('/api/media/image/convert', fd)
}

export type EnhanceOptions = { brightness: number; contrast: number; sharpen: boolean; scale: number }

export function enhanceImage(file: File, opts: EnhanceOptions) {
  const fd = new FormData()
  fd.set('file', file)
  fd.set('brightness', String(opts.brightness))
  fd.set('contrast', String(opts.contrast))
  fd.set('sharpen', String(opts.sharpen))
  fd.set('scale', String(opts.scale))
  return downloadFetch('/api/media/image/enhance', fd)
}

export function imagesToPdf(files: File[]) {
  const fd = new FormData()
  for (const f of files) fd.append('files', f)
  return downloadFetch('/api/media/pdf/from-images', fd)
}

export function pdfToImages(file: File, format: 'png' | 'jpg', dpi: number) {
  const fd = new FormData()
  fd.set('file', file)
  fd.set('format', format)
  fd.set('dpi', String(dpi))
  return downloadFetch('/api/media/pdf/to-images', fd)
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
