import { useMemo, useState } from 'react'
import { md5 } from '../lib/md5'
import { Panel, SectionLabel, CopyButton, ErrorBanner, Button } from '../components/ui'

type Mode = 'base64' | 'url' | 'html' | 'hex' | 'jwt' | 'hash'

const MODES: { id: Mode; label: string }[] = [
  { id: 'base64', label: 'Base64' },
  { id: 'url', label: 'URL' },
  { id: 'html', label: 'HTML Entities' },
  { id: 'hex', label: 'Hex' },
  { id: 'jwt', label: 'JWT Decode' },
  { id: 'hash', label: 'Hash / HMAC' },
]

function encodeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
function decodeHtml(s: string) {
  const el = document.createElement('textarea')
  el.innerHTML = s
  return el.value
}
function toHex(s: string) {
  return Array.from(new TextEncoder().encode(s)).map((b) => b.toString(16).padStart(2, '0')).join(' ')
}
function fromHex(s: string) {
  const bytes = s.trim().split(/\s+/).filter(Boolean).map((h) => parseInt(h, 16))
  return new TextDecoder().decode(new Uint8Array(bytes))
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=')
  return decodeURIComponent(escape(atob(padded)))
}

async function digestHex(algo: string, text: string): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmacHex(algo: string, key: string, text: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: algo }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(text))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function EncodeDecodePage() {
  const [mode, setMode] = useState<Mode>('base64')
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const encoded = useMemo(() => {
    try {
      setError(null)
      if (mode === 'base64') return btoa(unescape(encodeURIComponent(input)))
      if (mode === 'url') return encodeURIComponent(input)
      if (mode === 'html') return encodeHtml(input)
      if (mode === 'hex') return toHex(input)
      return ''
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Encode failed')
      return ''
    }
  }, [mode, input])

  const decoded = useMemo(() => {
    try {
      if (mode === 'base64') return decodeURIComponent(escape(atob(input)))
      if (mode === 'url') return decodeURIComponent(input)
      if (mode === 'html') return decodeHtml(input)
      if (mode === 'hex') return fromHex(input)
      return ''
    } catch {
      return '(invalid input for decoding)'
    }
  }, [mode, input])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex gap-1 rounded-2xl border border-rule bg-void/70 p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 rounded-xl py-2 text-xs font-medium transition-colors ${
              mode === m.id ? 'bg-white/[0.08] text-ink' : 'text-ink-faint hover:text-ink-soft'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      {mode === 'jwt' ? (
        <JwtDecoder />
      ) : mode === 'hash' ? (
        <HashPanel />
      ) : (
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
          <Panel className="flex flex-col overflow-hidden">
            <div className="flex flex-1 flex-col p-4">
              <SectionLabel>Input</SectionLabel>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] text-ink outline-none focus:border-cyan/50"
              />
            </div>
          </Panel>
          <div className="flex flex-col gap-4 overflow-hidden">
            <Panel className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center justify-between">
                  <SectionLabel>Encoded</SectionLabel>
                  <CopyButton text={encoded} />
                </div>
                <textarea readOnly value={encoded} spellCheck={false} className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] text-ink outline-none" />
              </div>
            </Panel>
            <Panel className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center justify-between">
                  <SectionLabel>Decoded (treats input as encoded)</SectionLabel>
                  <CopyButton text={decoded} />
                </div>
                <textarea readOnly value={decoded} spellCheck={false} className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] text-ink outline-none" />
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  )
}

function JwtDecoder() {
  const [token, setToken] = useState('')
  const parts = token.split('.')

  let header: unknown = null
  let payload: unknown = null
  let parseError: string | null = null
  try {
    if (parts.length >= 2) {
      header = JSON.parse(base64UrlDecode(parts[0]))
      payload = JSON.parse(base64UrlDecode(parts[1]))
    }
  } catch (e) {
    parseError = 'Could not decode — not a valid JWT'
  }

  const exp = (payload as Record<string, unknown> | null)?.exp
  const expired = typeof exp === 'number' && exp * 1000 < Date.now()

  return (
    <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
      <Panel className="flex flex-col overflow-hidden">
        <div className="flex flex-1 flex-col p-4">
          <SectionLabel>Token</SectionLabel>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            spellCheck={false}
            placeholder="eyJhbGciOiJI..."
            className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] text-ink outline-none focus:border-cyan/50"
          />
          <div className="mt-2 text-[11px] text-ink-faint">
            Decodes header + payload only — signature is not verified (no secret is entered here).
          </div>
        </div>
      </Panel>
      <div className="flex flex-col gap-4 overflow-hidden">
        {parseError && <ErrorBanner message={parseError} />}
        <Panel className="flex flex-col overflow-hidden">
          <div className="p-4">
            <SectionLabel>Header</SectionLabel>
            <pre className="max-h-48 overflow-auto rounded-2xl border border-rule bg-void/70 p-3 font-mono text-[12.5px] text-ink">
              {header ? JSON.stringify(header, null, 2) : '—'}
            </pre>
          </div>
        </Panel>
        <Panel className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Payload</SectionLabel>
            <pre className="flex-1 overflow-auto rounded-2xl border border-rule bg-void/70 p-3 font-mono text-[12.5px] text-ink">
              {payload ? JSON.stringify(payload, null, 2) : '—'}
            </pre>
            {typeof exp === 'number' && (
              <div className={`mt-2 text-xs ${expired ? 'text-rose' : 'text-emerald'}`}>
                {expired ? 'Expired' : 'Valid'} — exp {new Date(exp * 1000).toLocaleString()}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function HashPanel() {
  const [text, setText] = useState('')
  const [key, setKey] = useState('')
  const [results, setResults] = useState<Record<string, string>>({})

  async function compute() {
    const out: Record<string, string> = { MD5: md5(text) }
    for (const [label, algo] of [['SHA-1', 'SHA-1'], ['SHA-256', 'SHA-256'], ['SHA-384', 'SHA-384'], ['SHA-512', 'SHA-512']] as const) {
      out[label] = await digestHex(algo, text)
    }
    if (key.trim()) {
      out['HMAC-SHA256'] = await hmacHex('SHA-256', key, text)
    }
    setResults(out)
  }

  return (
    <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
      <Panel className="flex flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-3 p-4">
          <SectionLabel>Text</SectionLabel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[13px] text-ink outline-none focus:border-cyan/50"
          />
          <SectionLabel>HMAC key (optional)</SectionLabel>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="devtools-input"
            placeholder="leave blank to skip HMAC"
          />
          <Button variant="primary" onClick={compute}>
            Compute
          </Button>
        </div>
      </Panel>
      <Panel className="flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <SectionLabel>Digests</SectionLabel>
          {Object.keys(results).length === 0 ? (
            <div className="text-xs text-ink-faint">Enter text and hit Compute.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {Object.entries(results).map(([label, value]) => (
                <div key={label} className="rounded-xl border border-rule-soft bg-white/[0.02] p-2.5">
                  <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-ink-faint">
                    {label}
                    <CopyButton text={value} />
                  </div>
                  <div className="break-all font-mono text-[11.5px] text-ink">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
