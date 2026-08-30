// Real, separately-built sites that install dsgn from npm like any other
// consumer would — proof of what the registry produces in a fresh project,
// not a demo page inside this site's own component gallery. Each one is a
// genuine external repo; /showcase links out to both the live embed and the
// repo, and the repo itself carries the exact prompt that built it (its
// README and its first commit message, verbatim, no edits).
export interface ShowcaseSite {
  slug: string;
  name: string;
  org: string;
  tagline: string;
  category: string;
  voice: string;
  componentCount: number;
  liveHref: string;
  repoHref: string;
  screenshot: string;
}

export const SHOWCASE_SITES: ShowcaseSite[] = [
  {
    slug: "halyard",
    name: "Halyard",
    org: "Northbridge Labs",
    tagline:
      "A fictional product-analytics workspace — five views, a hand-drawn traffic chart, and a filterable event schema registry.",
    category: "SaaS analytics dashboard",
    voice: "corporate",
    componentCount: 29,
    liveHref: "/design-analytics",
    repoHref: "https://github.com/Dhruvch1244/dsgn-showcase-analytics",
    screenshot: "/showcase/halyard.png",
  },
];
