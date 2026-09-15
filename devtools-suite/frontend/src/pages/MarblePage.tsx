import { useMemo, useState } from 'react'
import {
  applyDelay,
  applyFilter,
  applyMap,
  applyMerge,
  applySkip,
  applyTake,
  parseMarbleDiagram,
  toMarbleDiagram,
  type MarbleEvent,
} from '../lib/marbles'
import { Panel, SectionLabel } from '../components/ui'

type Operator = 'map' | 'filter' | 'delay' | 'take' | 'skip' | 'merge'

const LENGTH = 24

export function MarblePage() {
  const [sourceA, setSourceA] = useState('-a-b-c-d-|')
  const [sourceB, setSourceB] = useState('--x---y--|')
  const [operator, setOperator] = useState<Operator>('map')
  const [expr, setExpr] = useState('x => x.toUpperCase()')
  const [n, setN] = useState(2)

  const eventsA = useMemo(() => parseMarbleDiagram(sourceA), [sourceA])
  const eventsB = useMemo(() => parseMarbleDiagram(sourceB), [sourceB])

  const output: MarbleEvent[] = useMemo(() => {
    switch (operator) {
      case 'map':
        return applyMap(eventsA, expr)
      case 'filter':
        return applyFilter(eventsA, expr)
      case 'delay':
        return applyDelay(eventsA, n)
      case 'take':
        return applyTake(eventsA, n)
      case 'skip':
        return applySkip(eventsA, n)
      case 'merge':
        return applyMerge(eventsA, eventsB)
    }
  }, [operator, eventsA, eventsB, expr, n])

  return (
    <div className="flex h-full flex-col gap-4">
      <Panel>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SectionLabel>Operator</SectionLabel>
          <select className="devtools-input w-40" value={operator} onChange={(e) => setOperator(e.target.value as Operator)}>
            <option value="map">map</option>
            <option value="filter">filter</option>
            <option value="delay">delay</option>
            <option value="take">take</option>
            <option value="skip">skip</option>
            <option value="merge">merge</option>
          </select>

          {(operator === 'map' || operator === 'filter') && (
            <input className="devtools-input w-64 font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="x => ..." />
          )}
          {(operator === 'delay' || operator === 'take' || operator === 'skip') && (
            <input type="number" className="devtools-input w-20" value={n} onChange={(e) => setN(Number(e.target.value) || 0)} />
          )}
        </div>
      </Panel>

      <Panel className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <Timeline label="Source A" diagram={sourceA} onChange={setSourceA} events={eventsA} editable />
          {operator === 'merge' && <Timeline label="Source B" diagram={sourceB} onChange={setSourceB} events={eventsB} editable />}
          <div className="border-t border-rule-soft" />
          <Timeline label={`Output — ${operator}(${operator === 'map' || operator === 'filter' ? expr : operator === 'merge' ? 'B' : n})`} diagram={toMarbleDiagram(output, LENGTH)} events={output} />
        </div>
      </Panel>
    </div>
  )
}

function Timeline({
  label,
  diagram,
  events,
  onChange,
  editable,
}: {
  label: string
  diagram: string
  events: MarbleEvent[]
  onChange?: (v: string) => void
  editable?: boolean
}) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      {editable && onChange && (
        <input
          className="devtools-input mb-2 w-full font-mono"
          value={diagram}
          onChange={(e) => onChange(e.target.value)}
          placeholder="-a-b-c-|  (letters=values, -=nothing, |=complete, #=error)"
        />
      )}
      <div className="relative flex h-10 items-center rounded-xl border border-rule bg-panel px-3">
        <div className="absolute left-3 right-3 h-px bg-rule" />
        {Array.from({ length: LENGTH }).map((_, frame) => {
          const event = events.find((e) => e.frame === frame)
          const x = (frame / (LENGTH - 1)) * 100
          if (!event) return null
          return (
            <div key={frame} className="absolute -translate-x-1/2" style={{ left: `${x}%` }}>
              {event.error ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose text-xs font-bold text-void">✕</div>
              ) : event.complete ? (
                <div className="h-6 w-1 rounded bg-ink-faint" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan font-mono text-xs font-bold text-void">
                  {event.value}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
