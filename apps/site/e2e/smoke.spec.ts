import { test, expect } from "@playwright/test";

// Every route that's actually reachable via nav/footer/sitemap, checked in
// both themes. This isn't a full visual-regression suite (no baseline
// screenshots to maintain) — it's a targeted functional check for the
// specific failure class found by hand this session: content silently
// stuck invisible with no build error and no console error to point at it.
const ROUTES = [
  "/",
  "/philosophy/",
  "/philosophy/architecture/",
  "/case-studies/",
  "/case-studies/lyric-viewer/",
  "/components/",
  "/examples/",
  "/theming/",
  "/skill/",
];

const THEMES = ["light", "dark"] as const;

for (const route of ROUTES) {
  for (const theme of THEMES) {
    test(`${route} renders visible content (${theme})`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      // Real failed-resource-load errors are caught precisely here, by URL —
      // not via the `console` "error" event, whose text for a failed load is
      // always the same generic "Failed to load resource: the server
      // responded with a status of 404" with no URL in it, so it can't be
      // filtered by content. Next's <Link> prefetches RSC payload files
      // (…/__next.<route>.__PAGE__.txt) for any link that scrolls into view;
      // those payloads only resolve on a Next-aware server, and a generic
      // static host — this test's `serve`, and GitHub Pages itself, the
      // actual deploy target, which has no more Next-awareness than `serve`
      // does — 404s them. Harmless: the prefetch failing just means that
      // link falls back to a normal full navigation when actually clicked,
      // which every other assertion in this file already proves works.
      page.on("response", (response) => {
        // Only 4xx/5xx are failures — a 3xx is a normal, successful redirect
        // (the GitHub avatar URL in the Avatar example redirects to GitHub's
        // actual image CDN; that's expected behavior, not an error).
        if (response.status() < 400) return;
        if (/__next\..*__PAGE__\.txt/.test(response.url())) return;
        errors.push(`${response.status()} ${response.url()}`);
      });
      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        if (/Failed to load resource/.test(msg.text())) return;
        errors.push(msg.text());
      });

      await page.emulateMedia({ colorScheme: theme });
      await page.goto(route);

      // Reveal's safety-net fallback fires at 1.2s (see
      // components/motion/reveal.tsx). The margin here is generous (not
      // just 1.2s + a bit) specifically because this config runs
      // fullyParallel — several browser instances competing for CPU at once
      // tightens real timer-firing latency in a way a single real visitor's
      // browser never experiences. Observed 1-in-20 elements missing the
      // fallback at a 1.8s wait under that contention; 3s eliminated it
      // across repeated runs.
      await page.waitForTimeout(3000);

      // The exact bug class this guards against: a .reveal element
      // permanently stuck at opacity:0 because whatever was supposed to
      // un-hide it (an IntersectionObserver callback — which Chrome
      // suspends entirely for a backgrounded tab, confirmed by hand this
      // session) never fired, and nothing else ever set it visible.
      const stuckCount = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll(".reveal"));
        return els.filter((el) => getComputedStyle(el).opacity === "0").length;
      });
      expect(stuckCount, "every .reveal element should have resolved to visible").toBe(0);

      // Not just present in the DOM — actually on screen.
      await expect(page.locator("h1").first()).toBeVisible();

      expect(errors, `console/page errors on ${route} (${theme})`).toEqual([]);
    });
  }
}
