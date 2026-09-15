export type TreemapRect = { x: number; y: number; w: number; h: number }

/**
 * Simple slice-and-dice treemap: recursively splits the box along whichever axis is longer,
 * alternating as it goes deeper. Not squarified (boxes can get thin for skewed size
 * distributions), but it's simple, fast, and correct — good tradeoff for a "see where the
 * disk space went" tool where proportional area matters more than perfect aspect ratios.
 */
export function layoutRow<T extends { size: number }>(items: T[], x: number, y: number, w: number, h: number): (T & TreemapRect)[] {
  const total = items.reduce((a, it) => a + Math.max(0, it.size), 0)
  if (total <= 0 || items.length === 0) return []
  const horizontal = w >= h
  let offset = 0
  return items.map((it) => {
    const frac = Math.max(0, it.size) / total
    if (horizontal) {
      const iw = frac * w
      const rect = { x: x + offset, y, w: iw, h }
      offset += iw
      return { ...it, ...rect }
    }
    const ih = frac * h
    const rect = { x, y: y + offset, w, h: ih }
    offset += ih
    return { ...it, ...rect }
  })
}
