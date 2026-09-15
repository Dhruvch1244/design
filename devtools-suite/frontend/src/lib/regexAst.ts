/**
 * Small recursive-descent parser turning a regex pattern into a display AST for the
 * railroad-style visualizer. Not a validating regex engine — it's forgiving by design
 * (unknown escapes become literal characters) since the goal is "show me the shape of
 * this pattern," not "reject invalid regex."
 */
export type RegexNode =
  | { type: 'seq'; items: RegexNode[] }
  | { type: 'alt'; branches: RegexNode[] }
  | { type: 'lit'; text: string }
  | { type: 'class'; text: string }
  | { type: 'anchor'; text: string }
  | { type: 'group'; inner: RegexNode; label: string }
  | { type: 'quant'; inner: RegexNode; label: string }
  | { type: 'dot' }
  | { type: 'shorthand'; text: string }

const SHORTHAND_LABELS: Record<string, string> = {
  '\\d': 'digit', '\\D': 'not digit',
  '\\w': 'word char', '\\W': 'not word char',
  '\\s': 'whitespace', '\\S': 'not whitespace',
  '\\b': 'word boundary', '\\B': 'not word boundary',
}

export function shorthandLabel(text: string): string {
  return SHORTHAND_LABELS[text] ?? text
}

export function parseRegex(pattern: string): RegexNode {
  let i = 0
  const len = pattern.length

  function peek(): string | undefined {
    return pattern[i]
  }

  function parseAlt(): RegexNode {
    const branches = [parseSeq()]
    while (peek() === '|') {
      i++
      branches.push(parseSeq())
    }
    return branches.length === 1 ? branches[0] : { type: 'alt', branches }
  }

  function parseSeq(): RegexNode {
    const items: RegexNode[] = []
    while (i < len && peek() !== '|' && peek() !== ')') {
      items.push(parseQuantified())
    }
    return mergeLiterals(items.length === 1 ? items[0] : { type: 'seq', items })
  }

  function parseQuantified(): RegexNode {
    const atom = parseAtom()
    const q = peek()
    if (q === '*' || q === '+' || q === '?') {
      i++
      const lazy = peek() === '?'
      if (lazy) i++
      const label = q === '*' ? '0 or more' : q === '+' ? '1 or more' : '0 or 1'
      return { type: 'quant', inner: atom, label: label + (lazy ? ' (lazy)' : '') }
    }
    if (q === '{') {
      const close = pattern.indexOf('}', i)
      if (close !== -1) {
        const spec = pattern.slice(i + 1, close)
        if (/^\d+(,\d*)?$/.test(spec)) {
          i = close + 1
          const lazy = peek() === '?'
          if (lazy) i++
          const [min, max] = spec.split(',')
          const label = max === undefined ? `exactly ${min}` : max === '' ? `${min} or more` : `${min}–${max}`
          return { type: 'quant', inner: atom, label: label + ' times' + (lazy ? ' (lazy)' : '') }
        }
      }
    }
    return atom
  }

  function parseAtom(): RegexNode {
    const c = peek()
    if (c === '(') {
      i++
      let label = 'group'
      if (pattern.startsWith('?:', i)) {
        label = 'non-capturing'
        i += 2
      } else if (pattern.startsWith('?=', i)) {
        label = 'lookahead'
        i += 2
      } else if (pattern.startsWith('?!', i)) {
        label = 'negative lookahead'
        i += 2
      } else if (pattern.startsWith('?<=', i)) {
        label = 'lookbehind'
        i += 3
      } else if (pattern.startsWith('?<!', i)) {
        label = 'negative lookbehind'
        i += 3
      } else if (pattern.startsWith('?<', i)) {
        const close = pattern.indexOf('>', i)
        if (close !== -1) {
          label = pattern.slice(i + 2, close)
          i = close + 1
        }
      }
      const inner = parseAlt()
      if (peek() === ')') i++
      return { type: 'group', inner, label }
    }
    if (c === '[') {
      const start = i
      i++
      if (peek() === '^') i++
      if (peek() === ']') i++
      while (i < len && peek() !== ']') {
        if (peek() === '\\') i++
        i++
      }
      if (peek() === ']') i++
      return { type: 'class', text: pattern.slice(start, i) }
    }
    if (c === '^' || c === '$') {
      i++
      return { type: 'anchor', text: c === '^' ? 'start of line' : 'end of line' }
    }
    if (c === '.') {
      i++
      return { type: 'dot' }
    }
    if (c === '\\') {
      i++
      const e = pattern[i] ?? ''
      i++
      const token = '\\' + e
      if ('dDwWsSbB'.includes(e)) return { type: 'shorthand', text: token }
      return { type: 'lit', text: e }
    }
    i++
    return { type: 'lit', text: c ?? '' }
  }

  const result = parseAlt()
  return result
}

function mergeLiterals(node: RegexNode): RegexNode {
  if (node.type !== 'seq') return node
  const merged: RegexNode[] = []
  for (const item of node.items) {
    const last = merged[merged.length - 1]
    if (item.type === 'lit' && last?.type === 'lit') {
      last.text += item.text
    } else {
      merged.push(item)
    }
  }
  return merged.length === 1 ? merged[0] : { type: 'seq', items: merged }
}
