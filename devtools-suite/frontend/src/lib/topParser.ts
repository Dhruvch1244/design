export type ProcessRow = { pid: string; user: string; cpu: number; mem: number; command: string; raw: string }

/**
 * Parses `top -b -n1` batch output and `ps aux` output into a common row shape. Both tools print
 * a header line with column names (PID, %CPU, %MEM, COMMAND/CMD, USER) in slightly different
 * positions, so this locates columns by header name rather than assuming a fixed layout.
 */
export function parseProcessSnapshot(text: string): ProcessRow[] {
  const lines = text.split('\n').map((l) => l.trimEnd())
  const headerIdx = lines.findIndex((l) => /\bPID\b/.test(l) && (/%?CPU/.test(l) || /\bCPU\b/.test(l)))
  if (headerIdx === -1) return []

  const header = lines[headerIdx].trim().split(/\s+/)
  const colIndex = (names: string[]) => header.findIndex((h) => names.includes(h.toUpperCase().replace('%', '')))

  const pidCol = colIndex(['PID'])
  const userCol = colIndex(['USER'])
  const cpuCol = colIndex(['CPU'])
  const memCol = colIndex(['MEM'])
  const commandColStart = Math.max(colIndex(['COMMAND']), colIndex(['CMD']));

  const rows: ProcessRow[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const parts = line.split(/\s+/)
    if (parts.length < header.length - 2) continue // heuristically skip stray non-data lines

    const command = commandColStart >= 0 ? parts.slice(commandColStart).join(' ') : parts[parts.length - 1]
    rows.push({
      pid: pidCol >= 0 ? parts[pidCol] ?? '' : '',
      user: userCol >= 0 ? parts[userCol] ?? '' : '',
      cpu: cpuCol >= 0 ? parseFloat(parts[cpuCol]) || 0 : 0,
      mem: memCol >= 0 ? parseFloat(parts[memCol]) || 0 : 0,
      command,
      raw: lines[i],
    })
  }
  return rows
}

export type SnapshotDiff = { command: string; pid: string; cpuDelta: number; memDelta: number; before: number; after: number }

export function diffSnapshots(before: ProcessRow[], after: ProcessRow[]): SnapshotDiff[] {
  const beforeByPid = new Map(before.map((r) => [r.pid, r]))
  const diffs: SnapshotDiff[] = []
  for (const a of after) {
    const b = beforeByPid.get(a.pid)
    if (!b) continue
    diffs.push({ command: a.command, pid: a.pid, cpuDelta: a.cpu - b.cpu, memDelta: a.mem - b.mem, before: b.cpu, after: a.cpu })
  }
  return diffs.sort((x, y) => Math.abs(y.cpuDelta) - Math.abs(x.cpuDelta))
}
