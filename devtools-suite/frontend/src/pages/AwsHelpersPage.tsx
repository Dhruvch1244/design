import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { buildArn, consoleUrl, parseArn, type ParsedArn } from '../lib/arn'
import { explainStatement, findOverBroadStatements, simulate, type IamPolicy } from '../lib/iamPolicy'
import { inspectCert, type CertInfo } from '../lib/certApi'
import { Panel, SectionLabel, ErrorBanner, CopyButton, Button } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

type Tab = 'arn' | 'iam' | 'cert'

const TABS: { id: Tab; label: string }[] = [
  { id: 'arn', label: 'ARN' },
  { id: 'iam', label: 'IAM Policy' },
  { id: 'cert', label: 'Cert & Key' },
]

export function AwsHelpersPage() {
  const [tab, setTab] = useState<Tab>('arn')

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex w-fit gap-1 rounded-xl border border-rule bg-panel p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
              tab === t.id ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === 'arn' && <ArnTab />}
        {tab === 'iam' && <IamTab />}
        {tab === 'cert' && <CertTab />}
      </div>
    </div>
  )
}

function ArnTab() {
  const [arnText, setArnText] = useState('arn:aws:lambda:us-east-1:123456789012:function:my-function')

  const [parts, setParts] = useState<ParsedArn>({
    partition: 'aws', service: 's3', region: '', accountId: '123456789012',
    resourceType: null, resourceId: 'my-bucket', resourceSeparator: '/',
  })

  const parsed = useMemo(() => parseArn(arnText), [arnText])
  const built = buildArn(parts)

  return (
    <div className="grid h-full grid-cols-2 gap-4">
      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Parse an ARN</SectionLabel>
          <input className="devtools-input font-mono" value={arnText} onChange={(e) => setArnText(e.target.value)} />
          {!parsed ? (
            <ErrorBanner message="Not a valid ARN — expected arn:partition:service:region:account-id:resource" />
          ) : (
            <div className="flex flex-col gap-1.5 text-sm">
              {Object.entries(parsed).map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-lg bg-glass px-3 py-1.5">
                  <span className="text-ink-faint">{k}</span>
                  <span className="font-mono text-ink">{v === '' || v === null ? '—' : String(v)}</span>
                </div>
              ))}
              {consoleUrl(parsed) && (
                <a href={consoleUrl(parsed)!} target="_blank" rel="noreferrer" className="text-xs text-cyan hover:underline">
                  Open in AWS Console →
                </a>
              )}
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-3 p-4">
          <SectionLabel>Build an ARN</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <ArnField label="Partition">
              <input className="devtools-input" value={parts.partition} onChange={(e) => setParts({ ...parts, partition: e.target.value })} />
            </ArnField>
            <ArnField label="Service">
              <input className="devtools-input" value={parts.service} onChange={(e) => setParts({ ...parts, service: e.target.value })} />
            </ArnField>
            <ArnField label="Region">
              <input className="devtools-input" value={parts.region} onChange={(e) => setParts({ ...parts, region: e.target.value })} />
            </ArnField>
            <ArnField label="Account ID">
              <input className="devtools-input" value={parts.accountId} onChange={(e) => setParts({ ...parts, accountId: e.target.value })} />
            </ArnField>
            <ArnField label="Resource type (optional)">
              <input className="devtools-input" value={parts.resourceType ?? ''} onChange={(e) => setParts({ ...parts, resourceType: e.target.value || null })} />
            </ArnField>
            <ArnField label="Separator">
              <select className="devtools-input" value={parts.resourceSeparator} onChange={(e) => setParts({ ...parts, resourceSeparator: e.target.value as '/' | ':' })}>
                <option value="/">/</option>
                <option value=":">:</option>
              </select>
            </ArnField>
          </div>
          <ArnField label="Resource ID">
            <input className="devtools-input" value={parts.resourceId} onChange={(e) => setParts({ ...parts, resourceId: e.target.value })} />
          </ArnField>

          <div className="flex items-center justify-between rounded-xl border border-rule bg-panel px-3.5 py-2.5">
            <span className="font-mono text-sm text-ink">{built}</span>
            <CopyButton text={built} />
          </div>
        </div>
      </Panel>
    </div>
  )
}

function ArnField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-ink-faint">
      {label}
      {children}
    </label>
  )
}

