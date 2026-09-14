/**
 * Extracts column name -> type pairs from a `CREATE TABLE ... (col1 type1, col2 type2, ...)`
 * statement. Handles the common Hive/Spark SQL/ANSI SQL shape; doesn't attempt to parse
 * partitioning clauses, storage format, or table properties — those aren't columns.
 */
export function parseCreateTable(ddl: string): Record<string, string> {
  const match = ddl.match(/CREATE\s+(?:EXTERNAL\s+)?TABLE\s+[^(]+\(([\s\S]*)\)/i)
  if (!match) return {}
  const body = match[1]

  const columns: Record<string, string> = {}
  let depth = 0
  let current = ''
  for (const char of body) {
    // Track both () and <> depth — Hive complex types (MAP<STRING, STRING>, ARRAY<...>) use
    // angle brackets, and a comma inside one must not be treated as a column separator.
    if (char === '(' || char === '<') depth++
    if (char === ')' || char === '>') depth--
    if (char === ',' && depth === 0) {
      addColumn(current, columns)
      current = ''
    } else {
      current += char
    }
  }
  addColumn(current, columns)
  return columns
}

function addColumn(clause: string, out: Record<string, string>) {
  const trimmed = clause.trim().replace(/,$/, '')
  if (!trimmed) return
  if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|CONSTRAINT|UNIQUE|INDEX|KEY)\b/i.test(trimmed)) return
  const nameMatch = trimmed.match(/^`?([A-Za-z_][A-Za-z0-9_]*)`?\s+(.+)$/)
  if (!nameMatch) return
  out[nameMatch[1]] = nameMatch[2].split(/\s+(?:NOT\s+NULL|DEFAULT|COMMENT)\b/i)[0].trim()
}
