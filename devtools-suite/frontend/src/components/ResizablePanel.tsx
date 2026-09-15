import { useRef, useState, type ReactNode } from 'react'

const WIDTHS_KEY = 'devtools.panel-widths'

function loadWidths(): Record<string, number> {
  try {
    const raw = localStorage.getItem(WIDTHS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persistWidth(key: string, width: number) {
  const all = loadWidths()
  all[key] = width
  try {
    localStorage.setItem(WIDTHS_KEY, JSON.stringify(all))
  } catch {
    /* storage full or unavailable — width just won't persist across reloads */
  }
}

/**
 * Drag-to-resize sidebar wrapper. Replaces a fixed `w-*` sidebar div: width is tracked in
 * state + persisted per `storageKey` (own localStorage bucket, not per-page state), and a
 * thin handle on the right edge lets the user drag it wider/narrower. Double-click resets.
 */
export function ResizablePanel({
  storageKey,
  defaultWidth = 384,
  min = 260,
  max = 720,
  className = '',
  children,
}: {
  storageKey: string
  defaultWidth?: number
  min?: number
  max?: number
  className?: string
  children: ReactNode
}) {
  const [width, setWidth] = useState(() => loadWidths()[storageKey] ?? defaultWidth)
  const widthRef = useRef(width)
  const [dragging, setDragging] = useState(false)

  function startDrag(e: React.MouseEvent) {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = widthRef.current
    setDragging(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    function onMove(ev: MouseEvent) {
      const next = Math.min(max, Math.max(min, startWidth + (ev.clientX - startX)))
      widthRef.current = next
      setWidth(next)
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setDragging(false)
      persistWidth(storageKey, widthRef.current)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function reset() {
    widthRef.current = defaultWidth
    setWidth(defaultWidth)
    persistWidth(storageKey, defaultWidth)
  }

  return (
    <div className="relative flex shrink-0" style={{ width }}>
      <div className={`min-w-0 flex-1 ${className}`}>{children}</div>
      <div
        onMouseDown={startDrag}
        onDoubleClick={reset}
        title="Drag to resize · double-click to reset"
        className="group absolute -right-2 top-0 z-10 h-full w-4 cursor-col-resize touch-none"
      >
        <div className={`mx-auto h-full w-px transition-colors ${dragging ? 'bg-cyan' : 'bg-transparent group-hover:bg-cyan/50'}`} />
      </div>
    </div>
  )
}
