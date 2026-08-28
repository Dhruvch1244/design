import Link from "next/link";
import type { Metadata } from "next";
import { readPhilosophyMarkdown, renderMarkdown, PHILOSOPHY_DOCS } from "@/lib/philosophy";

export const metadata: Metadata = {
  title: "Philosophy — dsgn",
  description: "The portable, cross-AI design philosophy root file.",
};

export default async function PhilosophyIndexPage() {
  const markdown = await readPhilosophyMarkdown("AGENTS.md");
  const html = await renderMarkdown(markdown);

  return (
    <div className="mx-auto flex max-w-5xl gap-12 px-6 py-12">
      <aside className="hidden w-48 shrink-0 md:block">
        <div className="sticky top-8 text-sm">
          <div className="mb-2 font-medium text-foreground">Deep dives</div>
          <nav className="flex flex-col gap-2 text-muted-foreground">
            {PHILOSOPHY_DOCS.map((doc) => (
              <Link key={doc.slug} href={`/philosophy/${doc.slug}`} className="hover:text-foreground">
                {doc.title}
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
