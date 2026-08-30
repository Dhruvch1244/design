import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/components/link";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { CopyButton } from "@/components/copy-button";
import { COMPONENTS_DATA } from "@/lib/components-data";
import { COMPONENT_DEMOS } from "@/components/component-demos";

export function generateStaticParams() {
  return COMPONENTS_DATA.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/components/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = COMPONENTS_DATA.find((c) => c.slug === slug);
  return {
    title: entry ? `${entry.title} — Components — Dhruv Choudhary` : "Dhruv Choudhary",
    description: entry?.description,
  };
}

function InstallCommand({ name }: { name: string }) {
  const cmd = `npx @dhruvchoudhary/dsgn add ${name}`;
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-glass px-5 py-2.5 backdrop-blur-xl">
      <pre className="overflow-x-auto font-mono text-sm text-accent">
        <code>$ {cmd}</code>
      </pre>
      <CopyButton text={cmd} />
    </div>
  );
}

export default async function ComponentDetailPage({
  params,
}: PageProps<"/components/[slug]">) {
  const { slug } = await params;
  const entry = COMPONENTS_DATA.find((c) => c.slug === slug);
  const Demo = COMPONENT_DEMOS[slug];
  if (!entry || !Demo) notFound();

  const index = COMPONENTS_DATA.findIndex((c) => c.slug === slug);
  const prev = index > 0 ? COMPONENTS_DATA[index - 1] : null;
  const next = index < COMPONENTS_DATA.length - 1 ? COMPONENTS_DATA[index + 1] : null;

  return (
    <div className="space-y-8">
      <Reveal>
        <Eyebrow>
          <Link href="/components" className="hover:text-accent">
            Components
          </Link>{" "}
          · {entry.title}
        </Eyebrow>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">{entry.title}</h1>
          <InstallCommand name={entry.slug} />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">{entry.description}</p>
      </Reveal>

      <Reveal delay={80}>
        <Demo />
      </Reveal>

      <nav className="flex items-center justify-between border-t border-border pt-6 text-sm">
        {prev ? (
          <Link href={`/components/${prev.slug}`} className="text-muted-foreground hover:text-accent">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/components/${next.slug}`} className="text-muted-foreground hover:text-accent">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
