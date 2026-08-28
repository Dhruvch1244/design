import { Link } from "@/components/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { CursorGlow } from "@/components/motion/cursor-glow";
import { CASE_STUDIES } from "@/lib/case-studies";
import { SkillPromoBanner } from "@/components/skill-promo-banner";

export const metadata: Metadata = {
  title: "Case studies — Dhruv Choudhary",
  description:
    "The three real, shipped apps every rule in the philosophy traces back to — the actual file, the actual decision.",
};

export default function CaseStudiesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-32">
      <div className="pt-6">
        <SkillPromoBanner />
      </div>
      <Reveal>
        <CursorGlow className="rounded-[2rem] py-4">
          <Eyebrow>Proof, not just labels</Eyebrow>
          <h1 className="mt-6 max-w-2xl font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
            Every pillar traces to one of these.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            The home page labels each pillar &ldquo;shipped in lyric-viewer&rdquo; or similar —
            this is the checkable version of that claim: the actual file, the actual decision,
            per app.
          </p>
        </CursorGlow>
      </Reveal>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {CASE_STUDIES.map((study, i) => (
          <Reveal key={study.slug} delay={i * 80}>
            <Link href={`/case-studies/${study.slug}`} className="block h-full">
              <Frame className="flex h-full flex-col justify-between transition-transform duration-500 ease-fluid hover:-translate-y-1">
                <div>
                  <h2 className="font-display text-xl uppercase tracking-wide">{study.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{study.tagline}</p>
                </div>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
                  {study.stack} →
                </p>
              </Frame>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