const IAM_SAMPLE = `{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "AllowS3Read", "Effect": "Allow", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": "arn:aws:s3:::my-bucket/*" },
    { "Sid": "DenyDeletes", "Effect": "Deny", "Action": "s3:Delete*", "Resource": "*" }
  ]
}`

function IamTab() {
  const [text, setText] = useState(IAM_SAMPLE)
  const [action, setAction] = useState('s3:GetObject')
  const [resource, setResource] = useState('arn:aws:s3:::my-bucket/file.txt')
  const [simResult, setSimResult] = useState<ReturnType<typeof simulate> | null>(null)

  const { policy, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed.Statement)) throw new Error('Missing "Statement" array')
      return { policy: parsed as IamPolicy, error: null as string | null }
    } catch (e) {
      return { policy: null, error: e instanceof Error ? e.message : 'Invalid policy JSON' }
    }
  }, [text])

  const warnings = useMemo(() => (policy ? findOverBroadStatements(policy) : []), [policy])

  function runSim() {
    if (policy) setSimResult(simulate(policy, action, resource))
  }

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="aws-helpers-iam" defaultWidth={448}><Panel className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-1 flex-col p-4">
          <SectionLabel>Policy document</SectionLabel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[12.5px] text-ink outline-none focus:border-cyan/50"
          />
          {error && <ErrorBanner message={error} />}
        </div>
      </Panel></ResizablePanel>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <SectionLabel>In plain English</SectionLabel>
            {policy ? (
              <div className="flex flex-col gap-1.5">
                {policy.Statement.map((s, i) => (
                  <div key={i} className={`rounded-lg px-2.5 py-1.5 text-xs ${s.Effect === 'Deny' ? 'bg-rose/[0.06] text-rose' : 'bg-emerald/[0.06] text-emerald'}`}>
                    <span className="font-mono">{s.Sid ?? `Statement[${i}]`}</span>: {explainStatement(s)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-ink-faint">Fix the JSON to see a breakdown.</div>
            )}

            {warnings.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                <SectionLabel>Over-broad statements</SectionLabel>
                {warnings.map((w, i) => (
                  <div key={i} className="rounded-lg border border-warm/25 bg-warm/[0.06] px-2.5 py-1.5 text-xs text-warm">
                    <span className="font-mono">{w.sid}</span>: {w.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-3 p-4">
            <SectionLabel>Simulate: can a principal with this policy do X on Y?</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <input className="devtools-input font-mono" value={action} onChange={(e) => setAction(e.target.value)} placeholder="s3:GetObject" />
              <input className="devtools-input font-mono" value={resource} onChange={(e) => setResource(e.target.value)} placeholder="arn:aws:s3:::bucket/key" />
            </div>
            <Button variant="primary" onClick={runSim} disabled={!policy}>Simulate</Button>
            {simResult && (
              <div className={`rounded-xl border px-3.5 py-2.5 text-sm ${simResult.decision === 'ALLOWED' ? 'border-emerald/30 bg-emerald/[0.06] text-emerald' : 'border-rose/30 bg-rose/[0.06] text-rose'}`}>
                {simResult.decision} — {simResult.reason}
                {simResult.matchedStatements.length > 0 && (
                  <div className="mt-1 text-xs text-ink-faint">Matched: {simResult.matchedStatements.join(', ')}</div>
                )}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}

const CERT_DRAFT_KEY = 'devtools.cert-inspect-draft'

function CertTab() {
  const [pem, setPem] = useState(() => localStorage.getItem(CERT_DRAFT_KEY) ?? '')
  const [certs, setCerts] = useState<CertInfo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(CERT_DRAFT_KEY, pem), 400)
    return () => clearTimeout(t)
  }, [pem])

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
      <ResizablePanel storageKey="aws-helpers-cert"><Panel className="flex h-full flex-col overflow-hidden">
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
                    <CertField label="Issuer" value={c.issuer} />
                    <CertField label="Serial" value={c.serialNumber} />
                    <CertField label="Valid from" value={new Date(c.notBefore).toLocaleString()} />
                    <CertField label="Valid until" value={new Date(c.notAfter).toLocaleString()} />
                    <CertField label="Signature algo" value={c.signatureAlgorithm} />
                    <CertField label="Public key" value={`${c.publicKeyAlgorithm}${c.publicKeySizeBits ? ` (${c.publicKeySizeBits} bit)` : ''}`} />
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

function CertField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-ink-faint">{label}: </span>
      <span className="font-mono text-ink-soft">{value}</span>
    </div>
  )
}
