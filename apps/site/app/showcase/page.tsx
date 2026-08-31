import Image from "next/image";
import { Link } from "@/components/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { CursorGlow } from "@/components/motion/cursor-glow";
import { Badge } from "@/components/dsgn/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/dsgn/collapsible";
import { CopyButton } from "@/components/copy-button";
import { SHOWCASE_SITES } from "@/lib/showcase-sites";
import { SkillPromoBanner } from "@/components/skill-promo-banner";

export const metadata: Metadata = {
  title: "Showcase — Dhruv Choudhary",
  description:
    "Real, separately-built sites that install dsgn from npm like any other consumer — proof of what the registry produces in a fresh project, each one with the exact prompt that built it.",
};

export default function ShowcasePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-32">
      <div className="pt-6">
        <SkillPromoBanner />
      </div>
      <Reveal>
        <CursorGlow className="rounded-[2rem] py-4">
          <Eyebrow>Built with dsgn, not just demoed with it</Eyebrow>
          <h1 className="mt-6 max-w-2xl font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
            Real sites, one prompt each.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every site here is a genuine external project — scaffolded fresh, installing{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">@dhruvchoudhary/dsgn</code>{" "}
            from npm exactly like any other consumer would, not a page inside this site&apos;s
            own component gallery. Each one shipped from a single prompt to a design-focused
            Claude Code agent — the prompt is in the repo, verbatim, as the README and the first
            commit message. No real company names, logos, or copy anywhere: every product, org,
            and line of content is invented for the demo.
          </p>
        </CursorGlow>
      </Reveal>

      <section className="mt-16 grid gap-6 sm:grid-cols-2">
        {SHOWCASE_SITES.map((site, i) => (
          <Reveal key={site.slug} delay={i * 80}>
            <Frame className="flex h-full flex-col gap-4 p-0 overflow-hidden" glow>
              <Link href={site.liveHref} className="block">
                <div className="relative aspect-[8/5] w-full overflow-hidden border-b border-border bg-muted">
                  <Image
                    src={site.screenshot}
                    alt={`${site.name} — ${site.tagline}`}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top transition-transform duration-500 ease-fluid hover:scale-[1.02]"
                  />
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-4 p-6 pt-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl uppercase tracking-wide">{site.name}</h2>
                    <Badge variant="outline">{site.voice}</Badge>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    {site.org} · {site.category}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{site.tagline}</p>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
                  {site.componentCount} components installed
                </p>
                <div className="mt-auto flex flex-wrap gap-3 pt-2">
                  <Link
                    href={site.liveHref}
                    className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    View live →
                  </Link>
                  <a
                    href={site.repoHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Repo ↗
                  </a>
                </div>

                {/* Full prompt, verbatim, not an excerpt — the homepage
                    teaser only shows a few lines; this is the whole brief
                    that actually shipped the site, byte-for-byte identical
                    to the repo's own README and first commit message. */}
                <Collapsible className="border-t border-border pt-4">
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-left text-sm font-medium hover:text-accent">
                    View the full prompt
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4 shrink-0 transition-transform duration-300 [[data-state=open]_&]:rotate-180"
                    >
                      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="relative">
                      <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-card p-4 pr-14 font-mono text-xs leading-relaxed text-muted-foreground">
                        {site.prompt}
                      </pre>
                      <div className="absolute right-3 top-3">
                        <CopyButton text={site.prompt} />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </Frame>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
