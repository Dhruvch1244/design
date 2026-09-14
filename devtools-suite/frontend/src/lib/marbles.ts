export type MarbleEvent = { frame: number; value: string | null; complete: boolean; error: boolean }

/**
 * Parses the standard ASCII marble syntax used in RxJS docs/tests: '-' is an empty frame, any
 * other character is a value emission, '|' is completion, '#' is an error. Each character is one
 * frame of "virtual time" — this is a diagram notation, not real elapsed time.
 */
export function parseMarbleDiagram(diagram: string): MarbleEvent[] {
  const events: MarbleEvent[] = []
  for (let frame = 0; frame < diagram.length; frame++) {
    const c = diagram[frame]
    if (c === '-' || c === ' ') continue
    if (c === '|') events.push({ frame, value: null, complete: true, error: false })
    else if (c === '#') events.push({ frame, value: null, complete: false, error: true })
    else events.push({ frame, value: c, complete: false, error: false })
  }
  return events
}

export function toMarbleDiagram(events: MarbleEvent[], length: number): string {
  const chars = new Array(length).fill('-')
  for (const e of events) {
    if (e.frame >= length) continue
    chars[e.frame] = e.error ? '#' : e.complete ? '|' : (e.value ?? '?')
  }
  return chars.join('')
}

function safeEval(expr: string, value: string): string {
  try {
    // eslint-disable-next-line no-new-func -- user-authored expression, run in their own browser tab; same trust boundary as typing into devtools.
    const fn = new Function('x', `return (${expr})(x)`)
    return String(fn(value))
  } catch {
    return '?'
  }
}

function safeTest(expr: string, value: string): boolean {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `return (${expr})(x)`)
    return Boolean(fn(value))
  } catch {
    return false
  }
}

export function applyMap(events: MarbleEvent[], expr: string): MarbleEvent[] {
  return events.map((e) => (e.value === null ? e : { ...e, value: safeEval(expr, e.value) }))
}

export function applyFilter(events: MarbleEvent[], expr: string): MarbleEvent[] {
  return events.filter((e) => e.value === null || safeTest(expr, e.value))
}

export function applyDelay(events: MarbleEvent[], frames: number): MarbleEvent[] {
  return events.map((e) => ({ ...e, frame: e.frame + frames }))
}

export function applyTake(events: MarbleEvent[], n: number): MarbleEvent[] {
  const values = events.filter((e) => !e.complete && !e.error)
  const taken = values.slice(0, n)
  if (taken.length < n) return taken
  const lastFrame = taken.length ? taken[taken.length - 1].frame : 0
  return [...taken, { frame: lastFrame + 1, value: null, complete: true, error: false }]
}

export function applySkip(events: MarbleEvent[], n: number): MarbleEvent[] {
  const values = events.filter((e) => !e.complete && !e.error)
  const rest = events.filter((e) => e.complete || e.error)
  return [...values.slice(n), ...rest]
}

export function applyMerge(a: MarbleEvent[], b: MarbleEvent[]): MarbleEvent[] {
  const values = [...a.filter((e) => !e.complete && !e.error), ...b.filter((e) => !e.complete && !e.error)]
  values.sort((x, y) => x.frame - y.frame)
  const bothComplete = a.some((e) => e.complete) && b.some((e) => e.complete)
  if (bothComplete) {
    const lastFrame = Math.max(...[...a, ...b].filter((e) => e.complete).map((e) => e.frame))
    values.push({ frame: lastFrame, value: null, complete: true, error: false })
  }
  return values
}
