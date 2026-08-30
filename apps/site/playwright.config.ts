import { defineConfig } from "@playwright/test";

// Runs `next start` against the real production build (`.next`, produced by
// the `npm run build` step CI already runs before this), the same server
// Vercel runs in production — not a plain static file server. CI builds
// first (see .github/workflows/ci.yml), so webServer just starts it here;
// reuseExistingServer covers local `npm run dev`-then-test workflows.
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
    command: "npx next start -p 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
