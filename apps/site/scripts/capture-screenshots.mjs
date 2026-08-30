// Captures light/dark screenshots of a representative subset of components
// for the /theming screenshot gallery. Not part of the Next.js build or CI —
// this needs a running static server (see usage below), and its output
// (apps/site/public/screenshots/*.png) is committed like any other static
// asset. Re-run by hand whenever a captured component's visuals change
// meaningfully:
//
//   cd apps/site
//   npx next build && npx serve out -l 4179 &
//   node scripts/capture-screenshots.mjs http://localhost:4179
//
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "screenshots");
const BASE_URL = process.argv[2] ?? "http://localhost:4173";

// A representative subset, not all 23 — visually distinct enough to prove
// the token system holds up across very different component shapes
// (text-only, filled surface, overlay, tabular, disclosure).
const COMPONENTS = ["button", "card", "badge", "dialog", "table", "accordion"];
const THEMES = ["light", "dark"];

async function waitForReveal(page) {
  await page.waitForFunction(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    return els.every((el) => getComputedStyle(el).opacity !== "0");
  }, { timeout: 5000 }).catch(() => {});
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const theme of THEMES) {
    const page = await browser.newPage({ colorScheme: theme });
    await page.goto(`${BASE_URL}/components/`);
    await waitForReveal(page);

    for (const name of COMPONENTS) {
      const section = page.locator(`#${name}`);
      await section.scrollIntoViewIfNeeded();
      // Dialog's live preview is a trigger button, not the dialog itself —
      // open it so the captured screenshot shows the actual overlay, not
      // just a button that says "Open dialog".
      if (name === "dialog") {
        await section.getByRole("button", { name: /open dialog/i }).click();
        await page.waitForTimeout(400);
        const target = page.getByRole("dialog");
        await target.screenshot({ path: path.join(OUT_DIR, `${name}-${theme}.png`) });
        await page.keyboard.press("Escape");
        continue;
      }
      await page.waitForTimeout(150);
      await section.screenshot({ path: path.join(OUT_DIR, `${name}-${theme}.png`) });
    }
    await page.close();
  }

  await browser.close();
  console.log(`Captured ${COMPONENTS.length * THEMES.length} screenshots into ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
