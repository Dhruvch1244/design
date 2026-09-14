export type Statement = {
  Sid?: string
  Effect: 'Allow' | 'Deny'
  Action?: string | string[]
  NotAction?: string | string[]
  Resource?: string | string[]
  NotResource?: string | string[]
  Condition?: Record<string, unknown>
  Principal?: unknown
}

export type IamPolicy = { Version?: string; Statement: Statement[] }

function asArray(v: string | string[] | undefined): string[] {
  if (v === undefined) return []
  return Array.isArray(v) ? v : [v]
}

/** AWS IAM wildcards: '*' = any sequence, '?' = any single character. Not a general glob/regex. */
function wildcardToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')
  return new RegExp(`^${escaped}$`, 'i')
}

function matches(patterns: string[], value: string): boolean {
  return patterns.some((p) => wildcardToRegExp(p).test(value))
}

export function explainStatement(s: Statement): string {
  const actions = asArray(s.Action).join(', ') || (s.NotAction ? `anything except ${asArray(s.NotAction).join(', ')}` : 'no actions specified')
  const resources = asArray(s.Resource).join(', ') || (s.NotResource ? `anything except ${asArray(s.NotResource).join(', ')}` : 'no resources specified')
  const condition = s.Condition ? ` — only when ${Object.keys(s.Condition).join(', ')} ${JSON.stringify(Object.values(s.Condition)[0])}` : ''
  const verb = s.Effect === 'Deny' ? 'Denies' : 'Allows'
  return `${verb} ${actions} on ${resources}${condition}`
}

export type SimResult = { decision: 'ALLOWED' | 'DENIED'; reason: string; matchedStatements: string[] }

/**
 * Simplified IAM evaluation: an explicit Deny anywhere wins; otherwise at least one Allow must
 * match; otherwise the implicit default is Deny. Doesn't model SCPs, permission boundaries,
 * resource-based policy combination, or cross-account trust — this is for reasoning about one
 * policy document in isolation, the way you'd sanity-check it before attaching it.
 */
export function simulate(policy: IamPolicy, action: string, resource: string): SimResult {
  const matched: string[] = []
  let denied = false
  let allowed = false

  for (const [i, s] of policy.Statement.entries()) {
    const actionMatches = s.Action ? matches(asArray(s.Action), action) : s.NotAction ? !matches(asArray(s.NotAction), action) : false
    const resourceMatches = s.Resource ? matches(asArray(s.Resource), resource) : s.NotResource ? !matches(asArray(s.NotResource), resource) : false
    if (actionMatches && resourceMatches) {
      matched.push(s.Sid ?? `Statement[${i}]`)
      if (s.Effect === 'Deny') denied = true
      if (s.Effect === 'Allow') allowed = true
    }
  }

  if (denied) return { decision: 'DENIED', reason: 'An explicit Deny statement matches', matchedStatements: matched }
  if (allowed) return { decision: 'ALLOWED', reason: 'An Allow statement matches and nothing denies it', matchedStatements: matched }
  return { decision: 'DENIED', reason: 'No Allow statement matches — implicit deny (IAM default)', matchedStatements: matched }
}

export type Warning = { sid: string; message: string }

export function findOverBroadStatements(policy: IamPolicy): Warning[] {
  const warnings: Warning[] = []
  policy.Statement.forEach((s, i) => {
    if (s.Effect !== 'Allow') return
    const sid = s.Sid ?? `Statement[${i}]`
    const actions = asArray(s.Action)
    const resources = asArray(s.Resource)
    if (actions.includes('*')) warnings.push({ sid, message: 'Action "*" allows every action for this service/resource' })
    if (resources.includes('*')) warnings.push({ sid, message: 'Resource "*" applies to every resource, not just the intended one' })
    if (actions.includes('*') && resources.includes('*') && !s.Condition) {
      warnings.push({ sid, message: 'Action "*" + Resource "*" with no Condition — this is effectively full admin access' })
    }
  })
  return warnings
}
