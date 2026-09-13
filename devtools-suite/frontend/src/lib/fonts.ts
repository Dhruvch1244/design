export type FontOption = {
  id: string
  name: string
  stack: string
  sample: string
}

export const FONTS: FontOption[] = [
  {
    id: 'jetbrains',
    name: 'JetBrains Mono',
    stack: '"JetBrains Mono", ui-monospace, Consolas, monospace',
    sample: '=> != >= const',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    stack: '"Fira Code", ui-monospace, Consolas, monospace',
    sample: '=> != >= const',
  },
  {
    id: 'victor-mono',
    name: 'Victor Mono',
    stack: '"Victor Mono", ui-monospace, Consolas, monospace',
    sample: '=> != >= const',
  },
]

const STORAGE_KEY = 'devtools.font'

export function applyFont(id: string) {
  const font = FONTS.find((f) => f.id === id) ?? FONTS[0]
  document.documentElement.style.setProperty('--user-font-mono', font.stack)
  localStorage.setItem(STORAGE_KEY, font.id)
}

export function getStoredFont(): string {
  return localStorage.getItem(STORAGE_KEY) ?? FONTS[0].id
}
