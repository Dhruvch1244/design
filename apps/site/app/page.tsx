import Link from "next/link";
import { Button } from "@/components/dsgn/button";
import { Badge } from "@/components/dsgn/badge";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";

const PILLARS = [
  {
    title: "Physical separation",
    body: "Logic that can't import your UI framework, enforced by the build — not a naming convention.",
    app: "lyric-viewer",
    span: "sm:col-span-4",
  },
  {
    title: "One scheduler",
    body: "Every background job goes through one deliberate engine, never an ad-hoc thread per call site.",
    app: "lyric-viewer",
    span: "sm:col-span-2",
  },
  {
    title: "Non-destructive by default",
    body: "Edits are an overlay over an untouched original. Undo is structural, not reconstructed.",
    app: "file-viewer",
    span: "sm:col-span-2",
  },
  {
    title: "Trust the data",
    body: "Gatekeep structure, never content. The user's data is the user's data.",
    app: "file-viewer",
    span: "sm:col-span-4",
  },
  {
    title: "Measure, don't guess",
    body: "Performance claims are proven against the real thing, under real load, more than once.",
    app: "lyric-viewer",
    span: "sm:col-span-3",
  },
  {
    title: "Idioms stay current",
    body: "Framework footguns from stale training data get written down with their exact failure mode.",
    app: "review-grader",
    span: "sm:col-span-3",
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-32">
      {/* Editorial split: massive display type on the left, a floating
          terminal "island" on the right instead of a hero image. */}
      <section className="grid gap-12 py-16 sm:py-24 md:grid-cols-2 md:items-center">
        <Reveal>
          <Eyebrow>Philosophy · 001</Eyebrow>
          <h1 className="mt-6 font-display text-5xl italic leading-[1.05] tracking-tight sm:text-6xl">
            A fixed point for design decisions.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Every rule here was extracted from a decision that actually shipped in a real app —
            named, with the commit it came from. Read it as a portable file any AI tool can load,
            or install the components it produced with one command.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild variant="accent" size="lg" className="rounded-full px-7">
              <Link href="/philosophy">Read the philosophy</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-7">
              <Link href="/components">Browse components</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <Frame className="mx-auto max-w-sm rotate-1 transition-transform duration-700 ease-fluid hover:rotate-0">
            <p className="font-mono text-xs text-muted-foreground">terminal</p>
            <pre className="mt-3 overflow-x-auto font-mono text-sm text-accent">
              <code>$ npx dsgn add button card</code>
            </pre>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="accent">non-destructive</Badge>
              <Badge variant="outline">copy, not a dependency</Badge>
              <Badge variant="outline">shadcn-style</Badge>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              The CLI copies component <em>source</em> into your project. You own the file the
              moment it lands — edit it freely, nothing to eject later.
            </p>
          </Frame>
        </Reveal>
      </section>

      {/* Asymmetric bento: the nine pillars don't all carry equal weight, so
          the grid doesn't pretend they do. */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.title} delay={i * 60} className={pillar.span}>
            <Frame className="h-full">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-xl italic">{pillar.title}</h2>
                <span className="font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{pillar.body}</p>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
                shipped in {pillar.app}
              </p>
            </Frame>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
