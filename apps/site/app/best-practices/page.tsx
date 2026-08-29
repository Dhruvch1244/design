import type { Metadata } from "next";
import { Link } from "@/components/link";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { Checkbox } from "@/components/dsgn/checkbox";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/dsgn/accordion";

export const metadata: Metadata = {
  title: "Best Practices — Dhruv Choudhary",
  description:
    "Concrete Do/Don't rules and pre-output checklists for five UI voices — real content from the dsgn Agent Skill, not generic advice.",
};

interface Voice {
  slug: string;
  name: string;
  tagline: string;
  dos: string[];
  donts: string[];
  checklist: string[];
}

// Verbatim from skills/dsgn/agents/*.md's own "## 8. Do / Don't" and
// "## 9. Pre-output checklist" sections — not paraphrased, not generic
// best-practices boilerplate. If those files change, update here too (same
// hand-sync tradeoff apps/site/app/skill/page.tsx already makes for its own
// curated excerpts, rather than pulling in a full markdown-render pipeline
// for five short structured lists).
const VOICES: Voice[] = [
  {
    slug: "glass-dark-cyan",
    name: "Glass / Dark-Cyan",
    tagline: "Dark OLED, cyan accent, glass panels — this site's own default voice.",
    dos: [
      "One accent color per view, generous but not maximal whitespace, condensed display type for headings only.",
      "Derive every glow/shadow color from var(--accent).",
    ],
    donts: [
      "Use pure black (#000000) — always the warmer, deep near-black --void.",
      "Apply backdrop-blur to scrolling content — fixed/sticky elements only (nav, overlays), per the performance guardrail in the workflow checklist.",
      "Let more than one element per view use the glow treatment.",
    ],
    checklist: [
      "Background is --void, not pure black",
      "Exactly one accent-heavy CTA per view (if any)",
      "Headings use the display font; body text never does",
      "All glows/shadows derive from var(--accent)",
      "Scroll-reveal (if any) has a timeout fallback and doesn't route through React state for the visibility toggle",
      "backdrop-blur only on fixed/sticky elements",
      "Contrast checked in both dark and light variants",
    ],
  },
  {
    slug: "editorial-warm",
    name: "Editorial / Warm",
    tagline: "Warm paper, serif display type — portfolios and content-first sites.",
    dos: [
      "Let generous whitespace and serif type contrast do the visual work.",
      "Keep the accent color muted and rare.",
    ],
    donts: [
      "Add a glass/blur panel treatment — this voice is intentionally flat.",
      "Use a saturated, high-chroma accent color.",
      "Let body copy run at less than 1.5 line-height.",
    ],
    checklist: [
      "Background is warm cream, not stark white or dark",
      "Headings use a serif display face; body text does not",
      "Accent color is muted/desaturated, used sparingly",
      "No glass/blur panels anywhere",
      "Body text line-height is generous (1.6+)",
      "Contrast of the muted accent verified against the cream background",
    ],
  },
  {
    slug: "brutalist-mono",
    name: "Brutalist / Mono",
    tagline: "Pure black/white, thick borders, monospace — developer tools and changelogs.",
    dos: ["Use pure black/white and one loud accent color.", "Use hard, offset shadows with zero blur."],
    donts: [
      "Soften corners — radius should read as near-zero.",
      "Use a soft, diffuse, or color-mixed shadow anywhere.",
      "Default to the flagship voice's fluid 300-900ms easing — this voice needs a faster, more mechanical motion signature.",
    ],
    checklist: [
      "Background is pure black or pure white",
      "Headings use monospace, not a display sans/serif",
      "Borders are thick (2-4px), not hairline",
      "Shadows are hard-offset with zero blur, not soft/diffuse",
      "Radius scale is near zero throughout",
      "Focus rings are visually distinct from decorative borders",
      "A prefers-reduced-motion fallback exists for the snappier motion",
    ],
  },
  {
    slug: "soft-minimal",
    name: "Soft / Minimal",
    tagline: "Silver-grey, huge whitespace, ambient shadow — consumer and wellness products.",
    dos: [
      "Use soft, diffused ambient shadows instead of borders for separation.",
      "Check contrast explicitly and often — this voice's calm aesthetic is the highest a11y-risk of the five.",
    ],
    donts: [
      "Add a visible hard border anywhere it can be avoided.",
      "Use a saturated or high-chroma accent color.",
      "Use fast/snappy motion — everything here should feel unhurried.",
    ],
    checklist: [
      "Background is silver-grey/white, no warmth or darkness",
      "Separation between elements uses soft shadow, not hard borders",
      "Accent color is muted, used only as a small highlight",
      "Every text/background and icon/background pairing checked against WCAG AA — don't assume, verify",
      "Motion amplitude is low and unhurried throughout",
      "Buttons/cards lean toward fully rounded rather than sharp corners",
    ],
  },
  {
    slug: "neon-cyberpunk",
    name: "Neon / Cyberpunk",
    tagline: "Near-black, saturated multi-color glow — gaming and entertainment.",
    dos: [
      "Layer 2-3 neon glow colors with real blur/transparency rather than flattening them into one mixed hue.",
      "Provide a genuinely reduced-motion fallback for every glow/pulse effect — treat this as required, not optional, given the intensity here.",
    ],
    donts: [
      "Use flat, unblurred saturated fills as large background areas — the glow-layered look is the point, a solid neon-colored panel is not.",
      "Apply a heavy glow effect to every heading on a page — reserve it for the single most important one per view.",
    ],
    checklist: [
      "Multiple accent hues are layered as glow, not flattened into one muddy mixed color",
      "Only the single most important headline per view gets a glow/shadow text effect",
      "Every pulsing/glowing animation has a prefers-reduced-motion fallback",
      "Glow effects never fully obscure text at any point in their cycle",
      "Semantic --accent token still points to one primary hue for component-level consistency",
    ],
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function BestPracticesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-32">
      <Reveal>
        <Eyebrow>Best practices · dsgn</Eyebrow>
        <h1 className="mt-6 font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
          Five voices, five checklists.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Not generic UI advice — the real Do/Don&rsquo;t rules and pre-output checklists from each of
          the{" "}
          <Link href="/skill" className="text-accent hover:underline">
            dsgn Agent Skill&rsquo;s
          </Link>{" "}
          five style-persona files. Every rule here governs a specific, checkable visual decision,
          not a platitude — pick the voice you&rsquo;re building in and run its checklist before
          calling the work done.
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-10 space-y-4">
          <Frame glow={false}>
            <Accordion type="single" collapsible className="w-full">
              {VOICES.map((voice) => (
                <AccordionItem key={voice.slug} value={voice.slug}>
                  <AccordionTrigger>
                    <div className="text-left">
                      <div className="font-display text-base uppercase tracking-wide">{voice.name}</div>
                      <div className="mt-1 text-xs font-normal normal-case text-muted-foreground">
                        {voice.tagline}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                          Do
                        </span>
                        <ul className="space-y-2">
                          {voice.dos.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm">
                              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                          Don&rsquo;t
                        </span>
                        <ul className="space-y-2">
                          {voice.donts.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm">
                              <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2 border-t border-border pt-4">
                      <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                        Pre-output checklist
                      </span>
                      <ul className="space-y-2">
                        {voice.checklist.map((item) => (
                          <li key={item}>
                            <label className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Checkbox className="mt-0.5 shrink-0" />
                              {item}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Frame>
          <p className="text-xs text-muted-foreground">
            Checkboxes here are a real review aid, not a form that submits anywhere — check items off
            as you verify your own work, refresh to reset.
          </p>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/skill" className="text-sm text-accent hover:underline">
            ← See the full skill these checklists come from
          </Link>
          <Link href="/theming" className="text-sm text-accent hover:underline">
            The token system these rules reference →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
