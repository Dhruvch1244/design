import Link from "next/link";
import { Eyebrow } from "@/components/brand/eyebrow";
import { TableOfContents } from "@/components/table-of-contents";
import { cn } from "@/lib/utils";
import { PHILOSOPHY_DOCS } from "@/lib/philosophy";
import type { TocEntry } from "@/lib/philosophy";

const ALL_DOCS = [{ slug: undefined, title: "Root file" }, ...PHILOSOPHY_DOCS];

// Tailwind Typography ships its own hardcoded --tw-prose-* values and emits
// them after any @layer base override in the compiled CSS, so a stylesheet
// override silently loses the cascade (verified: both rules land in the
// output, Typography's plain-gray one comes second and wins). An inline
// style always beats a stylesheet rule, so that's how these are set instead
// of via a .prose class override in globals.css.
const PROSE_VARS = {
  "--tw-prose-body": "var(--foreground)",
  "--tw-prose-headings": "var(--foreground)",
  "--tw-prose-lead": "var(--muted-foreground)",
  "--tw-prose-links": "var(--accent)",
  "--tw-prose-bold": "var(--foreground)",
  "--tw-prose-counters": "var(--muted-foreground)",
  "--tw-prose-bullets": "var(--border)",
  "--tw-prose-hr": "var(--border)",
  "--tw-prose-quotes": "var(--foreground)",
  "--tw-prose-quote-borders": "var(--accent)",
  "--tw-prose-captions": "var(--muted-foreground)",
  "--tw-prose-code": "var(--foreground)",
  "--tw-prose-pre-code": "var(--foreground)",
  "--tw-prose-pre-bg": "var(--card)",
  "--tw-prose-th-borders": "var(--border)",
  "--tw-prose-td-borders": "var(--border)",
} as React.CSSProperties;

/**
 * Shared chrome for /philosophy and /philosophy/[slug]. Two navigation
 * layers, not one giant scroll of text:
 *  - Cross-doc nav: a sticky sidebar list at md+, a horizontal scrolling
 *    chip row below md (the sidebar is `hidden md:block`, so without the
 *    chip row mobile visitors have no way to reach the other docs at all —
 *    a real reported bug, not a hypothetical one).
 *  - In-doc nav: a scrollspy table of contents (components/table-of-contents.tsx)
 *    built from every h2/h3 in the doc, so a long file reads as a set of
 *    jump-to sections instead of one wall of text.
 *
 * The article itself is intentionally NOT wrapped in the scroll-reveal
 * primitive used elsewhere on the site — that component's
 * IntersectionObserver threshold is a fraction of the target's own area,
 * which never resolves for a page-length block (the root philosophy file
 * is easily 5-10x a viewport tall), so it rendered permanently at
 * opacity:0. Reading content shouldn't be gated behind an entrance
 * animation anyway; the fix here is removing it, not just raising the
 * threshold (that fix also landed, in reveal.tsx, for every other use).
 */
export function PhilosophyShell({
  activeSlug,
  html,
  toc,
}: {
  activeSlug?: string;
  html: string;
  toc: TocEntry[];
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="progress-bar fixed inset-x-0 top-0 z-40 h-[2px] bg-accent" />

      <nav className="mb-8 flex gap-2 overflow-x-auto px-6 pb-2 md:hidden">
        {ALL_DOCS.map((doc) => (
          <Link
            key={doc.title}
            href={doc.slug ? `/philosophy/${doc.slug}` : "/philosophy"}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors duration-300 ease-fluid",
              doc.slug === activeSlug
                ? "border-accent text-accent"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {doc.title}
          </Link>
        ))}
      </nav>

      <div className="flex gap-16 px-6 pb-32">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] space-y-6 overflow-y-auto pb-8">
            <Eyebrow>Philosophy</Eyebrow>
            <nav className="flex flex-col gap-3 text-sm">
              {ALL_DOCS.map((doc) => (
                <Link
                  key={doc.title}
                  href={doc.slug ? `/philosophy/${doc.slug}` : "/philosophy"}
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
            <TableOfContents toc={toc} />
          </div>
        </aside>
        <article
          style={PROSE_VARS}
          className={cn(
            "prose min-w-0 max-w-none flex-1",
            "prose-headings:font-display prose-headings:tracking-wide prose-headings:uppercase",
            "prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg prose-h2:scroll-mt-28 prose-h3:scroll-mt-28",
            "prose-a:no-underline hover:prose-a:underline",
            "prose-code:font-mono prose-code:text-sm",
            "prose-pre:rounded-2xl prose-pre:border prose-pre:border-border",
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
