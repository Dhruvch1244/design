export type JarSummary = {
  fileName: string
  entryCount: number
  totalUncompressedSize: number
  manifestMainAttributes: Record<string, string>
  classMajorVersions: Record<string, number>
}
export type DuplicateClass = { className: string; foundInJars: string[] }
export type JarInspectResponse = { jars: JarSummary[]; duplicateClasses: DuplicateClass[] }

export async function inspectJars(files: File[]): Promise<JarInspectResponse> {
  const form = new FormData()
  for (const f of files) form.append('files', f)
  const res = await fetch('/api/java/jar-inspect', { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json()
}
