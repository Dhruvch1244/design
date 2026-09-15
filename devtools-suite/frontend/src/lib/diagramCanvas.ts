export type ShapeType = 'rect' | 'ellipse' | 'diamond' | 'text'

export type Shape = { id: string; type: ShapeType; x: number; y: number; w: number; h: number; text: string; color: string }
export type Connector = { id: string; from: string; to: string; label: string }
export type DiagramData = { shapes: Shape[]; connectors: Connector[] }

export const SHAPE_COLORS = ['#2fe6f2', '#9a6bff', '#34e8ab', '#f2b45e', '#ff6f8f']

export function newId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function defaultShape(type: ShapeType, x: number, y: number): Shape {
  const size = type === 'text' ? { w: 120, h: 32 } : { w: 140, h: 70 }
  return { id: newId(), type, x: x - size.w / 2, y: y - size.h / 2, ...size, text: type === 'text' ? 'label' : 'box', color: SHAPE_COLORS[0] }
}

/** Where a straight line from `from`'s center to `to`'s center crosses `from`'s boundary — every
 * shape is treated as the ellipse inscribed in its bounding box, which is a good-enough
 * approximation for rect/diamond too and keeps the intersection math a closed-form solve. */
export function boundaryPoint(from: Shape, to: Shape): { x: number; y: number } {
  const cx = from.x + from.w / 2
  const cy = from.y + from.h / 2
  const tx = to.x + to.w / 2
  const ty = to.y + to.h / 2
  const dx = tx - cx
  const dy = ty - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  const rx = from.w / 2
  const ry = from.h / 2
  const denom = Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2)
  const t = denom === 0 ? 0 : 1 / denom
  return { x: cx + t * dx, y: cy + t * dy }
}

const STORAGE_KEY = 'devtools.canvas-diagrams'

export function listSavedDiagrams(): Record<string, DiagramData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveDiagram(name: string, data: DiagramData) {
  const all = listSavedDiagrams()
  all[name] = data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteSavedDiagram(name: string) {
  const all = listSavedDiagrams()
  delete all[name]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
