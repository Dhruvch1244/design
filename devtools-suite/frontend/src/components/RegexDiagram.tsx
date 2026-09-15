import { shorthandLabel, type RegexNode } from '../lib/regexAst'

const Rail = ({ node }: { node: RegexNode }) => {
  switch (node.type) {
    case 'seq':
      return (
        <div className="flex items-center">
          {node.items.map((item, i) => (
            <div key={i} className="flex items-center">
              {i > 0 && <div className="h-[1.5px] w-3 bg-ink-faint" />}
              <Rail node={item} />
            </div>
          ))}
        </div>
      )

    case 'lit':
      return (
        <span className="rounded-md border border-rule bg-panel px-2 py-1 font-mono text-[12px] text-ink">
          {node.text}
        </span>
      )

    case 'class':
      return (
        <span className="rounded-md border border-warm/40 bg-warm/[0.08] px-2 py-1 font-mono text-[12px] text-warm">
          {node.text}
        </span>
      )

    case 'shorthand':
      return (
        <span className="flex flex-col items-center rounded-md border border-violet/40 bg-violet/[0.08] px-2 py-1 text-center">
          <span className="font-mono text-[12px] text-violet">{node.text}</span>
          <span className="text-[9px] text-ink-faint">{shorthandLabel(node.text)}</span>
        </span>
      )

    case 'dot':
      return (
        <span className="flex flex-col items-center rounded-md border border-rule bg-panel px-2 py-1 text-center">
          <span className="font-mono text-[12px] text-ink">.</span>
          <span className="text-[9px] text-ink-faint">any char</span>
        </span>
      )

    case 'anchor':
      return (
        <span className="rounded-full border border-emerald/40 bg-emerald/[0.1] px-2.5 py-1 text-[10.5px] text-emerald">
          {node.text}
        </span>
      )

    case 'group':
      return (
        <div className="flex flex-col items-start gap-1 rounded-xl border border-cyan/30 bg-cyan/[0.04] p-2">
          <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-cyan">{node.label}</span>
          <Rail node={node.inner} />
        </div>
      )

    case 'quant':
      return (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-warm/40 bg-warm/[0.04] p-2">
          <span className="rounded-full bg-warm/15 px-2 py-0.5 text-[9.5px] font-medium text-warm">× {node.label}</span>
          <Rail node={node.inner} />
        </div>
      )

    case 'alt':
      return (
        <div className="flex flex-col gap-1.5 rounded-xl border border-rose/30 bg-rose/[0.04] p-2">
          <span className="rounded-full bg-rose/15 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-rose self-start">one of</span>
          {node.branches.map((b, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] text-ink-faint">{i + 1}.</span>
              <Rail node={b} />
            </div>
          ))}
        </div>
      )
  }
}

export function RegexDiagram({ node }: { node: RegexNode }) {
  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="flex items-center gap-2 rounded-2xl border border-rule bg-panel p-4">
        <span className="rounded-full border border-rule px-2 py-1 text-[10px] text-ink-faint">start</span>
        <div className="h-[1.5px] w-4 bg-ink-faint" />
        <Rail node={node} />
        <div className="h-[1.5px] w-4 bg-ink-faint" />
        <span className="rounded-full border border-rule px-2 py-1 text-[10px] text-ink-faint">end</span>
      </div>
    </div>
  )
}
