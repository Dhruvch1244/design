import { useMemo, useState } from 'react'
import type { BeanKind, SpringVizEdge, SpringVizNode } from '../lib/springVizApi'

const LAYER_ORDER: BeanKind[] = ['RestController', 'Controller', 'Configuration', 'Service', 'Component', 'Repository']
const LAYER_INDEX: Record<BeanKind, number> = { RestController: 0, Controller: 0, Configuration: 0, Service: 1, Component: 1, Repository: 2 }
const KIND_COLOR: Record<BeanKind, string> = {
  RestController: 'var(--cyan)',
  Controller: 'var(--cyan)',
  Service: 'var(--violet)',
  Component: 'var(--warm)',
  Repository: 'var(--emerald)',
  Configuration: 'var(--rose)',
}

const BOX_W = 168
const BOX_H = 56
const GAP_X = 28
const GAP_Y = 72

export function SpringVizGraph({ nodes, edges }: { nodes: SpringVizNode[]; edges: SpringVizEdge[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  const { positions, width, height } = useMemo(() => {
    const byLayer = new Map<number, SpringVizNode[]>()
    for (const n of nodes) {
      const layer = LAYER_INDEX[n.kind] ?? 1
      if (!byLayer.has(layer)) byLayer.set(layer, [])
      byLayer.get(layer)!.push(n)
    }

    const pos = new Map<string, { x: number; y: number }>()
    let maxRowWidth = 0
    const layerKeys = Array.from(byLayer.keys()).sort((a, b) => a - b)
    for (const layer of layerKeys) {
      const rowNodes = byLayer.get(layer)!
      const rowWidth = rowNodes.length * BOX_W + (rowNodes.length - 1) * GAP_X
      maxRowWidth = Math.max(maxRowWidth, rowWidth)
      rowNodes.forEach((n, i) => {
        pos.set(n.id, { x: i * (BOX_W + GAP_X), y: layer * (BOX_H + GAP_Y) })
      })
    }

    // Center each row within the overall width.
    for (const layer of layerKeys) {
      const rowNodes = byLayer.get(layer)!
      const rowWidth = rowNodes.length * BOX_W + (rowNodes.length - 1) * GAP_X
      const offset = (maxRowWidth - rowWidth) / 2
      for (const n of rowNodes) {
        const p = pos.get(n.id)!
        pos.set(n.id, { ...p, x: p.x + offset })
      }
    }

    const height = (Math.max(...layerKeys, 0) + 1) * (BOX_H + GAP_Y)
    return { positions: pos, width: maxRowWidth || 400, height: height || 200 }
  }, [nodes])

  const connectedIds = useMemo(() => {
    if (!selected) return null
    const set = new Set([selected])
    for (const e of edges) {
      if (e.from === selected) set.add(e.to)
      if (e.to === selected) set.add(e.from)
    }
    return set
  }, [selected, edges])

  if (nodes.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-ink-faint">No Spring-stereotyped classes found.</div>
  }

  return (
    <div className="overflow-auto p-6" onClick={() => setSelected(null)}>
      <div className="relative" style={{ width: width + 40, height: height + 40 }}>
        <svg width={width + 40} height={height + 40} className="absolute inset-0">
          {edges.map((e, i) => {
            const from = positions.get(e.from)
            const to = positions.get(e.to)
            if (!from || !to) return null
            const dimmed = connectedIds && !(connectedIds.has(e.from) && connectedIds.has(e.to))
            const x1 = from.x + BOX_W / 2 + 20
            const y1 = from.y + BOX_H + 20
            const x2 = to.x + BOX_W / 2 + 20
            const y2 = to.y + 20
            const midY = (y1 + y2) / 2
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke={dimmed ? 'var(--rule)' : 'var(--ink-faint)'}
                strokeWidth={1.5}
                markerEnd="url(#arrow)"
              />
            )
          })}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--ink-faint)" strokeWidth={1.2} />
            </marker>
          </defs>
        </svg>

        {nodes.map((n) => {
          const p = positions.get(n.id)
          if (!p) return null
          const dimmed = connectedIds && !connectedIds.has(n.id)
          return (
            <div
              key={n.id}
              onClick={(e) => {
                e.stopPropagation()
                setSelected(selected === n.id ? null : n.id)
              }}
              className="absolute cursor-pointer rounded-xl border bg-panel px-3 py-2 transition-opacity"
              style={{
                left: p.x + 20,
                top: p.y + 20,
                width: BOX_W,
                height: BOX_H,
                borderColor: KIND_COLOR[n.kind],
                opacity: dimmed ? 0.3 : 1,
              }}
            >
              <div className="truncate text-xs font-semibold text-ink">{n.simpleName}</div>
              <div className="truncate text-[10px] text-ink-faint">{n.packageName}</div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND_COLOR[n.kind] }} />
                <span className="text-[9.5px] uppercase tracking-wide text-ink-faint">{n.kind}</span>
                {n.endpointCount > 0 && <span className="text-[9.5px] text-cyan">· {n.endpointCount} routes</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function GraphLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-soft">
      {(['RestController', 'Service', 'Repository', 'Component', 'Configuration'] as BeanKind[]).map((k) => (
        <div key={k} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: KIND_COLOR[k] }} />
          {k}
        </div>
      ))}
    </div>
  )
}

export const SPRING_LAYER_ORDER = LAYER_ORDER
