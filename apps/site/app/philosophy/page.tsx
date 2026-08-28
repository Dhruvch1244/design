import type { Metadata } from "next";
import { readPhilosophyMarkdown, renderMarkdown } from "@/lib/philosophy";
import { PhilosophyShell } from "@/components/philosophy-shell";

export const metadata: Metadata = {
  title: "Philosophy — Dhruv Choudhary",
  description: "The portable, cross-AI design philosophy root file.",
};

export default async function PhilosophyIndexPage() {
  const markdown = await readPhilosophyMarkdown("AGENTS.md");
  const { html, toc } = await renderMarkdown(markdown);

  return <PhilosophyShell html={html} toc={toc} />;
}
