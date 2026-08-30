/**
 * Minimal LCS-based line diff, dependency-free (this package has exactly
 * one runtime dependency, cross-spawn, on purpose — pulling in a diff
 * library for a feature used on files that are typically under a few
 * hundred lines isn't worth the extra install weight). Returns an array of
 * { type: "same"|"add"|"del", line } in display order.
 */
export function lineDiff(oldText, newText) {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const n = a.length;
  const m = b.length;

  // dp[i][j] = length of the LCS of a[i:] and b[j:]
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: "same", line: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", line: a[i] });
      i++;
    } else {
      out.push({ type: "add", line: b[j] });
      j++;
    }
  }
  while (i < n) out.push({ type: "del", line: a[i++] });
  while (j < m) out.push({ type: "add", line: b[j++] });
  return out;
}

/** Renders a diff as +/- lines with a little unchanged context, collapsing
 * long unchanged runs — a full unified-diff hunk format isn't needed here
 * since this only ever prints to a terminal, not to a patch file. */
export function formatDiff(diff, { context = 2 } = {}) {
  const lines = [];
  let sinceChange = Infinity;
  let pendingSame = [];

  function flushContext() {
    const take = pendingSame.slice(-context);
    if (pendingSame.length > context) lines.push("  ...");
    for (const l of take) lines.push(`  ${l}`);
    pendingSame = [];
  }

  for (const entry of diff) {
    if (entry.type === "same") {
      pendingSame.push(entry.line);
      sinceChange++;
      if (sinceChange > context && pendingSame.length > context) {
        pendingSame = pendingSame.slice(-context);
      }
    } else {
      flushContext();
      lines.push(`${entry.type === "add" ? "+" : "-"} ${entry.line}`);
      sinceChange = 0;
    }
  }
  return lines.join("\n");
}

export function hasChanges(diff) {
  return diff.some((entry) => entry.type !== "same");
}
