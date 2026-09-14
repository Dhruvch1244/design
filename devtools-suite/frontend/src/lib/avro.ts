export type AvroField = { name: string; type: unknown; default?: unknown }
export type AvroRecordSchema = { type: 'record'; name: string; fields: AvroField[] }

export function validateAvroSchema(json: unknown): string[] {
  const errors: string[] = []
  if (typeof json !== 'object' || json === null) {
    errors.push('Schema must be a JSON object')
    return errors
  }
  const schema = json as Record<string, unknown>
  if (schema.type !== 'record') {
    errors.push(`Root type must be "record", got "${String(schema.type)}"`)
    return errors
  }
  if (typeof schema.name !== 'string') errors.push('Missing "name"')
  if (!Array.isArray(schema.fields)) {
    errors.push('Missing "fields" array')
    return errors
  }
  const seen = new Set<string>()
  for (const [i, field] of (schema.fields as unknown[]).entries()) {
    if (typeof field !== 'object' || field === null) {
      errors.push(`fields[${i}] must be an object`)
      continue
    }
    const f = field as Record<string, unknown>
    if (typeof f.name !== 'string') errors.push(`fields[${i}] missing "name"`)
    else if (seen.has(f.name)) errors.push(`Duplicate field name "${f.name}"`)
    else seen.add(f.name)
    if (f.type === undefined) errors.push(`fields[${i}] ("${f.name}") missing "type"`)
  }
  return errors
}

function baseType(type: unknown): string {
  if (typeof type === 'string') return type
  if (Array.isArray(type)) return type.map(baseType).sort().join('|') // union
  if (typeof type === 'object' && type !== null) {
    const t = (type as Record<string, unknown>).type
    return typeof t === 'string' ? t : 'complex'
  }
  return 'unknown'
}

// Avro's numeric widening promotions: a reader using a wider type than the writer can still decode.
const PROMOTIONS: Record<string, string[]> = {
  int: ['int', 'long', 'float', 'double'],
  long: ['long', 'float', 'double'],
  float: ['float', 'double'],
  double: ['double'],
  string: ['string', 'bytes'],
  bytes: ['bytes', 'string'],
  boolean: ['boolean'],
}

function typesCompatible(writerType: unknown, readerType: unknown): boolean {
  const w = baseType(writerType)
  const r = baseType(readerType)
  if (w === r) return true
  return PROMOTIONS[w]?.includes(r) ?? false
}

export type CompatibilityIssue = { field: string; issue: string }

/**
 * Backward compatibility: can a reader using `readerSchema` decode data written with
 * `writerSchema`? This covers the practical cases Confluent Schema Registry actually blocks on —
 * added fields need a default, removed fields are fine, and type changes must be a valid Avro
 * promotion — not the complete Avro resolution spec (aliases, enum symbol changes, fixed size
 * changes aren't handled).
 */
export function checkBackwardCompatibility(writerSchema: AvroRecordSchema, readerSchema: AvroRecordSchema): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = []
  const writerFields = new Map(writerSchema.fields.map((f) => [f.name, f]))
  const readerFields = new Map(readerSchema.fields.map((f) => [f.name, f]))

  for (const [name, readerField] of readerFields) {
    const writerField = writerFields.get(name)
    if (!writerField) {
      if (readerField.default === undefined) {
        issues.push({ field: name, issue: 'New field has no default — old data missing this field can\'t be read' })
      }
      continue
    }
    if (!typesCompatible(writerField.type, readerField.type)) {
      issues.push({ field: name, issue: `Type changed from ${baseType(writerField.type)} to ${baseType(readerField.type)} — not a valid promotion` })
    }
  }
  return issues
}

const AVRO_TO_HIVE: Record<string, string> = {
  string: 'STRING', bytes: 'BINARY', int: 'INT', long: 'BIGINT',
  float: 'FLOAT', double: 'DOUBLE', boolean: 'BOOLEAN', null: 'VOID',
}

export function avroToHiveType(type: unknown): string {
  if (Array.isArray(type)) {
    const nonNull = type.find((t) => t !== 'null')
    return nonNull !== undefined ? avroToHiveType(nonNull) : 'VOID'
  }
  if (typeof type === 'object' && type !== null) {
    const t = type as Record<string, unknown>
    if (t.type === 'array') return `ARRAY<${avroToHiveType(t.items)}>`
    if (t.type === 'map') return `MAP<STRING, ${avroToHiveType(t.values)}>`
    if (t.type === 'record') return `STRUCT<${(t.fields as AvroField[]).map((f) => `${f.name}:${avroToHiveType(f.type)}`).join(', ')}>`
    if (t.type === 'enum') return 'STRING'
    if (t.type === 'fixed') return 'BINARY'
    return avroToHiveType(t.type)
  }
  return AVRO_TO_HIVE[String(type)] ?? 'STRING'
}

export function avroToHiveDdl(schema: AvroRecordSchema, tableName: string): string {
  const columns = schema.fields.map((f) => `  ${f.name} ${avroToHiveType(f.type)}`).join(',\n')
  return `CREATE TABLE ${tableName} (\n${columns}\n)\nSTORED AS PARQUET;`
}
