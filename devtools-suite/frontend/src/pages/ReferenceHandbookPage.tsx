import { useMemo, useState } from 'react'
import { octalToSymbolic, symbolicToOctal } from '../lib/chmod'
import { explainCommand, FLAG_REFERENCE, LINUX_RECIPES, searchLinuxReference } from '../lib/linuxCommands'
import { buildOrder, parseMakefile, resolveVariable } from '../lib/makefile'
import { explainGitCommand, GIT_RECIPES, searchGitReference } from '../lib/gitReference'
import { Panel, SectionLabel, ErrorBanner, CopyButton } from '../components/ui'
import { ResizablePanel } from '../components/ResizablePanel'

type MainTab = 'linux' | 'makefile' | 'git'

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'linux', label: 'Linux Commands' },
  { id: 'makefile', label: 'Makefile' },
  { id: 'git', label: 'Git' },
]

export function ReferenceHandbookPage() {
  const [mainTab, setMainTab] = useState<MainTab>('linux')

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex shrink-0 gap-1 self-start rounded-2xl border border-rule bg-panel p-1">
        {MAIN_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id)}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              mainTab === t.id ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {mainTab === 'linux' && <LinuxCommandsTab />}
        {mainTab === 'makefile' && <MakefileTab />}
        {mainTab === 'git' && <GitTab />}
      </div>
    </div>
  )
}

type LinuxSubTab = 'reference' | 'recipes' | 'explain' | 'chmod'

