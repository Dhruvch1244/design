import { useEffect, useRef, useState } from 'react'
import {
  Circle,
  Cursor,
  Diamond as DiamondIcon,
  Rectangle,
  TextT,
  ArrowUpRight,
  Trash,
  DownloadSimple,
} from '@phosphor-icons/react'
import { boundaryPoint, defaultShape, newId, SHAPE_COLORS, type Connector, type DiagramData, type Shape, type ShapeType } from '../lib/diagramCanvas'

const CANVAS_W = 2400
const CANVAS_H = 1600

type Tool = 'select' | ShapeType | 'connect'

export function DiagramCanvasEditor({ data, onChange }: { data: DiagramData; onChange: (d: DiagramData) => void }) {
  const { shapes, connectors } = data
  const [tool, setTool] = useState<Tool>('select')
  const [selected, setSelected] = useState<{ kind: 'shape' | 'connector'; id: string } | null>(null)
  const [connectSource, setConnectSource] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: string; startX: number; startY: number; shapeX: number; shapeY: number } | null>(null)
  const resizeRef = useRef<{ id: string; startX: number; startY: number; w: number; h: number } | null>(null)

  function setShapes(next: Shape[]) {
    onChange({ shapes: next, connectors })
  }
  function setConnectors(next: Connector[]) {
    onChange({ shapes, connectors: next })
  }

  function canvasPoint(e: React.MouseEvent): { x: number; y: number } {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left + containerRef.current!.scrollLeft, y: e.clientY - rect.top + containerRef.current!.scrollTop }
  }

  function handleCanvasClick(e: React.MouseEvent) {
    if (e.target !== containerRef.current) return
    if (tool === 'select' || tool === 'connect') {
      setSelected(null)
      setConnectSource(null)
      return
    }
    const p = canvasPoint(e)
    const shape = defaultShape(tool, p.x, p.y)
    setShapes([...shapes, shape])
    setSelected({ kind: 'shape', id: shape.id })
    setTool('select')
  }

  function handleShapeMouseDown(e: React.MouseEvent, shape: Shape) {
    e.stopPropagation()
    if (tool === 'connect') {
      if (!connectSource) {
        setConnectSource(shape.id)
      } else if (connectSource !== shape.id) {
        setConnectors([...connectors, { id: newId(), from: connectSource, to: shape.id, label: '' }])
        setConnectSource(null)
        setTool('select')
      }
      return
    }
    setSelected({ kind: 'shape', id: shape.id })
    const p = canvasPoint(e)
    dragRef.current = { id: shape.id, startX: p.x, startY: p.y, shapeX: shape.x, shapeY: shape.y }

    function onMove(ev: MouseEvent) {
      if (!dragRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = ev.clientX - rect.left + containerRef.current.scrollLeft
      const cy = ev.clientY - rect.top + containerRef.current.scrollTop
      const dx = cx - dragRef.current.startX
      const dy = cy - dragRef.current.startY
      setShapes(
        shapesRef.current.map((s) => (s.id === dragRef.current!.id ? { ...s, x: dragRef.current!.shapeX + dx, y: dragRef.current!.shapeY + dy } : s))
      )
    }
    function onUp() {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Keep a ref mirror of shapes so the module-scope onMove handler always sees the latest array.
  const shapesRef = useRef(shapes)
  shapesRef.current = shapes

  function handleResizeMouseDown(e: React.MouseEvent, shape: Shape) {
    e.stopPropagation()
    resizeRef.current = { id: shape.id, startX: e.clientX, startY: e.clientY, w: shape.w, h: shape.h }
    function onMove(ev: MouseEvent) {
      if (!resizeRef.current) return
      const dx = ev.clientX - resizeRef.current.startX
      const dy = ev.clientY - resizeRef.current.startY
      setShapes(
        shapesRef.current.map((s) =>
          s.id === resizeRef.current!.id ? { ...s, w: Math.max(40, resizeRef.current!.w + dx), h: Math.max(28, resizeRef.current!.h + dy) } : s
        )
      )
    }
    function onUp() {
      resizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function deleteSelected() {
    if (!selected) return
    if (selected.kind === 'shape') {
      setShapes(shapes.filter((s) => s.id !== selected.id))
      setConnectors(connectors.filter((c) => c.from !== selected.id && c.to !== selected.id))
    } else {
      setConnectors(connectors.filter((c) => c.id !== selected.id))
    }
    setSelected(null)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !editingId && document.activeElement?.tagName !== 'INPUT') {
        deleteSelected()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }) // deliberately no deps array — always wants the latest `selected`/`deleteSelected` closure

  function recolor(color: string) {
    if (!selected || selected.kind !== 'shape') return
    setShapes(shapes.map((s) => (s.id === selected.id ? { ...s, color } : s)))
  }

  function exportSvg() {
    const bounds = shapes.reduce(
      (b, s) => ({ minX: Math.min(b.minX, s.x), minY: Math.min(b.minY, s.y), maxX: Math.max(b.maxX, s.x + s.w), maxY: Math.max(b.maxY, s.y + s.h) }),
      { minX: 0, minY: 0, maxX: 800, maxY: 500 }
    )
    const pad = 30
    const w = bounds.maxX - bounds.minX + pad * 2
    const h = bounds.maxY - bounds.minY + pad * 2
    const ox = -bounds.minX + pad
    const oy = -bounds.minY + pad

    const edgesSvg = connectors
      .map((c) => {
        const from = shapes.find((s) => s.id === c.from)
        const to = shapes.find((s) => s.id === c.to)
        if (!from || !to) return ''
        const p1 = boundaryPoint(from, to)
        const p2 = boundaryPoint(to, from)
        return `<line x1="${p1.x + ox}" y1="${p1.y + oy}" x2="${p2.x + ox}" y2="${p2.y + oy}" stroke="#666" stroke-width="2" marker-end="url(#arrow)" />`
      })
      .join('')

    const shapesSvg = shapes
      .map((s) => {
        const cx = s.x + s.w / 2 + ox
        const cy = s.y + s.h / 2 + oy
        let shapeSvg = ''
        if (s.type === 'rect') shapeSvg = `<rect x="${s.x + ox}" y="${s.y + oy}" width="${s.w}" height="${s.h}" rx="10" fill="${s.color}22" stroke="${s.color}" stroke-width="2" />`
        else if (s.type === 'ellipse') shapeSvg = `<ellipse cx="${cx}" cy="${cy}" rx="${s.w / 2}" ry="${s.h / 2}" fill="${s.color}22" stroke="${s.color}" stroke-width="2" />`
        else if (s.type === 'diamond') {
          const pts = `${cx},${s.y + oy} ${s.x + s.w + ox},${cy} ${cx},${s.y + s.h + oy} ${s.x + ox},${cy}`
          shapeSvg = `<polygon points="${pts}" fill="${s.color}22" stroke="${s.color}" stroke-width="2" />`
        }
        const text = `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-family="sans-serif" fill="#1a1a1a">${escapeXml(s.text)}</text>`
        return shapeSvg + text
      })
      .join('')

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#666"/></marker></defs>
      <rect width="${w}" height="${h}" fill="#ffffff" />
      ${edgesSvg}${shapesSvg}
    </svg>`

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-1 border-b border-rule-soft px-3 py-2">
        <ToolButton active={tool === 'select'} onClick={() => setTool('select')} title="Select / move"><Cursor size={15} weight="light" /></ToolButton>
        <ToolButton active={tool === 'rect'} onClick={() => setTool('rect')} title="Add rectangle"><Rectangle size={15} weight="light" /></ToolButton>
        <ToolButton active={tool === 'ellipse'} onClick={() => setTool('ellipse')} title="Add ellipse"><Circle size={15} weight="light" /></ToolButton>
        <ToolButton active={tool === 'diamond'} onClick={() => setTool('diamond')} title="Add diamond"><DiamondIcon size={15} weight="light" /></ToolButton>
        <ToolButton active={tool === 'text'} onClick={() => setTool('text')} title="Add text label"><TextT size={15} weight="light" /></ToolButton>
        <ToolButton active={tool === 'connect'} onClick={() => { setTool('connect'); setConnectSource(null) }} title="Connect two shapes">
          <ArrowUpRight size={15} weight="light" />
        </ToolButton>

        <div className="mx-1 h-5 w-px bg-rule" />

        {selected?.kind === 'shape' && (
          <div className="flex items-center gap-1">
            {SHAPE_COLORS.map((c) => (
              <button key={c} onClick={() => recolor(c)} className="h-5 w-5 rounded-full ring-1 ring-white/10" style={{ background: c }} />
            ))}
          </div>
        )}

        <button onClick={deleteSelected} disabled={!selected} className="ml-1 rounded-lg p-1.5 text-ink-faint hover:bg-glass hover:text-rose disabled:opacity-30">
          <Trash size={15} weight="light" />
        </button>

        <button onClick={exportSvg} className="ml-auto rounded-lg p-1.5 text-ink-faint hover:bg-glass hover:text-ink" title="Export as SVG">
          <DownloadSimple size={15} weight="light" />
        </button>

        {tool === 'connect' && (
          <span className="text-[10.5px] text-ink-faint">{connectSource ? 'Click the target shape…' : 'Click the source shape…'}</span>
        )}
      </div>

      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative flex-1 overflow-auto"
        style={{ background: 'radial-gradient(var(--rule) 1px, transparent 1px) 0 0 / 20px 20px', cursor: tool !== 'select' && tool !== 'connect' ? 'crosshair' : 'default' }}
      >
        <div style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative' }}>
          <svg width={CANVAS_W} height={CANVAS_H} className="absolute inset-0 pointer-events-none">
            <defs>
              <marker id="canvas-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 Z" fill="var(--ink-faint)" />
              </marker>
            </defs>
            {connectors.map((c) => {
              const from = shapes.find((s) => s.id === c.from)
              const to = shapes.find((s) => s.id === c.to)
              if (!from || !to) return null
              const p1 = boundaryPoint(from, to)
              const p2 = boundaryPoint(to, from)
              const isSelected = selected?.kind === 'connector' && selected.id === c.id
              return (
                <line
                  key={c.id}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isSelected ? 'var(--cyan)' : 'var(--ink-faint)'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  markerEnd="url(#canvas-arrow)"
                  className="pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelected({ kind: 'connector', id: c.id })
                  }}
                />
              )
            })}
          </svg>

          {shapes.map((s) => (
            <div
              key={s.id}
              onMouseDown={(e) => handleShapeMouseDown(e, s)}
              onDoubleClick={(e) => {
                e.stopPropagation()
                setEditingId(s.id)
              }}
              className="absolute flex select-none items-center justify-center text-center text-[12.5px] text-void"
              style={{
                left: s.x,
                top: s.y,
                width: s.w,
                height: s.h,
                background: `${s.color}33`,
                border: `2px solid ${s.color}`,
                borderRadius: s.type === 'rect' ? 10 : s.type === 'ellipse' ? '9999px' : 0,
                clipPath: s.type === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : undefined,
                outline: selected?.kind === 'shape' && selected.id === s.id ? '2px solid var(--cyan)' : undefined,
                outlineOffset: 2,
                color: 'var(--ink)',
              }}
            >
              {editingId === s.id ? (
                <input
                  autoFocus
                  defaultValue={s.text}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    setShapes(shapes.map((x) => (x.id === s.id ? { ...x, text: e.target.value } : x)))
                    setEditingId(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  className="w-[90%] bg-transparent text-center text-[12.5px] text-ink outline-none"
                />
              ) : (
                <span className="px-1">{s.text}</span>
              )}

              {selected?.kind === 'shape' && selected.id === s.id && (
                <div
                  onMouseDown={(e) => handleResizeMouseDown(e, s)}
                  className="absolute -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize rounded-full border border-cyan bg-void"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ToolButton({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-lg p-1.5 transition-colors ${active ? 'bg-glass-strong text-cyan' : 'text-ink-faint hover:bg-glass hover:text-ink'}`}
    >
      {children}
    </button>
  )
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c] as string)
}
