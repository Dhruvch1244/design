import { useState } from 'react'
import { inspectCert, type CertInfo } from '../lib/certApi'
import { Panel, SectionLabel, Button, ErrorBanner } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

export function CertInspectPage() {
  const [pem, setPem] = useState('')
  const [certs, setCerts] = useState<CertInfo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      setCerts(await inspectCert(pem))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decode failed')
      setCerts(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="cert-inspect"><Panel className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-3 p-4">
          <SectionLabel>Paste a PEM certificate (or chain)</SectionLabel>
          <textarea
            value={pem}
            onChange={(e) => setPem(e.target.value)}
            spellCheck={false}
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
            className="flex-1 resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[11.5px] text-ink outline-none focus:border-cyan/50"
          />
          <Button variant="primary" onClick={run} disabled={!pem.trim() || loading}>
            {loading ? 'Decoding…' : 'Decode'}
          </Button>
        </div>
      </Panel></ResizablePanel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {error && <ErrorBanner message={error} />}
          {!certs && !error && (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">Paste a certificate and decode it — nothing leaves your machine.</div>
          )}
          {certs && (
            <div className="flex flex-col gap-4">
              {certs.map((c, i) => (
                <div key={i} className={`rounded-2xl border p-4 ${c.expired ? 'border-rose/30 bg-rose/[0.06]' : c.daysUntilExpiry < 30 ? 'border-warm/30 bg-warm/[0.06]' : 'border-rule bg-panel'}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-mono text-xs text-ink-soft">{c.subject}</div>
                    <div className={`text-xs font-medium ${c.expired ? 'text-rose' : c.daysUntilExpiry < 30 ? 'text-warm' : 'text-emerald'}`}>
                      {c.expired ? 'EXPIRED' : `${c.daysUntilExpiry} days left`}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11.5px]">
                    <Field label="Issuer" value={c.issuer} />
                    <Field label="Serial" value={c.serialNumber} />
                    <Field label="Valid from" value={new Date(c.notBefore).toLocaleString()} />
                    <Field label="Valid until" value={new Date(c.notAfter).toLocaleString()} />
                    <Field label="Signature algo" value={c.signatureAlgorithm} />
                    <Field label="Public key" value={`${c.publicKeyAlgorithm}${c.publicKeySizeBits ? ` (${c.publicKeySizeBits} bit)` : ''}`} />
                  </div>
                  {c.subjectAlternativeNames.length > 0 && (
                    <div className="mt-2">
                      <div className="text-[10px] uppercase tracking-wide text-ink-faint">SAN</div>
                      <div className="font-mono text-[11px] text-ink-soft">{c.subjectAlternativeNames.join(', ')}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-ink-faint">{label}: </span>
      <span className="font-mono text-ink-soft">{value}</span>
    </div>
  )
}
