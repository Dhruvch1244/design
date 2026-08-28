import { Link } from "@/components/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Changelog — Dhruv Choudhary",
  description: "Real, dated history of @dhruvchoudhary/dsgn — every CLI release and registry addition, not a marketing timeline.",
};

// Sourced from the real CHANGELOG.md at the repo root — same content, this
// is just the site's presentation of it. Update both when a new version
// ships; this file doesn't read CHANGELOG.md at build time (a plain static
// array is simpler than a markdown-parsing build step for ~5 entries).
interface Section {
  kind: "added" | "fixed";
  items: string[];
}

interface Release {
  version: string;
  date: string;
  sections: Section[];
}

const RELEASES: Release[] = [
  {
    version: "0.4.0",
    date: "2026-08-29",
    sections: [
      {
        kind: "added",
        items: [
          "dsgn list --recipes — list composed recipes separately from individual components. Plain dsgn list now also hints at dsgn skill.",
          "A real automated test suite (29 tests) covering add/diff/update/doctor/list/skill/resolveItems — the package had zero regression protection before this.",
        ],
      },
      {
        kind: "fixed",
        items: [
          "resolveItems could install a recipe's own file before one of its dependencies, violating its own documented install-order contract — found by the new test suite.",
          "dsgn list (no flag) was showing all 27 raw registry entries instead of the 23 real UI components.",
        ],
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-08-29",
    sections: [
      {
        kind: "added",
        items: [
          "dsgn skill --global / dsgn skill --project — installs the dsgn Claude Code Agent Skill (a router plus 5 style-persona sub-agents), bundled directly in the package so it works fully offline.",
        ],
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-08-28",
    sections: [
      {
        kind: "added",
        items: [
          "dsgn diff / dsgn update — every installed file's content hash is now tracked, so the CLI can tell “never touched since install” from “user edited this” without being a real runtime dependency.",
          "dsgn add recipe:<name> — install a composed multi-component pattern (auth-form, settings-panel, pricing-tiers) plus every component it depends on, in one shot.",
          "dsgn doctor — health-check installed files for drift and a couple of cheap, high-signal accessibility mistakes.",
          "dsgn snippets — VS Code snippets for every registry component.",
        ],
      },
    ],
  },
  {
    version: "0.1.1",
    date: "2026-08-28",
    sections: [
      {
        kind: "fixed",
        items: [
          "Windows: replaced a shell:true spawn call (Node's DEP0190 warning) with cross-spawn, which resolves npm's .cmd shim correctly without ever needing shell:true.",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-08-28",
    sections: [
      {
        kind: "added",
        items: [
          "Initial publish as @dhruvchoudhary/dsgn (the unscoped name dsgn was already taken).",
          "dsgn init, dsgn add <component...>, dsgn list.",
          "Non-destructive by default: add never overwrites an existing file unless --overwrite is passed.",
        ],
      },
    ],
  },
];

// The registry isn't versioned like the CLI — it's served live from the
// deployed site, so growth here doesn't require a CLI release to take
// effect for `dsgn add`. Dated from real commit history, not estimated.
const REGISTRY_MILESTONES = [
  { date: "2026-08-28 · 11:40", note: "Initial registry: Button, Card.", count: 2 },
  { date: "2026-08-28 · 17:48", note: "Badge, Input added.", count: 4 },
  { date: "2026-08-28 · 19:29", note: "Command palette added.", count: 5 },
  { date: "2026-08-28 · 20:11", note: "Textarea, Switch, Tooltip, Tabs, Select, Dialog added.", count: 11 },
  {
    date: "2026-08-28 · 21:02",
    note: "Alert, Avatar, Checkbox, Radio Group, Separator, Progress, Accordion, Popover, Dropdown Menu added.",
    count: 20,
  },
  { date: "2026-08-28 · 22:02", note: "Table, Skeleton, Empty State added, alongside a theming guide page.", count: 23 },
  { date: "2026-08-28 · 23:49", note: "3 composed recipes added (auth-form, settings-panel, pricing-tiers).", count: 23 },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-32">
      <Reveal>
        <Eyebrow>Changelog · dsgn</Eyebrow>
        <h1 className="mt-6 font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
          What actually shipped.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Real, dated history — reconstructed from git history, not a marketing timeline. Full
          detail in{" "}
          <a
            href="https://github.com/dhruvch1244/design/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            CHANGELOG.md
          </a>
          .
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">
            @dhruvchoudhary/dsgn on npm
          </h2>
          <div className="space-y-4">
            {RELEASES.map((release) => (
              <Frame key={release.version} glow={false}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-mono text-sm font-semibold text-accent">v{release.version}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{release.date}</span>
                </div>
                {release.sections.map((section) => (
                  <div key={section.kind} className="mt-3 first:mt-1">
                    <span className="inline-block text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      {section.kind}
                    </span>
                    <ul className="mt-2 space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent"
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Frame>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Registry growth</h2>
          <p className="text-sm text-muted-foreground">
            Not tied to a CLI version — the registry is served live from the deployed site, so
            these dates reflect when each component actually became installable, independent of
            any npm release.
          </p>
          <Frame glow={false}>
            <ul className="space-y-3">
              {REGISTRY_MILESTONES.map((m) => (
                <li
                  key={m.date}
                  className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{m.date}</span>
                    <span className="text-sm text-muted-foreground">{m.note}</span>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-accent">{m.count} components</span>
                </li>
              ))}
            </ul>
          </Frame>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/skill" className="text-sm text-accent hover:underline">
            ← Install the Agent Skill
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
