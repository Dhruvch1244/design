/**
 * Minimal standard 5-field cron evaluator (minute hour day-of-month month day-of-week).
 * Supports *, N, N-M, N-M/S, star-slash-S step syntax, and comma lists. No seconds field, no @-shorthands, no
 * vixie-cron day-of-month/day-of-week OR semantics edge case — good enough for reading a
 * schedule someone pasted from Oozie/Airflow/crontab, not for a general-purpose cron parser.
 */

type FieldSpec = { match: (value: number) => boolean }

function parseField(field: string, min: number, max: number): FieldSpec {
  const matchers = field.split(',').map((part) => {
    if (part === '*') return (v: number) => true
    const [range, stepStr] = part.split('/')
    const step = stepStr ? parseInt(stepStr, 10) : 1
    let lo = min, hi = max
    if (range !== '*') {
      if (range.includes('-')) {
        const [a, b] = range.split('-').map(Number)
        lo = a
        hi = b
      } else {
        lo = hi = Number(range)
      }
    }
    return (v: number) => v >= lo && v <= hi && (v - lo) % step === 0
  })
  return { match: (v) => matchers.some((m) => m(v)) }
}

export function parseCron(expr: string) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) throw new Error('Expected 5 fields: minute hour day-of-month month day-of-week')
  const [minute, hour, dom, month, dow] = parts
  return {
    minute: parseField(minute, 0, 59),
    hour: parseField(hour, 0, 23),
    dom: parseField(dom, 1, 31),
    month: parseField(month, 1, 12),
    dow: parseField(dow, 0, 6),
  }
}

/** Walks forward minute-by-minute (capped) to find the next N fire times after `from`. */
export function nextRuns(expr: string, count: number, from: Date = new Date()): Date[] {
  const spec = parseCron(expr)
  const results: Date[] = []
  const cursor = new Date(from)
  cursor.setSeconds(0, 0)
  cursor.setMinutes(cursor.getMinutes() + 1)

  const maxIterations = 60 * 24 * 366 * 2; // up to ~2 years of minutes
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    if (
      spec.minute.match(cursor.getMinutes()) &&
      spec.hour.match(cursor.getHours()) &&
      spec.dom.match(cursor.getDate()) &&
      spec.month.match(cursor.getMonth() + 1) &&
      spec.dow.match(cursor.getDay())
    ) {
      results.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results
}

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid — expected 5 fields'
  const [minute, hour, dom, month, dow] = parts

  let time: string
  if (minute === '*' && hour === '*') {
    time = 'every minute'
  } else if (hour === '*') {
    time = minute.includes('/') ? `every ${minute.split('/')[1]} minutes` : `at minute ${minute} of every hour`
  } else if (minute === '*') {
    time = `every minute during hour ${hour}`
  } else {
    time = `at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  }
  const domPart = dom === '*' ? '' : ` on day ${dom} of the month`
  const monthPart = month === '*' ? '' : ` in ${month.split(',').map((m) => nameOrRange(m, MONTH_NAMES)).join(', ')}`
  const dowPart = dow === '*' ? '' : ` on ${dow.split(',').map((d) => nameOrRange(d, DOW_NAMES)).join(', ')}`

  return `Runs ${time}${domPart}${monthPart}${dowPart}`.trim()
}

function nameOrRange(token: string, names: string[]): string {
  if (/^\d+$/.test(token)) return names[Number(token)] ?? token
  if (/^\d+-\d+$/.test(token)) {
    const [a, b] = token.split('-').map(Number)
    return `${names[a] ?? a}–${names[b] ?? b}`
  }
  return token
}
