import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readPhilosophyMarkdown, renderMarkdown, findDocBySlug, PHILOSOPHY_DOCS } from "@/lib/philosophy";

export function generateStaticParams() {
  return PHILOSOPHY_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/philosophy/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = findDocBySlug(slug);
  return { title: doc ? `${doc.title} — dsgn` : "dsgn" };
}

export default async function PhilosophyDocPage({
  params,
}: PageProps<"/philosophy/[slug]">) {
  const { slug } = await params;
  const doc = findDocBySlug(slug);
  if (!doc) notFound();

  const markdown = await readPhilosophyMarkdown(doc.file);
  const html = await renderMarkdown(markdown);

  return (
    <div className="mx-auto flex max-w-5xl gap-12 px-6 py-12">
      <aside className="hidden w-48 shrink-0 md:block">
        <div className="sticky top-8 text-sm">
          <Link href="/philosophy" className="mb-4 block text-muted-foreground hover:text-foreground">
            &larr; Root file
          </Link>
          <div className="mb-2 font-medium text-foreground">Deep dives</div>
          <nav className="flex flex-col gap-2 text-muted-foreground">
            {PHILOSOPHY_DOCS.map((d) => (
              <Link
                key={d.slug}
                href={`/philosophy/${d.slug}`}
                className={d.slug === slug ? "text-foreground" : "hover:text-foreground"}
              >
                {d.title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <article
        className="prose prose-neutral dark:prose-invert max-w-none prose-pre:bg-muted"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
