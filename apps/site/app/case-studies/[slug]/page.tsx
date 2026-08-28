import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { CopyButton } from "@/components/copy-button";
import { CASE_STUDIES, findCaseStudyBySlug } from "@/lib/case-studies";

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = findCaseStudyBySlug(slug);
  return { title: study ? `${study.name} — Dhruv Choudhary` : "Dhruv Choudhary" };
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const study = findCaseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 pb-32">
      <Reveal>
        <Link
          href="/case-studies"
          className="text-sm text-muted-foreground transition-colors duration-300 ease-fluid hover:text-accent"
        >
          ← All case studies
        </Link>
        <Eyebrow className="mt-6">{study.stack}</Eyebrow>
        <h1 className="mt-6 font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
          {study.name}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{study.tagline}</p>
        <a
          href={study.repo}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block font-mono text-sm text-accent hover:underline"
        >
          {study.repo.replace("https://", "")} ↗
        </a>
      </Reveal>

      <div className="mt-16 space-y-8">
        {study.sections.map((section, i) => (
          <Reveal key={section.heading} delay={i * 60}>
            <Frame glow={false}>
              <h2 className="font-display text-xl uppercase tracking-wide">{section.heading}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              {section.code && section.code.length > 0 && (
                <div className="mt-5 space-y-4">
                  {section.code.map((block, blockIndex) => (
                    <div key={blockIndex}>
                      <div className="mb-1.5 font-mono text-xs text-muted-foreground">{block.filename}</div>
                      <div className="relative">
                        <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
                          <code>{block.snippet}</code>
                        </pre>
                        <CopyButton text={block.snippet} className="absolute right-3 top-3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Frame>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
