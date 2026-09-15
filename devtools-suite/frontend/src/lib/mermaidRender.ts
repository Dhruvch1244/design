import mermaid from 'mermaid'

let initializedScheme: 'dark' | 'light' | null = null

function ensureInit(scheme: 'dark' | 'light') {
  if (initializedScheme === scheme) return
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: scheme === 'dark' ? 'dark' : 'default',
    fontFamily: 'inherit',
  })
  initializedScheme = scheme
}

let counter = 0

export async function renderMermaid(code: string, scheme: 'dark' | 'light'): Promise<string> {
  ensureInit(scheme)
  const id = `mermaid-${Date.now()}-${counter++}`
  const { svg } = await mermaid.render(id, code)
  return svg
}
