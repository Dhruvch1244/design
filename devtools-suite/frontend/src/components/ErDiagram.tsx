import { useMemo, useState } from 'react'
import { Key, Link as LinkIcon } from '@phosphor-icons/react'
import type { TableNode } from '../lib/sqlApi'

const BOX_W = 220
const HEADER_H = 30
const ROW_H = 20
const GAP_X = 48
const GAP_Y = 48
const COLUMNS_PER_ROW = 3

export function ErDiagram({ tables }: { tables: TableNode[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  const layout = useMemo(() => {
    const boxHeights = tables.map((t) => HEADER_H + t.columns.length * ROW_H + 12)
    const positions = new Map<string, { x: number; y: number; h: number }>()

    let x = 0
    let y = 0
    let rowMaxH = 0
    let col = 0
    let maxWidth = 0

    tables.forEach((t, i) => {
      const h = boxHeights[i]
      positions.set(t.name, { x, y, h })
      rowMaxH = Math.max(rowMaxH, h)
      col++
      x += BOX_W + GAP_X
      maxWidth = Math.max(maxWidth, x)
      if (col >= COLUMNS_PER_ROW) {
        col = 0
        x = 0
        y += rowMaxH + GAP_Y
        rowMaxH = 0
      }
    })

    const totalHeight = y + rowMaxH + BOX_W
    return { positions, width: maxWidth || BOX_W, height: totalHeight || 300 }
  }, [tables])

  const relations = useMemo(() => {
    const list: { from: string; fromCol: string; to: string; toCol: string }[] = []
    for (const t of tables) {
      for (const fk of t.foreignKeys) {
        list.push({ from: t.name, fromCol: fk.column, to: fk.referencedTable, toCol: fk.referencedColumn })
      }
    }
    return list
  }, [tables])

  const connected = useMemo(() => {
    if (!selected) return null
    const set = new Set([selected])
    for (const r of relations) {
      if (r.from === selected) set.add(r.to)
      if (r.to === selected) set.add(r.from)
    }
    return set
  }, [selected, relations])

  function columnY(table: TableNode, columnName: string): number {
    const idx = table.columns.findIndex((c) => c.name === columnName)
    return HEADER_H + Math.max(0, idx) * ROW_H + ROW_H / 2
  }

  return (
    <div className="overflow-auto p-6" onClick={() => setSelected(null)}>
      <div className="relative" style={{ width: layout.width + 40, height: layout.height + 40 }}>
        <svg width={layout.width + 40} height={layout.height + 40} className="absolute inset-0">
          {relations.map((r, i) => {
            const from = layout.positions.get(r.from)
            const to = layout.positions.get(r.to)
            if (!from || !to) return null
            const fromTable = tables.find((t) => t.name === r.from)!
            const toTable = tables.find((t) => t.name === r.to)!
            const dimmed = connected && !(connected.has(r.from) && connected.has(r.to))
            const x1 = from.x + BOX_W + 20
            const y1 = from.y + 20 + columnY(fromTable, r.fromCol)
            const x2 = to.x + 20
            const y2 = to.y + 20 + columnY(toTable, r.toCol)
            const midX = (x1 + x2) / 2
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={dimmed ? 'var(--rule)' : 'var(--cyan)'}
                strokeWidth={dimmed ? 1 : 1.5}
                opacity={dimmed ? 0.4 : 0.8}
              />
            )
          })}
        </svg>

        {tables.map((t) => {
          const p = layout.positions.get(t.name)
          if (!p) return null
          const dimmed = connected && !connected.has(t.name)
          return (
            <div
              key={t.name}
              onClick={(e) => {
                e.stopPropagation()
                setSelected(selected === t.name ? null : t.name)
              }}
              className="absolute cursor-pointer overflow-hidden rounded-xl border border-rule bg-panel shadow-sm transition-opacity"
              style={{ left: p.x + 20, top: p.y + 20, width: BOX_W, opacity: dimmed ? 0.35 : 1 }}
            >
              <div className="border-b border-rule bg-glass px-2.5 py-1.5 text-xs font-semibold text-ink">{t.name}</div>
              <div>
                {t.columns.map((c) => {
                  const isFk = t.foreignKeys.some((fk) => fk.column === c.name)
                  return (
                    <div key={c.name} className="flex items-center gap-1.5 border-b border-rule-soft px-2.5 py-1 text-[11px] last:border-b-0">
                      {c.primaryKey ? (
                        <Key size={10} weight="fill" className="shrink-0 text-warm" />
                      ) : isFk ? (
                        <LinkIcon size={10} weight="light" className="shrink-0 text-cyan" />
                      ) : (
                        <span className="w-2.5 shrink-0" />
                      )}
                      <span className={`truncate ${c.primaryKey ? 'font-semibold text-ink' : 'text-ink-soft'}`}>{c.name}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-ink-faint">{c.type}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
