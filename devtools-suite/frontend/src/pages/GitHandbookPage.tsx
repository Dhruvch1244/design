import { useMemo, useState } from 'react'
import { explainGitCommand, GIT_RECIPES, searchGitReference } from '../lib/gitReference'
import { Panel, SectionLabel, CopyButton } from '../components/ui'

type Tab = 'reference' | 'recipes' | 'explain'

export function GitHandbookPage() {
  const [tab, setTab] = useState<Tab>('reference')
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
      <div className="flex items-center gap-3">
        <div className="flex gap-1 rounded-2xl border border-rule bg-void/70 p-1">
          {(['reference', 'recipes', 'explain'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-xs font-medium capitalize transition-colors ${
                tab === t ? 'bg-white/[0.08] text-ink' : 'text-ink-faint hover:text-ink-soft'
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
                      <div key={c.cmd} className="group rounded-lg border border-rule-soft bg-white/[0.02] px-2.5 py-1.5">
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
                <div key={i} className="rounded-xl border border-rule-soft bg-white/[0.02] p-3">
                  <div className="mb-1 text-[13px] text-ink-soft">{r.question}</div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-void/70 px-2.5 py-1.5">
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
                  Supported subcommands: commit, checkout, branch, rebase, reset, log, diff, push, stash
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {explained.map((d) => (
                    <div key={d.cmd} className="rounded-lg border border-rule-soft bg-white/[0.02] px-2.5 py-1.5 text-xs">
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
