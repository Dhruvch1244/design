export type GitCommit = { hash: string; parents: string[]; subject: string; author: string; date: string }

export type PositionedCommit = GitCommit & { lane: number; row: number }

/** Parses `git log --all --format="%H|%P|%s|%an|%ad" --date=short` output (one commit per line). */
export function parseGitLog(text: string): GitCommit[] {
  const commits: GitCommit[] = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const [hash, parents, subject, author, date] = line.split('|')
    if (!hash) continue
    commits.push({
      hash: hash.trim(),
      parents: parents ? parents.trim().split(/\s+/).filter(Boolean) : [],
      subject: subject ?? '',
      author: author ?? '',
      date: date ?? '',
    })
  }
  return commits
}

/**
 * Assigns each commit a (lane, row) so a branch graph can be drawn — same idea `git log
 * --graph` uses internally: walk newest-to-oldest, track which hash each open lane is
 * "waiting for" (its next parent), and reuse/spawn lanes as merges and branches appear.
 */
export function layoutCommits(commits: GitCommit[]): { positioned: PositionedCommit[]; laneCount: number } {
  const lanes: (string | null)[] = []
  const positioned: PositionedCommit[] = []

  commits.forEach((c, row) => {
    let lane = lanes.findIndex((expected) => expected === c.hash)
    if (lane === -1) {
      lane = lanes.findIndex((expected) => expected === null)
      if (lane === -1) {
        lane = lanes.length
        lanes.push(null)
      }
    }
    positioned.push({ ...c, lane, row })

    lanes[lane] = c.parents[0] ?? null

    for (let pi = 1; pi < c.parents.length; pi++) {
      const parentHash = c.parents[pi]
      let existing = lanes.findIndex((e) => e === parentHash)
      if (existing === -1) {
        existing = lanes.findIndex((e) => e === null)
        if (existing === -1) {
          lanes.push(parentHash)
        } else {
          lanes[existing] = parentHash
        }
      }
    }
  })

  return { positioned, laneCount: Math.max(1, lanes.length) }
}
