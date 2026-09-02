import Image from "next/image";
import { Link } from "@/components/link";
import { Button } from "@/components/dsgn/button";
import { Badge } from "@/components/dsgn/badge";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { CursorGlow } from "@/components/motion/cursor-glow";
import { CopyButton } from "@/components/copy-button";
import { SHOWCASE_SITES } from "@/lib/showcase-sites";

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

const INSTALL_CMD = "npx @dhruvchoudhary/dsgn add button card";

// Excerpt only — the full prompt (verbatim, no edits) is in each showcase
// repo's README and first commit message, and in full on /showcase. This is
// a trimmed pull-quote for homepage space, not a verbatim requirement: the
// self-referential aside about screenshotting it for marketing is cut, and
// the sentence isn't left trailing off mid-thought.
const SHOWCASE_PROMPT_EXCERPT =
  "Build a standalone showcase/demo site that proves out dsgn — a real, " +
  "working example of what someone gets when they install it into a " +
  "fresh project. It needs to actually look good, not just function.";

// Real, live badge data — apps/site/scripts/generate-badge-data.mjs writes
// this from the actual registry item count at every build, so this markdown
// snippet can't drift the way a hardcoded stat already did once on this
// site (see /examples's Registry components stat fix).
const BADGE_MARKDOWN =
  "[![dsgn components](https://img.shields.io/endpoint?url=https://design.dhruvchoudhary.com/badge-data.json)](https://design.dhruvchoudhary.com/components)";
const RECIPES_BADGE_MARKDOWN =
  "[![dsgn recipes](https://img.shields.io/endpoint?url=https://design.dhruvchoudhary.com/badge-data-recipes.json)](https://design.dhruvchoudhary.com/examples)";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-32">
      <Reveal>
        <Link
          href="/skill"
          className="group mx-auto flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition-colors duration-300 ease-fluid hover:bg-accent/20"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          New — a Claude Code Agent Skill: 7 style agents, one router
          <span className="transition-transform duration-300 ease-fluid group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </Reveal>

      <CursorGlow className="grid gap-12 rounded-[2rem] py-16 sm:py-24 md:grid-cols-2 md:items-center">
        <Reveal>
          <Eyebrow>Philosophy · 001</Eyebrow>
          <h1 className="mt-6 font-display text-6xl uppercase leading-[0.95] tracking-wide sm:text-7xl">
            A fixed point
            <br />
            for design decisions.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Every rule here was extracted from a decision that actually shipped in a real app —
            named, with the file it lives in. Read it as a portable file any AI tool can load,
            hand it to Claude as a Skill, or install the components it produced with one command.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Button asChild variant="accent" size="lg" className="rounded-full px-7 shadow-glow">
                <Link href="/skill">Install the Skill</Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild variant="outline" size="lg" className="rounded-full px-7">
                <Link href="/philosophy">Read the philosophy</Link>
              </Button>
            </Magnetic>
          </div>
          <Link
            href="/components"
            className="mt-4 inline-block text-sm text-muted-foreground hover:text-accent hover:underline"
          >
            or browse components →
          </Link>
        </Reveal>

        <Reveal delay={150}>
          <Frame className="mx-auto max-w-sm">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-muted-foreground">terminal</p>
              <CopyButton text={INSTALL_CMD} />
            </div>
            <pre className="mt-3 overflow-x-auto font-mono text-sm text-accent">
              <code>$ {INSTALL_CMD}</code>
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
      </CursorGlow>

      <Reveal>
        <CursorGlow className="mt-8 rounded-[2rem] py-4">
          <Eyebrow>Built with dsgn, not just demoed with it</Eyebrow>
          <h2 className="mt-6 font-display text-3xl uppercase leading-tight tracking-wide sm:text-4xl">
            One prompt. A real app.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {SHOWCASE_SITES.length === 1
              ? `${SHOWCASE_SITES[0].name} — a genuine external project, installing this registry from npm like any other consumer, shipped from a single prompt to a design-focused Claude Code agent.`
              : `${SHOWCASE_SITES.length} genuine external projects, each installing this registry from npm like any other consumer, each shipped from one prompt to a design-focused Claude Code agent.`}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SHOWCASE_SITES.map((site) => (
              <Link key={site.slug} href={site.liveHref} className="group block">
                <Frame className="h-full overflow-hidden p-0" glow>
                  <div className="relative aspect-[8/5] w-full bg-muted">
                    <Image
                      src={site.screenshot}
                      alt={`${site.name} — ${site.tagline}`}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top transition-transform duration-500 ease-fluid group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-sm uppercase tracking-wide">{site.name}</p>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {site.voice}
                      </Badge>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                      {site.tagline}
                    </p>
                  </div>
                </Frame>
              </Link>
            ))}
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="font-mono text-xs text-muted-foreground">the prompt, in short</p>
              <blockquote className="mt-3 border-l-2 border-accent/40 pl-4 text-sm italic text-muted-foreground">
                &ldquo;{SHOWCASE_PROMPT_EXCERPT}&rdquo;
              </blockquote>
            </div>
            <Magnetic>
              <Button asChild variant="accent" className="rounded-full px-6">
                <Link href="/showcase">See the full prompts →</Link>
              </Button>
            </Magnetic>
          </div>
        </CursorGlow>
      </Reveal>

      <Reveal>
        <Frame glow={false} className="mt-4">
          <p className="text-sm font-medium">Embed the live component count</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Backed by the real registry — updates itself on every build, never a stale number.
          </p>
          <div className="relative mt-4">
            <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-14 font-mono text-xs text-accent">
              <code>{BADGE_MARKDOWN}</code>
            </pre>
            <div className="absolute right-3 top-3">
              <CopyButton text={BADGE_MARKDOWN} />
            </div>
          </div>
          <div className="relative mt-3">
            <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-14 font-mono text-xs text-accent">
              <code>{RECIPES_BADGE_MARKDOWN}</code>
            </pre>
            <div className="absolute right-3 top-3">
              <CopyButton text={RECIPES_BADGE_MARKDOWN} />
            </div>
          </div>
        </Frame>
      </Reveal>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-6">
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.title} delay={i * 60} className={pillar.span}>
            <Frame className="h-full">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-xl uppercase tracking-wide">{pillar.title}</h2>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{pillar.body}</p>
              <Link
                href={`/case-studies/${pillar.app}`}
                className="mt-5 inline-block font-mono text-[11px] uppercase tracking-[0.15em] text-accent hover:underline"
              >
                shipped in {pillar.app} →
              </Link>
            </Frame>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
