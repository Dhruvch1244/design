/** arn:partition:service:region:account-id:resource — the last segment varies by service:
 *  resource-type/resource-id, resource-type:resource-id, or just resource-id. */
export type ParsedArn = {
  partition: string
  service: string
  region: string
  accountId: string
  resourceType: string | null
  resourceId: string
  /** '/' and ':' are both valid AWS separators (e.g. Lambda accepts either) — kept so rebuild round-trips exactly. */
  resourceSeparator: '/' | ':'
}

export function parseArn(arn: string): ParsedArn | null {
  const parts = arn.trim().split(':')
  if (parts.length < 6 || parts[0] !== 'arn') return null
  const [, partition, service, region, accountId, ...rest] = parts
  const resourcePart = rest.join(':')

  const slashIdx = resourcePart.indexOf('/')
  const colonIdx = resourcePart.indexOf(':')
  let resourceType: string | null = null
  let resourceId = resourcePart
  let resourceSeparator: '/' | ':' = '/'

  // Whichever delimiter appears first is the one actually separating type from id.
  const firstIdx = [slashIdx, colonIdx].filter((i) => i !== -1).sort((a, b) => a - b)[0]
  if (firstIdx !== undefined) {
    resourceSeparator = resourcePart[firstIdx] as '/' | ':'
    resourceType = resourcePart.slice(0, firstIdx)
    resourceId = resourcePart.slice(firstIdx + 1)
  }

  return { partition, service, region, accountId, resourceType, resourceId, resourceSeparator }
}

export function buildArn(parts: ParsedArn): string {
  const resource = parts.resourceType ? `${parts.resourceType}${parts.resourceSeparator}${parts.resourceId}` : parts.resourceId
  return `arn:${parts.partition}:${parts.service}:${parts.region}:${parts.accountId}:${resource}`
}

export function consoleUrl(parsed: ParsedArn): string | null {
  const { service, region, resourceType, resourceId } = parsed
  if (service === 's3') return `https://s3.console.aws.amazon.com/s3/buckets/${resourceId.split('/')[0]}`
  if (service === 'lambda' && resourceType === 'function') return `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${resourceId}`
  if (service === 'iam' && resourceType === 'role') return `https://console.aws.amazon.com/iam/home#/roles/${resourceId}`
  if (service === 'sqs') return `https://${region}.console.aws.amazon.com/sqs/v2/home?region=${region}#/queues`
  if (service === 'sns' && resourceType === undefined) return `https://${region}.console.aws.amazon.com/sns/v3/home?region=${region}#/topics`
  return null
}
