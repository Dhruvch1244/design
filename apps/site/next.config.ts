import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages only serves static files — no Node server, no route
  // handlers, no on-demand rendering. Every route here is already static or
  // SSG (see `next build`'s route table), so this has no behavior cost.
  output: "export",
  // GitHub Pages (and most static hosts) resolve `/foo/` to `/foo/index.html`
  // reliably; resolving extension-less `/foo` to `/foo.html` is not
  // guaranteed without server-side rewrite rules we can't configure here.
  trailingSlash: true,
};

export default nextConfig;
