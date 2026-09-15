import { useMemo, useState } from 'react'
import { buildArn, consoleUrl, parseArn, type ParsedArn } from '../lib/arn'
import { Panel, SectionLabel, ErrorBanner, CopyButton } from '../components/ui'

export function ArnToolPage() {
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
                <div key={k} className="flex justify-between rounded-lg bg-white/[0.02] px-3 py-1.5">
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
            <Field label="Partition">
              <input className="devtools-input" value={parts.partition} onChange={(e) => setParts({ ...parts, partition: e.target.value })} />
            </Field>
            <Field label="Service">
              <input className="devtools-input" value={parts.service} onChange={(e) => setParts({ ...parts, service: e.target.value })} />
            </Field>
            <Field label="Region">
              <input className="devtools-input" value={parts.region} onChange={(e) => setParts({ ...parts, region: e.target.value })} />
            </Field>
            <Field label="Account ID">
              <input className="devtools-input" value={parts.accountId} onChange={(e) => setParts({ ...parts, accountId: e.target.value })} />
            </Field>
            <Field label="Resource type (optional)">
              <input className="devtools-input" value={parts.resourceType ?? ''} onChange={(e) => setParts({ ...parts, resourceType: e.target.value || null })} />
            </Field>
            <Field label="Separator">
              <select className="devtools-input" value={parts.resourceSeparator} onChange={(e) => setParts({ ...parts, resourceSeparator: e.target.value as '/' | ':' })}>
                <option value="/">/</option>
                <option value=":">:</option>
              </select>
            </Field>
          </div>
          <Field label="Resource ID">
            <input className="devtools-input" value={parts.resourceId} onChange={(e) => setParts({ ...parts, resourceId: e.target.value })} />
          </Field>

          <div className="flex items-center justify-between rounded-xl border border-rule bg-panel px-3.5 py-2.5">
            <span className="font-mono text-sm text-ink">{built}</span>
            <CopyButton text={built} />
          </div>
        </div>
      </Panel>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-ink-faint">
      {label}
      {children}
    </label>
  )
}
