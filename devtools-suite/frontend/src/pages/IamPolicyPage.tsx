import { useMemo, useState } from 'react'
import { explainStatement, findOverBroadStatements, simulate, type IamPolicy } from '../lib/iamPolicy'
import { Panel, SectionLabel, ErrorBanner, Button } from '../components/ui'

const SAMPLE = `{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "AllowS3Read", "Effect": "Allow", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": "arn:aws:s3:::my-bucket/*" },
    { "Sid": "DenyDeletes", "Effect": "Deny", "Action": "s3:Delete*", "Resource": "*" }
  ]
}`

export function IamPolicyPage() {
  const [text, setText] = useState(SAMPLE)
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
      <Panel className="flex w-[28rem] shrink-0 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col p-4">
          <SectionLabel>Policy document</SectionLabel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[12.5px] text-ink outline-none focus:border-cyan/50"
          />
          {error && <ErrorBanner message={error} />}
        </div>
      </Panel>

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
