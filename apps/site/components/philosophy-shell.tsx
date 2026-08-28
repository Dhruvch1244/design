import Link from "next/link";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { PHILOSOPHY_DOCS } from "@/lib/philosophy";

/**
 * Shared chrome for /philosophy and /philosophy/[slug]: the sticky
 * deep-dives sidebar plus the prose column, styled so the rendered
 * markdown's headings pick up the display serif instead of falling back to
 * Tailwind Typography's default sans stack.
 */
export function PhilosophyShell({
  activeSlug,
  html,
}: {
  activeSlug?: string;
  html: string;
}) {
  return (
    <div className="mx-auto flex max-w-5xl gap-16 px-6 pb-32">
      <aside className="hidden w-52 shrink-0 md:block">
        <div className="sticky top-28 space-y-6">
          <Eyebrow>Philosophy</Eyebrow>
          <nav className="flex flex-col gap-3 text-sm">
            <Link
              href="/philosophy"
              className={cn(
                "transition-colors duration-300 ease-fluid",
                !activeSlug ? "text-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Root file
            </Link>
            <div className="my-1 h-px bg-border" />
            {PHILOSOPHY_DOCS.map((doc) => (
              <Link
                key={doc.slug}
                href={`/philosophy/${doc.slug}`}
                className={cn(
                  "transition-colors duration-300 ease-fluid",
                  doc.slug === activeSlug
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {doc.title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <Reveal className="min-w-0 flex-1">
        <article
          className={cn(
            "prose prose-neutral max-w-none dark:prose-invert",
            "prose-headings:font-display prose-headings:italic prose-headings:tracking-tight",
            "prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl",
            "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
            "prose-strong:text-foreground prose-code:font-mono prose-code:text-sm",
            "prose-pre:rounded-2xl prose-pre:border prose-pre:border-border prose-pre:bg-card",
            "prose-blockquote:border-accent prose-blockquote:not-italic",
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Reveal>
    </div>
  );
}
