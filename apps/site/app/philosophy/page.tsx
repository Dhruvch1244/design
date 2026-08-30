import type { Metadata } from "next";
import { readPhilosophyMarkdown, renderMarkdown } from "@/lib/philosophy";
import { PhilosophyShell } from "@/components/philosophy-shell";
import { SkillPromoBanner } from "@/components/skill-promo-banner";

export const metadata: Metadata = {
  title: "Philosophy — Dhruv Choudhary",
  description: "The portable, cross-AI design philosophy root file.",
};

export default async function PhilosophyIndexPage() {
  const markdown = await readPhilosophyMarkdown("AGENTS.md");
  const { html, toc } = await renderMarkdown(markdown);

  return (
    <>
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <SkillPromoBanner />
      </div>
      <PhilosophyShell html={html} toc={toc} />
    </>
  );
}
