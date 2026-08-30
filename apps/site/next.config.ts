import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed on Vercel (a real Node/edge runtime), not GitHub Pages — no
  // longer forcing a static export. Every route was already static/SSG
  // under the old config, so this is a strict capability increase (route
  // handlers, on-demand rendering, ISR all become available if ever
  // needed), not a behavior change for anything that exists today.
  //
  // trailingSlash stays true deliberately, not because Vercel needs it the
  // way GitHub Pages did — it doesn't — but because every already-indexed
  // URL and every internal link in this codebase assumes it (`/components/`,
  // not `/components`). Dropping it would 301-redirect every existing
  // inbound link/bookmark instead of serving directly.
  trailingSlash: true,
};

export default nextConfig;
