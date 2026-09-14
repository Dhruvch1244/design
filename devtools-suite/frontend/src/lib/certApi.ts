export type CertInfo = {
  subject: string
  issuer: string
  serialNumber: string
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  publicKeySizeBits: number | null
  notBefore: string
  notAfter: string
  expired: boolean
  daysUntilExpiry: number
  subjectAlternativeNames: string[]
}

export async function inspectCert(pem: string): Promise<CertInfo[]> {
  const res = await fetch('/api/certs/inspect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pem }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json()
}
