export type Frame = { raw: string; className: string; isAppCode: boolean }
export type ExceptionBlock = { header: string; frames: Frame[]; causedByIndex: number | null }

const FRAME_RE = /^\s*at\s+([\w.$]+)\.[\w$<>]+\(([^)]*)\)/

/**
 * Splits a pasted stack trace into "Caused by" chains and classifies each frame's package as
 * app code vs framework noise, so the wall of Spring/Hibernate/reflection frames that usually
 * buries the three lines that matter can be collapsed by default.
 */
export function parseStackTrace(text: string, appPackagePrefixes: string[]): ExceptionBlock[] {
  const lines = text.split('\n')
  const blocks: ExceptionBlock[] = []
  let current: ExceptionBlock | null = null

  for (const line of lines) {
    if (FRAME_RE.test(line)) {
      if (!current) {
        current = { header: '(no exception header found before first frame)', frames: [], causedByIndex: null }
        blocks.push(current)
      }
      const m = FRAME_RE.exec(line)!
      const className = m[1]
      const isAppCode = appPackagePrefixes.some((p) => p && className.startsWith(p))
      current.frames.push({ raw: line.trim(), className, isAppCode })
    } else if (/^\s*Caused by:/.test(line)) {
      current = { header: line.trim(), frames: [], causedByIndex: blocks.length }
      blocks.push(current)
    } else if (/^\s*\.\.\.\s*\d+\s+more/.test(line)) {
      // "... N more" — collapsed shared-frame marker from the JVM itself; nothing to parse.
    } else if (line.trim() !== '' && !/^\s*Suppressed:/.test(line)) {
      if (current == null || current.frames.length > 0) {
        current = { header: line.trim(), frames: [], causedByIndex: null }
        blocks.push(current)
      } else {
        current.header = current.header === '' ? line.trim() : current.header + ' ' + line.trim()
      }
    }
  }

  return blocks
}

const DEFAULT_FRAMEWORK_PREFIXES = [
  'org.springframework', 'org.hibernate', 'org.apache.catalina', 'org.apache.tomcat',
  'org.apache.coyote', 'java.', 'javax.', 'jakarta.', 'jdk.internal', 'sun.reflect',
  'net.sf.cglib', 'org.springframework.cglib', 'com.sun.proxy',
]

export function isFrameworkNoise(className: string): boolean {
  return DEFAULT_FRAMEWORK_PREFIXES.some((p) => className.startsWith(p))
}