function LinuxCommandsTab() {
  const [tab, setTab] = useState<LinuxSubTab>('reference')
  const [query, setQuery] = useState('')

  const [octal, setOctal] = useState('755')
  const [symbolic, setSymbolic] = useState('rwxr-xr-x')
  const [octalError, setOctalError] = useState<string | null>(null)
  const [symbolicError, setSymbolicError] = useState<string | null>(null)

  const [explainInput, setExplainInput] = useState('find . -mtime -7 -type f -name "*.log"')
  const explained = explainCommand(explainInput)

  const filtered = useMemo(() => searchLinuxReference(query), [query])
  const filteredRecipes = useMemo(
    () =>
      query.trim()
        ? LINUX_RECIPES.filter(
            (r) => r.question.toLowerCase().includes(query.toLowerCase()) || r.command.toLowerCase().includes(query.toLowerCase())
          )
        : LINUX_RECIPES,
    [query]
  )

  function onOctalChange(v: string) {
    setOctal(v)
    try {
      setSymbolic(octalToSymbolic(v))
      setOctalError(null)
    } catch (e) {
      setOctalError(e instanceof Error ? e.message : 'Invalid')
    }
  }
  function onSymbolicChange(v: string) {
    setSymbolic(v)
    try {
      setOctal(symbolicToOctal(v))
      setSymbolicError(null)
    } catch (e) {
      setSymbolicError(e instanceof Error ? e.message : 'Invalid')
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex gap-1 rounded-2xl border border-rule bg-panel p-1">
          {(['reference', 'recipes', 'chmod', 'explain'] as LinuxSubTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-xs font-medium capitalize transition-colors ${
                tab === t ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
              }`}
            >
              {t === 'recipes' ? 'How do I…' : t}
            </button>
          ))}
        </div>
        {(tab === 'reference' || tab === 'recipes') && (
          <input
            className="devtools-input flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter (e.g. port, kill, tar, permissions)…"
          />
        )}
      </div>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {tab === 'reference' && (
            <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
              {filtered.map((cat) => (
                <div key={cat.category}>
                  <SectionLabel>{cat.category}</SectionLabel>
                  <div className="flex flex-col gap-1.5">
                    {cat.commands.map((c) => (
                      <div key={c.cmd} className="group rounded-lg border border-rule-soft bg-glass px-2.5 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-mono text-[11.5px] text-cyan">{c.cmd}</span>
                          <span className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                            <CopyButton text={c.cmd} label="" />
                          </span>
                        </div>
                        <div className="text-[11px] text-ink-faint">{c.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-sm text-ink-faint">No commands match "{query}"</div>}
            </div>
          )}

          {tab === 'recipes' && (
            <div className="flex flex-col gap-2">
              {filteredRecipes.map((r, i) => (
                <div key={i} className="rounded-xl border border-rule-soft bg-glass p-3">
                  <div className="mb-1 text-[13px] text-ink-soft">{r.question}</div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-panel px-2.5 py-1.5">
                    <span className="font-mono text-[12.5px] text-cyan">{r.command}</span>
                    <CopyButton text={r.command} label="" />
                  </div>
                  {r.note && <div className="mt-1 text-[10.5px] text-warm">{r.note}</div>}
                </div>
              ))}
              {filteredRecipes.length === 0 && <div className="text-sm text-ink-faint">No recipes match "{query}"</div>}
            </div>
          )}

          {tab === 'chmod' && (
            <div className="mx-auto flex max-w-md flex-col gap-3">
              <SectionLabel>chmod octal ↔ symbolic</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
                  Octal
                  <input className="devtools-input font-mono" value={octal} onChange={(e) => onOctalChange(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
                  Symbolic
                  <input className="devtools-input font-mono" value={symbolic} onChange={(e) => onSymbolicChange(e.target.value)} />
                </label>
              </div>
              {octalError && <ErrorBanner message={octalError} />}
              {symbolicError && <ErrorBanner message={symbolicError} />}
              <div className="rounded-xl border border-rule-soft bg-glass p-3 font-mono text-sm text-ink">
                chmod {octal} file  ⇔  -rw{symbolic.slice(1)} file
              </div>
            </div>
          )}

          {tab === 'explain' && (
            <div className="flex flex-col gap-3">
              <SectionLabel>Paste a command</SectionLabel>
              <input className="devtools-input font-mono" value={explainInput} onChange={(e) => setExplainInput(e.target.value)} />
              {explained.length === 0 ? (
                <div className="text-xs text-ink-faint">Supported: {Object.keys(FLAG_REFERENCE).join(', ')}</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {explained.map((d) => (
                    <div key={d.cmd} className="rounded-lg border border-rule-soft bg-glass px-2.5 py-1.5 text-xs">
                      <span className="font-mono text-cyan">{d.cmd}</span> — <span className="text-ink-soft">{d.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

const MAKEFILE_SAMPLE = `CC = gcc
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

function MakefileTab() {
  const [text, setText] = useState(MAKEFILE_SAMPLE)
  const parsed = useMemo(() => parseMakefile(text), [text])
  const targetNames = Array.from(parsed.targets.keys())
  const [selected, setSelected] = useState('all')

  const order = targetNames.includes(selected) ? buildOrder(selected, parsed.targets) : []

  return (
    <div className="flex h-full gap-4">
      <ResizablePanel storageKey="ref-handbook-makefile"><Panel className="flex h-full flex-col overflow-hidden">
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
                    selected === t ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
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
                      <div key={t} className="rounded-xl border border-rule-soft bg-glass p-3">
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

type GitSubTab = 'reference' | 'recipes' | 'explain'

function GitTab() {
  const [tab, setTab] = useState<GitSubTab>('reference')
  const [query, setQuery] = useState('')
  const [explainInput, setExplainInput] = useState('git rebase -i --autosquash HEAD~3')

  const filtered = useMemo(() => searchGitReference(query), [query])
  const filteredRecipes = useMemo(
    () =>
      query.trim()
        ? GIT_RECIPES.filter(
            (r) => r.question.toLowerCase().includes(query.toLowerCase()) || r.command.toLowerCase().includes(query.toLowerCase())
          )
        : GIT_RECIPES,
    [query]
  )
  const explained = explainGitCommand(explainInput)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex gap-1 rounded-2xl border border-rule bg-panel p-1">
          {(['reference', 'recipes', 'explain'] as GitSubTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-xs font-medium capitalize transition-colors ${
                tab === t ? 'bg-glass-strong text-ink' : 'text-ink-faint hover:text-ink-soft'
              }`}
            >
              {t === 'recipes' ? 'How do I…' : t}
            </button>
          ))}
        </div>
        {tab !== 'explain' && (
          <input
            className="devtools-input flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter (e.g. stash, squash, undo, rebase)…"
          />
        )}
      </div>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {tab === 'reference' && (
            <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
              {filtered.map((cat) => (
                <div key={cat.category}>
                  <SectionLabel>{cat.category}</SectionLabel>
                  <div className="flex flex-col gap-1.5">
                    {cat.commands.map((c) => (
                      <div key={c.cmd} className="group rounded-lg border border-rule-soft bg-glass px-2.5 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-mono text-[11.5px] text-cyan">{c.cmd}</span>
                          <span className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                            <CopyButton text={c.cmd} label="" />
                          </span>
                        </div>
                        <div className="text-[11px] text-ink-faint">{c.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-sm text-ink-faint">No commands match "{query}"</div>}
            </div>
          )}

          {tab === 'recipes' && (
            <div className="flex flex-col gap-2">
              {filteredRecipes.map((r, i) => (
                <div key={i} className="rounded-xl border border-rule-soft bg-glass p-3">
                  <div className="mb-1 text-[13px] text-ink-soft">{r.question}</div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-panel px-2.5 py-1.5">
                    <span className="font-mono text-[12.5px] text-cyan">{r.command}</span>
                    <CopyButton text={r.command} label="" />
                  </div>
                  {r.note && <div className="mt-1 text-[10.5px] text-warm">{r.note}</div>}
                </div>
              ))}
              {filteredRecipes.length === 0 && <div className="text-sm text-ink-faint">No recipes match "{query}"</div>}
            </div>
          )}

          {tab === 'explain' && (
            <div className="flex flex-col gap-3">
              <SectionLabel>Paste a git command</SectionLabel>
              <input
                className="devtools-input font-mono"
                value={explainInput}
                onChange={(e) => setExplainInput(e.target.value)}
              />
              {explained.length === 0 ? (
                <div className="text-xs text-ink-faint">
                  Supported subcommands: commit, checkout, branch, rebase, reset, log, diff, push, stash, merge,
                  cherry-pick, tag, clone
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {explained.map((d) => (
                    <div key={d.cmd} className="rounded-lg border border-rule-soft bg-glass px-2.5 py-1.5 text-xs">
                      <span className="font-mono text-cyan">{d.cmd}</span> — <span className="text-ink-soft">{d.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
