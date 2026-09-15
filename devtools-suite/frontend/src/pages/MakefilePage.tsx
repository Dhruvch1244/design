import { useMemo, useState } from 'react'
import { buildOrder, parseMakefile, resolveVariable } from '../lib/makefile'
import { Panel, SectionLabel, ErrorBanner } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

const SAMPLE = `CC = gcc
CFLAGS := -Wall -O2
BIN ?= app

.PHONY: all clean test

all: build test

build: main.o utils.o
\t$(CC) $(CFLAGS) -o $(BIN) main.o utils.o

main.o: main.c
\t$(CC) $(CFLAGS) -c main.c

utils.o: utils.c
\t$(CC) $(CFLAGS) -c utils.c

test: build
\t./$(BIN) --test

clean:
\trm -f *.o $(BIN)
`

export function MakefilePage() {
  const [text, setText] = useState(SAMPLE)
  const parsed = useMemo(() => parseMakefile(text), [text])
  const targetNames = Array.from(parsed.targets.keys())
  const [selected, setSelected] = useState('all')

  const order = targetNames.includes(selected) ? buildOrder(selected, parsed.targets) : []

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="makefile"><Panel className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-1 flex-col p-4">
          <SectionLabel>Paste a Makefile (tabs required for recipe lines)</SectionLabel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none rounded-2xl border border-rule bg-panel p-3.5 font-mono text-[12px] leading-relaxed text-ink outline-none focus:border-cyan/50"
          />
        </div>
      </Panel></ResizablePanel>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <Panel>
          <div className="flex flex-wrap items-center gap-2 p-4">
            <SectionLabel>make</SectionLabel>
            {targetNames.length === 0 ? (
              <ErrorBanner message="No targets found — check the Makefile syntax (recipe lines must start with a real tab)." />
            ) : (
              targetNames.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelected(t)}
                  className={`rounded-full px-3 py-1 text-xs font-mono transition-colors ${
                    selected === t ? 'bg-white/[0.08] text-ink' : 'text-ink-faint hover:text-ink-soft'
                  } ${parsed.phony.has(t) ? 'ring-1 ring-cyan/30' : ''}`}
                  title={parsed.phony.has(t) ? 'declared .PHONY' : undefined}
                >
                  {t}
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            {order.length === 0 ? (
              <div className="text-sm text-ink-faint">Pick a target to see its build order and recipe.</div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-ink-faint">
                    Build order for <span className="font-mono text-cyan">make {selected}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 font-mono text-xs text-ink-soft">
                    {order.map((t, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className={parsed.targets.has(t) ? '' : 'italic text-ink-faint'}>{t}</span>
                        {i < order.length - 1 && <span className="text-ink-faint">→</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {order.filter((t) => parsed.targets.has(t)).map((t) => {
                    const target = parsed.targets.get(t)!
                    return (
                      <div key={t} className="rounded-xl border border-rule-soft bg-white/[0.02] p-3">
                        <div className="mb-1 font-mono text-xs text-cyan">
                          {t}{target.prerequisites.length > 0 && <span className="text-ink-faint">: {target.prerequisites.join(' ')}</span>}
                        </div>
                        {target.recipe.map((line, i) => (
                          <div key={i} className="font-mono text-[11.5px] text-ink-soft">$ {resolveVariable(line, parsed.variables)}</div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}
