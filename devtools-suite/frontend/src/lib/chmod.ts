const RWX = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']

export function octalToSymbolic(octal: string): string {
  const digits = octal.trim().padStart(3, '0').slice(-3).split('').map(Number)
  if (digits.some((d) => Number.isNaN(d) || d < 0 || d > 7)) throw new Error('Expected 3 octal digits, 0-7 each')
  return digits.map((d) => RWX[d]).join('')
}

export function symbolicToOctal(symbolic: string): string {
  const s = symbolic.replace(/^[-dlcbps]/, '') // tolerate a leading file-type char from `ls -l`
  if (s.length !== 9 || !/^[r-][w-][xstST-]{1}[r-][w-][xstST-]{1}[r-][w-][xstST-]{1}$/.test(s)) {
    throw new Error('Expected a 9-character rwx string, e.g. rwxr-xr--')
  }
  let result = ''
  for (let i = 0; i < 9; i += 3) {
    const [r, w, x] = [s[i], s[i + 1], s[i + 2]]
    const value = (r !== '-' ? 4 : 0) + (w !== '-' ? 2 : 0) + (x !== '-' && x !== 'S' && x !== 'T' ? 1 : 0)
    result += value
  }
  return result
}
