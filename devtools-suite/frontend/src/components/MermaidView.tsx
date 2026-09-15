import { useEffect, useState } from 'react'
import { renderMermaid } from '../lib/mermaidRender'
import { getCurrentScheme } from '../lib/themes'
import { ErrorBanner } from './ui'

export function MermaidView({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!code.trim()) {
      setSvg(null)
      setError(null)
      return
    }
    const t = setTimeout(() => {
      renderMermaid(code, getCurrentScheme())
        .then((s) => {
          if (!cancelled) {
            setSvg(s)
            setError(null)
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : 'Could not render this diagram')
            setSvg(null)
          }
        })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [code])

  if (error) return <ErrorBanner message={error} />
  if (!svg) return <div className="text-sm text-ink-faint">Write some Mermaid syntax to see it rendered.</div>

  return <div className="mermaid-svg-host flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svg }} />
}
