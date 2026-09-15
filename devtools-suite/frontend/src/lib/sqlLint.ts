export type LintIssue = {
  severity: 'error' | 'warning'
  message: string
  line: number
}

/**
 * Blanks out string literals and comments (keeping newlines and length intact, so line
 * numbers and later regex checks stay accurate) and reports unterminated strings /
 * unbalanced parens along the way. Not a real parser — good enough to catch the common
 * footguns without a SQL grammar dependency.
 */
function scan(sql: string): { clean: string; issues: LintIssue[] } {
  const issues: LintIssue[] = []
  let clean = ''
  let line = 1
  let i = 0
  let parenDepth = 0
  let parenOpenLine: number[] = []

  while (i < sql.length) {
    const ch = sql[i]
    const next = sql[i + 1]

    if (ch === '\n') {
      line++
      clean += '\n'
      i++
      continue
    }

    if (ch === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') { clean += ' '; i++ }
      continue
    }

    if (ch === '/' && next === '*') {
      clean += '  '
      i += 2
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) {
        clean += sql[i] === '\n' ? (line++, '\n') : ' '
        i++
      }
      if (i < sql.length) { clean += '  '; i += 2 } else issues.push({ severity: 'error', message: 'Unterminated block comment.', line })
      continue
    }

    if (ch === "'" || ch === '"') {
      const quote = ch
      const startLine = line
      clean += ' '
      i++
      let closed = false
      while (i < sql.length) {
        if (sql[i] === quote && sql[i + 1] === quote) { clean += '  '; i += 2; continue }
        if (sql[i] === quote) { clean += ' '; i++; closed = true; break }
        clean += sql[i] === '\n' ? (line++, '\n') : ' '
        i++
      }
      if (!closed) issues.push({ severity: 'error', message: `Unterminated string literal starting at line ${startLine}.`, line: startLine })
      continue
    }

    if (ch === '(') { parenDepth++; parenOpenLine.push(line); clean += ch; i++; continue }
    if (ch === ')') {
      if (parenDepth === 0) issues.push({ severity: 'error', message: 'Unmatched closing parenthesis.', line })
      else { parenDepth--; parenOpenLine.pop() }
      clean += ch
      i++
      continue
    }

    clean += ch
    i++
  }

  if (parenDepth > 0) {
    for (const l of parenOpenLine) issues.push({ severity: 'error', message: 'Unclosed parenthesis.', line: l })
  }

  return { clean, issues }
}

function lineOf(clean: string, index: number): number {
  let line = 1
  for (let i = 0; i < index; i++) if (clean[i] === '\n') line++
  return line
}

export function lintSql(sql: string, opts: { readOnlyConnection?: boolean } = {}): LintIssue[] {
  if (!sql.trim()) return []
  const { clean, issues } = scan(sql)

  const statements = splitStatements(clean)

  for (const stmt of statements) {
    if (!stmt.text.trim()) continue
    const leadingMatch = stmt.text.match(/[A-Za-z_][A-Za-z0-9_]*/)
    const leading = leadingMatch?.[0]?.toUpperCase() ?? ''

    if ((leading === 'UPDATE' || leading === 'DELETE') && !/\bWHERE\b/i.test(stmt.text)) {
      issues.push({
        severity: 'warning',
        message: `${leading} with no WHERE clause — this affects every row in the table.`,
        line: lineOf(clean, stmt.start),
      })
    }

    if (/\bSELECT\s+\*/i.test(stmt.text)) {
      issues.push({
        severity: 'warning',
        message: 'SELECT * pulls every column — name only the ones you need.',
        line: lineOf(clean, stmt.start) + (stmt.text.slice(0, stmt.text.search(/\bSELECT\s+\*/i)).match(/\n/g)?.length ?? 0),
      })
    }

    if (/\bFROM\s+[A-Za-z_][\w.]*\s*,\s*[A-Za-z_][\w.]*/i.test(stmt.text) && !/\bJOIN\b/i.test(stmt.text) && !/\bWHERE\b/i.test(stmt.text)) {
      issues.push({
        severity: 'warning',
        message: 'Comma-joined tables with no WHERE clause — this produces a cartesian product.',
        line: lineOf(clean, stmt.start),
      })
    }

    if (leading === 'SELECT' && !/\bWHERE\b/i.test(stmt.text) && !/\bLIMIT\b/i.test(stmt.text) && !/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(stmt.text)) {
      issues.push({
        severity: 'warning',
        message: 'No WHERE or LIMIT — this could return an unbounded number of rows.',
        line: lineOf(clean, stmt.start),
      })
    }

    if (opts.readOnlyConnection) {
      const WRITE = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|MERGE|CALL|EXEC|EXECUTE|REPLACE|RENAME|LOCK|VACUUM|COPY|SET|REINDEX)\b/i
      const w = stmt.text.match(WRITE)
      if (w) {
        issues.push({
          severity: 'error',
          message: `'${w[0].toUpperCase()}' will be rejected — the active connection is read-only.`,
          line: lineOf(clean, stmt.start),
        })
      }
    }
  }

  return dedupe(issues).sort((a, b) => a.line - b.line)
}

function splitStatements(clean: string): { text: string; start: number }[] {
  const out: { text: string; start: number }[] = []
  let start = 0
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === ';') {
      out.push({ text: clean.slice(start, i), start })
      start = i + 1
    }
  }
  out.push({ text: clean.slice(start), start })
  return out
}

function dedupe(issues: LintIssue[]): LintIssue[] {
  const seen = new Set<string>()
  return issues.filter((i) => {
    const key = `${i.line}:${i.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
