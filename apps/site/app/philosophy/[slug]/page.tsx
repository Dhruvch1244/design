import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readPhilosophyMarkdown, renderMarkdown, findDocBySlug, PHILOSOPHY_DOCS } from "@/lib/philosophy";
import { PhilosophyShell } from "@/components/philosophy-shell";

export function generateStaticParams() {
  return PHILOSOPHY_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/philosophy/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = findDocBySlug(slug);
  return { title: doc ? `${doc.title} — Dhruv Choudhary` : "Dhruv Choudhary" };
}

export default async function PhilosophyDocPage({
  params,
}: PageProps<"/philosophy/[slug]">) {
  const { slug } = await params;
  const doc = findDocBySlug(slug);
  if (!doc) notFound();

  const markdown = await readPhilosophyMarkdown(doc.file);
  const { html, toc } = await renderMarkdown(markdown);

  return <PhilosophyShell activeSlug={slug} html={html} toc={toc} />;
}
