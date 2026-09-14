export type FlagDoc = { flag: string; description: string }

export const FLAG_REFERENCE: Record<string, FlagDoc[]> = {
  find: [
    { flag: '-name PATTERN', description: 'Match by filename (glob, case-sensitive)' },
    { flag: '-iname PATTERN', description: 'Match by filename, case-insensitive' },
    { flag: '-type f|d|l', description: 'Only files / directories / symlinks' },
    { flag: '-mtime -N|+N', description: 'Modified less than / more than N days ago' },
    { flag: '-mmin -N|+N', description: 'Modified less than / more than N minutes ago' },
    { flag: '-size +N[kMG]', description: 'Larger than N (k=KB, M=MB, G=GB)' },
    { flag: '-maxdepth N', description: "Don't descend more than N levels" },
    { flag: '-exec CMD {} \\;', description: 'Run CMD on each match ({} = the path)' },
    { flag: '-delete', description: 'Delete matches (put last, after all filters)' },
  ],
  tar: [
    { flag: '-c', description: 'Create an archive' },
    { flag: '-x', description: 'Extract an archive' },
    { flag: '-t', description: 'List contents without extracting' },
    { flag: '-z', description: 'gzip compression (.tar.gz)' },
    { flag: '-j', description: 'bzip2 compression (.tar.bz2)' },
    { flag: '-v', description: 'Verbose — print each file' },
    { flag: '-f FILE', description: 'Archive filename (almost always needed, goes last)' },
    { flag: '-C DIR', description: 'Change to DIR before acting (extract elsewhere)' },
  ],
  curl: [
    { flag: '-X METHOD', description: 'HTTP method (GET/POST/PUT/DELETE...)' },
    { flag: '-H "Header: value"', description: 'Add a request header (repeatable)' },
    { flag: '-d DATA', description: 'Send data as request body (implies POST)' },
    { flag: '-o FILE', description: 'Write response body to FILE' },
    { flag: '-L', description: 'Follow redirects' },
    { flag: '-i', description: 'Include response headers in output' },
    { flag: '-s', description: 'Silent — no progress meter' },
    { flag: '-v', description: 'Verbose — show the full request/response' },
    { flag: '-u user:pass', description: 'Basic auth credentials' },
    { flag: '-k', description: 'Skip TLS certificate verification (dev only!)' },
  ],
  netstat: [
    { flag: '-t', description: 'TCP sockets' },
    { flag: '-u', description: 'UDP sockets' },
    { flag: '-l', description: 'Listening sockets only' },
    { flag: '-n', description: "Numeric addresses (don't resolve DNS)" },
    { flag: '-p', description: 'Show the owning process (needs root for others\' processes)' },
  ],
  ss: [
    { flag: '-t', description: 'TCP sockets' },
    { flag: '-u', description: 'UDP sockets' },
    { flag: '-l', description: 'Listening sockets only' },
    { flag: '-n', description: "Numeric addresses (don't resolve DNS)" },
    { flag: '-p', description: 'Show the owning process' },
  ],
  journalctl: [
    { flag: '-u UNIT', description: 'Only this systemd unit' },
    { flag: '-f', description: 'Follow (like tail -f)' },
    { flag: '-n N', description: 'Show last N lines' },
    { flag: '--since "TIME"', description: 'Only entries after TIME' },
    { flag: '-p PRIORITY', description: 'Minimum priority (err, warning, info...)' },
    { flag: '-r', description: 'Reverse — newest first' },
  ],
  rsync: [
    { flag: '-a', description: 'Archive mode (preserves permissions, times, symlinks — almost always wanted)' },
    { flag: '-v', description: 'Verbose' },
    { flag: '-z', description: 'Compress during transfer' },
    { flag: '-n', description: 'Dry run — show what would happen, change nothing' },
    { flag: '--delete', description: 'Delete files in destination that no longer exist in source' },
    { flag: '-e "ssh -p PORT"', description: 'Use a non-default SSH port' },
  ],
  ssh: [
    { flag: '-L localPort:host:remotePort', description: 'Local port forward (tunnel a remote service to your machine)' },
    { flag: '-R remotePort:host:localPort', description: 'Remote port forward (expose your local service to the remote side)' },
    { flag: '-N', description: "Don't run a remote command — just forward" },
    { flag: '-i FILE', description: 'Identity (private key) file' },
    { flag: '-p PORT', description: 'Non-default SSH port' },
  ],
}

export function explainCommand(input: string): FlagDoc[] {
  const tokens = input.trim().split(/\s+/)
  const base = tokens[0]?.replace(/^.*\//, '')
  const docs = FLAG_REFERENCE[base]
  if (!docs) return []
  const matched: FlagDoc[] = []
  for (const token of tokens.slice(1)) {
    const flagKey = token.replace(/^(-[a-zA-Z-]+).*/, '$1')
    const doc = docs.find((d) => d.flag.startsWith(flagKey) && flagKey.length > 1)
    if (doc && !matched.includes(doc)) matched.push(doc)
  }
  return matched
}
