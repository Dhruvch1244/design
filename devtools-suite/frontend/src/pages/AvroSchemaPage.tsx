import { useMemo, useState } from 'react'
import { avroToHiveDdl, checkBackwardCompatibility, validateAvroSchema, type AvroRecordSchema } from '../lib/avro'
import { Panel, SectionLabel, ErrorBanner, CopyButton } from '../components/ui'

const WRITER_SAMPLE = `{
  "type": "record",
  "name": "Order",
  "fields": [
    { "name": "id", "type": "int" },
    { "name": "total", "type": "float" },
    { "name": "status", "type": "string" }
  ]
}`

const READER_SAMPLE = `{
  "type": "record",
  "name": "Order",
  "fields": [
    { "name": "id", "type": "long" },
    { "name": "total", "type": "double" },
    { "name": "status", "type": "string" },
    { "name": "notes", "type": "string", "default": "" }
  ]
}`

function tryParse(text: string): { schema: AvroRecordSchema | null; errors: string[] } {
  if (!text.trim()) return { schema: null, errors: [] }
  try {
    const json = JSON.parse(text)
    const errors = validateAvroSchema(json)
    return { schema: errors.length === 0 ? (json as AvroRecordSchema) : null, errors }
  } catch (e) {
    return { schema: null, errors: [e instanceof Error ? e.message : 'Invalid JSON'] }
  }
}

export function AvroSchemaPage() {
  const [writerText, setWriterText] = useState(WRITER_SAMPLE)
  const [readerText, setReaderText] = useState(READER_SAMPLE)
  const [tableName, setTableName] = useState('orders')

  const writer = useMemo(() => tryParse(writerText), [writerText])
  const reader = useMemo(() => tryParse(readerText), [readerText])

  const compatIssues = useMemo(
    () => (writer.schema && reader.schema ? checkBackwardCompatibility(writer.schema, reader.schema) : []),
    [writer.schema, reader.schema]
  )

  const ddl = writer.schema ? avroToHiveDdl(writer.schema, tableName) : ''

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Writer schema (data already written)</SectionLabel>
            <textarea
              value={writerText}
              onChange={(e) => setWriterText(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[12.5px] text-ink outline-none focus:border-cyan/50"
            />
            {writer.errors.map((e, i) => <ErrorBanner key={i} message={e} />)}
          </div>
        </Panel>
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex flex-1 flex-col p-4">
            <SectionLabel>Reader schema (proposed new version)</SectionLabel>
            <textarea
              value={readerText}
              onChange={(e) => setReaderText(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none rounded-2xl border border-rule bg-void/70 p-3.5 font-mono text-[12.5px] text-ink outline-none focus:border-cyan/50"
            />
            {reader.errors.map((e, i) => <ErrorBanner key={i} message={e} />)}
          </div>
        </Panel>
      </div>

      <div className="grid max-h-64 grid-cols-2 gap-4">
        <Panel className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <SectionLabel>Backward compatibility (can the new reader decode old data?)</SectionLabel>
            {!writer.schema || !reader.schema ? (
              <div className="text-xs text-ink-faint">Fix schema errors above to check compatibility.</div>
            ) : compatIssues.length === 0 ? (
              <div className="text-sm text-emerald">Compatible — safe to deploy the new schema.</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {compatIssues.map((issue, i) => (
                  <div key={i} className="rounded-lg border border-rose/25 bg-rose/[0.06] px-2.5 py-1.5 text-xs">
                    <span className="font-mono text-rose">{issue.field}</span> — <span className="text-ink-soft">{issue.issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-2 flex items-center justify-between">
              <SectionLabel>Hive DDL from writer schema</SectionLabel>
              <div className="flex items-center gap-2">
                <input className="devtools-input w-32" value={tableName} onChange={(e) => setTableName(e.target.value)} />
                <CopyButton text={ddl} />
              </div>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[12px] text-ink-soft">{ddl || '—'}</pre>
          </div>
        </Panel>
      </div>
    </div>
  )
}
