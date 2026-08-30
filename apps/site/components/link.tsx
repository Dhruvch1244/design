import NextLink from "next/link";
import type { ComponentProps } from "react";

// Defaults prefetch to false. Next's automatic prefetch fetches an RSC
// payload endpoint (`/__next.<route>.__PAGE__.txt`) that only a Next-aware
// server can serve — this site is `output: "export"`, deployed as plain
// static files to GitHub Pages, so that endpoint doesn't exist anywhere,
// including in production. Every real visitor's browser was silently
// generating a failed request for it whenever a link scrolled into view
// (confirmed via a real Lighthouse audit: "errors-in-console" failing on
// exactly this). Turning prefetch off doesn't break navigation — a
// non-prefetched link still navigates normally on click, just without the
// (already-nonfunctional) head start.
export function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
