import { Link } from "@/components/link";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";

/**
 * One reused promo, not four hand-written variants — every section index
 * page (components, examples, case-studies, philosophy) points at the same
 * /skill page the same way, so the pitch stays consistent as those pages
 * change independently over time.
 */
export function SkillPromoBanner() {
  return (
    <Reveal>
      <Frame
        glow={false}
        className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
      >
        <p className="text-sm text-muted-foreground">
          This whole registry and philosophy is available as a{" "}
          <span className="font-medium text-foreground">Claude Code Agent Skill</span> — install
          it and Claude builds UI with it directly.
        </p>
        <Link
          href="/skill"
          className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition-transform duration-300 ease-fluid hover:scale-105"
        >
          Install the Skill →
        </Link>
      </Frame>
    </Reveal>
  );
}
