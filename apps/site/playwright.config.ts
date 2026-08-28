import { defineConfig } from "@playwright/test";

// Serves the static export (out/) with a plain static file server, not
// `next start` — output: "export" produces a fully static site with no
// Node server to start, and that's deliberate (see next.config.ts). The
// smoke tests hit that same static output, not a dev server, so they
// exercise exactly what actually ships to GitHub Pages.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "list" : "html",
  use: {
    baseURL: "http://localhost:4173",
    screenshot: "only-on-failure",
  },
  webServer: {
    // No -s (SPA rewrite) flag deliberately — GitHub Pages serves each
    // route's own out/<route>/index.html directly (trailingSlash: true in
    // next.config.ts), not a single rewritten index.html, so the test
    // server should match that instead of masking a route that isn't
    // actually being generated.
    command: "npx serve out -l 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
