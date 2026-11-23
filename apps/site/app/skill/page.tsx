import type { Metadata } from "next";
import { Link } from "@/components/link";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Button } from "@/components/dsgn/button";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { CopyButton } from "@/components/copy-button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/dsgn/accordion";

export const metadata: Metadata = {
  title: "Skill — Dhruv Choudhary",
  description:
    "A Claude Code Agent Skill: install it and Claude builds UI using this project's real design philosophy and component registry, in one of seven visual voices or five worlds.",
};

const DEGIT_COMMAND = "npx degit dhruvch1244/design/skills/dsgn ~/.claude/skills/dsgn";
const DEGIT_COMMAND_PROJECT = "npx degit dhruvch1244/design/skills/dsgn .claude/skills/dsgn";
const CLONE_COMMAND =
  "git clone --depth 1 https://github.com/dhruvch1244/design /tmp/dsgn-skill && cp -r /tmp/dsgn-skill/skills/dsgn ~/.claude/skills/dsgn && rm -rf /tmp/dsgn-skill";
const CLI_SKILL_GLOBAL = "npx @dhruvchoudhary/dsgn skill --global";
const CLI_SKILL_PROJECT = "npx @dhruvchoudhary/dsgn skill --project";

interface OtherTool {
  flag: string;
  tool: string;
  target: string;
  note?: string;
}

// Same router + 7 personas + 5 worlds + reference docs as the Claude Code skill, built
// per-tool by scripts/sync-skill.mjs into the real structure each format
// actually supports — not one flattened file everywhere. Cursor gets real
// sibling .mdc files Cursor auto-attaches by description; Gemini gets real
// @file.md imports; Windsurf and Copilot get split files too, shaped around
// what each format documents. AGENTS.md alone stays single-file, since
// that convention genuinely is single-file by design.
const OTHER_TOOLS: OtherTool[] = [
  {
    flag: "--cursor",
    tool: "Cursor",
    target: "./.cursor/rules/dsgn/ (router + 12 agents + 5 reference docs)",
    note: "Cursor reads each file's description and auto-attaches the relevant one. No file-based global — Cursor's only global mechanism is its Settings UI.",
  },
  {
    flag: "--windsurf",
    tool: "Windsurf (this project)",
    target: "./.windsurf/rules/dsgn-*.md (18 files)",
  },
  {
    flag: "--windsurf-global",
    tool: "Windsurf (every workspace)",
    target: "~/.windsurf/global_rules.md",
    note: "A condensed summary, not the full skill — Windsurf caps this file at 6,000 characters.",
  },
  {
    flag: "--copilot",
    tool: "GitHub Copilot",
    target: "./.github/copilot-instructions.md + .github/instructions/dsgn-*.instructions.md (12 files)",
    note: "Copilot has no description-based routing — all 12 voices and worlds apply together; delete the ones you don't want.",
  },
  {
    flag: "--gemini",
    tool: "Gemini CLI (this project)",
    target: "./GEMINI.md + ./.gemini/dsgn/ (real @file.md imports)",
  },
  {
    flag: "--gemini-global",
    tool: "Gemini CLI (every project)",
    target: "~/.gemini/GEMINI.md + ~/.gemini/dsgn/",
  },
  {
    flag: "--agents-md",
    tool: "Codex CLI, Amp, and other AGENTS.md-aware tools",
    target: "./AGENTS.md (single flattened file — the correct shape for this convention)",
  },
];

// Real registry components (Card/CardHeader/CardTitle/CardDescription/
// CardContent, Button variant="soft") — soft-minimal's own doc says to drop
// borders for a soft ambient shadow and favor rounded-full soft-fill
// buttons; this is that rule applied, not invented example code.
const WORKED_EXAMPLE_CODE = `<Card className="border-0 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
  <CardHeader>
    <CardTitle>Tonight's session</CardTitle>
    <CardDescription>18 minutes · Sleep story</CardDescription>
  </CardHeader>
  <CardContent>
    <Button variant="soft" className="w-full rounded-full">
      Start again
    </Button>
  </CardContent>
</Card>`;

// The router file's key sections, verbatim from skills/dsgn/SKILL.md — not
// paraphrased. Full file is longer (source-of-truth footer, handoff
// mechanics); this is the part someone deciding whether to install it
// actually needs to read first.
const SKILL_MD_PREVIEW = `---
name: dsgn
description: Build UI with the real @dhruvchoudhary/dsgn component registry and the dhruvch1244/design philosophy, in one of seven distinct visual voices or five worlds (voice + presentation metaphor + copy over one content model), routed automatically by project context or explicit request.
---

## When to use this skill

Use it whenever the task is building or restyling UI — a page, a component
library, a design system, a "make this look premium" request — especially
when the project is a fresh scaffold with no established visual language yet,
or when the user explicitly asks for one of the seven voices or five worlds
below by name — or asks for "themes," "modes" or "skins" that should feel
genuinely different rather than recolored (that's a world; see below).

Don't use it to override an established, working design system already in
place in the target project unless the user asks for a restyle. This skill
is additive, not a replacement for a project's existing conventions.

## Router logic

Apply these signals in order — the first one that matches decides:

1. Explicit request wins. If the user names a style directly ("make it
   brutalist," "give me the neon one," "like your own site," "make it a
   terminal"), use that agent. A request for multiple themes that should
   feel different — not just recolored — routes to worlds and
   reference/worlds.md.
2. Existing brand cues win next. Match a project's existing palette/type
   direction rather than introducing a new voice on top of an established one.
3. Project type is the fallback default — a SaaS dashboard, a portfolio, a
   dev tool, a wellness app, a game each map to one of the seven voices or five worlds below.
4. When genuinely unsure — two candidates, or no strong signal at all —
   stop and ask, don't silently pick. Lead with your actual recommendation
   and why, offer 1-2 alternatives, and use a structured choice tool
   (e.g. AskUserQuestion) if the host has one.

## Before building: confirm the brief

Every time, unless the user's own request already reads like a full spec:
restate what's being built, its scope (in vs. explicitly out), the voice
chosen and the one-line reason, any stated constraints, and anything
genuinely unclear — then stop and wait for confirmation before installing
anything. A correction here is the step working as intended, not friction
to route around.`;

interface Agent {
  slug: string;
  name: string;
  description: string;
  content: string;
}

// Full, real content of each agents/*.md file — verbatim, so copying from
// this page and copying from the repo produce byte-identical files.
const AGENTS: Agent[] = [
  {
    slug: "glass-dark-cyan",
    name: "Glass / Dark-Cyan",
    description:
      "Dark OLED background, cyan accent, backdrop-blur glass panels, Bebas Neue display type — the real, current visual system of the dhruvch1244/design site itself. Default choice for dev-tool/SaaS/technical UI.",
    content: `---
name: dsgn-glass-dark-cyan
description: Dark OLED background, cyan accent, backdrop-blur glass panels, Bebas Neue display type — the real, current visual system of the dhruvch1244/design site itself. Default choice for dev-tool/SaaS/technical UI.
---

# Glass / Dark-Cyan

## 1. Identity

This is not an invented archetype — it's an accurate description of
\`design.dhruvchoudhary.com\`'s own real, shipped visual system. Deep near-OLED
background, a single cyan accent (swappable to violet/magenta/warm via the
same token mechanism), floating translucent glass panels, and condensed
uppercase display type for headings. Reads as technical, precise, and a
little cinematic — appropriate for developer tools, SaaS products, and
anything that wants to feel like infrastructure rather than a consumer app.

## 2. Color logic

- Background: \`--void\` (\`#07080c\` dark / \`#f7f5f2\` light) — never pure \`#000\`.
- Panels: \`--surface\` (\`#0d0f16\` dark / \`#ffffff\` light), or the translucent
  \`--glass\`/\`--glass-strong\` pair for anything meant to float over the
  background rather than sit flush with it.
- One accent, used sparingly: default \`--cyan\` (\`#28e0ec\` dark, darkened to
  \`#0e8b96\` in light mode for contrast). Reserve it for the single primary
  action per view, focus rings, and small highlight details — not large
  fills. A UI that's 40% cyan has lost the accent's meaning.
- Text: \`--ink\` primary, \`--ink-soft\` secondary, \`--ink-faint\` for anything
  truly tertiary (timestamps, disabled state).
- Shadows and glows are always derived from \`var(--accent)\` via
  \`color-mix()\`, never a hardcoded color — see \`reference/tokens.md\`.

## 3. Typography

- Display/headings: \`--font-display\` (Bebas Neue) — condensed, uppercase,
  wide letter-tracking. Use it for section titles and hero type, never for
  body copy or anything that needs to be read at length.
- Body: \`--font-sans\` (Hanken Grotesk).
- Meta/code/keyboard hints: \`--font-mono\` (JetBrains Mono) — used for
  terminal snippets, \`⌘K\`-style kbd hints, filenames, timestamps.

## 4. Spacing & density

Moderate-to-generous section padding (not maximal whitespace like a soft
editorial layout, but never cramped). Cards get real padding (\`p-6\`–\`p-8\`
range), not tight \`p-2\` boxes. A floating pill nav (detached from the
viewport edge, \`rounded-full\`, \`backdrop-blur-xl\`) rather than an edge-glued
sticky bar — see the real \`Nav\` component's own doc comment: it's a
"floating glass-pill island."

## 5. Motion character

- Every transition: \`var(--ease-fluid)\` (\`cubic-bezier(0.32, 0.72, 0, 1)\`),
  300–900ms depending on element weight.
- Scroll-reveal: elements fade up with a slight blur resolving to sharp
  (\`opacity + translateY + blur\` → \`1, 0, 0\`), never a static pop-in. Pair
  an \`IntersectionObserver\` with a ~1.2s timeout fallback and mutate
  visibility via direct \`classList\`, not React state — see
  \`reference/workflow-checklist.md\` facet 5 for why this specific detail is
  load-bearing, not a style preference.
- Hover glow: a cursor-following radial gradient confined to its container,
  painted on a sibling layer (see \`reference/workflow-checklist.md\` facet 5).
- Background chrome: a subtle mesh-gradient wash + a sparse starfield +
  a very low-opacity grain overlay, all \`pointer-events-none\` and layered
  behind content — ambient, not attention-grabbing.

## 6. Borders & shadows

Thin 1px borders (\`--border\` → \`--rule\`), never a thick or double border.
Shadows are soft and ambient (\`--shadow-ambient\`: an inset highlight +
diffuse drop shadow), plus an optional \`--shadow-glow\` (ring + accent-colored
glow) reserved for the one emphasized CTA (\`variant="glow"\` on Button).

## 7. Workflow facets in this voice

- **Component Builder**: default to the registry's \`outline\`/\`ghost\`/\`soft\`
  button variants for most actions; reserve \`glow\` for exactly one CTA per
  view. Cards get a 1px border + \`--shadow-ambient\`, not a heavy drop shadow.
- **Page Composer**: hero sections pair large Bebas Neue type on the left
  with a live/interactive proof element on the right (a terminal snippet, a
  live component preview) rather than a static illustration.
- **Theming Specialist**: this *is* the default token set — swapping accent
  presets (cyan/violet/magenta/warm) is free; swapping the whole palette
  away from dark-glass means moving to a different agent instead, not
  fighting this one's assumptions.
- **Accessibility Reviewer**: cyan-on-dark and the darkened cyan-on-light
  variant were chosen specifically to hold AA contrast — don't lighten the
  dark-mode cyan further without rechecking; it was tuned in light mode
  by darkening the hue, not just changing background.
- **Motion specialist**: this voice can afford confident, visible motion
  (fade-up reveals, glow pulses on the emphasized CTA) — restraint here
  is about frequency (not every element needs a hover glow), not intensity.

## 8. Do / Don't

- Do: one accent color per view, generous but not maximal whitespace,
  condensed display type for headings only.
- Do: derive every glow/shadow color from \`var(--accent)\`.
- Don't: use pure black (\`#000000\`) — always the warmer, deep near-black
  \`--void\`.
- Don't: apply \`backdrop-blur\` to scrolling content — fixed/sticky elements
  only (nav, overlays), per the performance guardrail in
  \`reference/workflow-checklist.md\`.
- Don't: let more than one element per view use the \`glow\` treatment.

## 9. Pre-output checklist

- [ ] Background is \`--void\`, not pure black
- [ ] Exactly one accent-heavy CTA per view (if any)
- [ ] Headings use the display font; body text never does
- [ ] All glows/shadows derive from \`var(--accent)\`
- [ ] Scroll-reveal (if any) has a timeout fallback and doesn't route through
      React state for the visibility toggle
- [ ] \`backdrop-blur\` only on fixed/sticky elements
- [ ] Contrast checked in both dark and light variants
`,
  },
  {
    slug: "editorial-warm",
    name: "Editorial / Warm",
    description:
      'Warm paper background, high-contrast serif display type, muted sage/espresso accent, flat hairline-bordered cards. For portfolios, agencies, and content-first sites that should read as considered rather than "techy."',
    content: `---
name: dsgn-editorial-warm
description: Warm paper background, high-contrast serif display type, muted sage/espresso accent, flat hairline-bordered cards. For portfolios, agencies, and content-first sites that should read as considered rather than "techy."
---

# Editorial / Warm

## 1. Identity

Trades the flagship voice's dark glass for warm paper tones and editorial
type contrast — the register of a well-typeset magazine or a design studio's
own site, not a SaaS dashboard. Content and typography carry the weight;
color and effects stay quiet.

## 2. Color logic

- Background: warm off-white/cream (\`#FDFBF7\`–\`#F7F5F0\` range), never
  stark white.
- Accent: muted, desaturated — a deep sage green or espresso brown, not a
  bright/saturated hue. Use the same semantic token names as the flagship
  voice (\`--accent\`, \`--muted\`, \`--border\`) so components don't need
  source changes — just re-point the raw values (see
  \`reference/tokens.md\`'s indirection model).
- Text: near-black but not pure black (\`#111111\`–\`#2F3437\` range), high
  contrast against the cream background. Secondary text: muted warm gray.
- No glass/translucency layer — flat, opaque surfaces throughout.

## 3. Typography

- Display/headings: a high-contrast variable serif, tight tracking
  (\`-0.02em\` to \`-0.04em\`), tight line-height (\`~1.1\`). This is the single
  biggest departure from the flagship voice's condensed sans display type.
- Body: a clean, well-spaced sans, generous line-height (\`1.6\`+) for actual
  readability at paragraph length — this voice expects people to read prose,
  not just scan UI chrome.
- Meta/code: a plain monospace, used sparingly.

## 4. Spacing & density

The most generous of the seven voices. Large margins, wide column measure
limits for body text (don't let a paragraph run edge-to-edge on a wide
screen), and real whitespace between sections — this voice fails if it feels
crowded.

## 5. Motion character

Understated. Fades and gentle upward drifts on scroll, no glow pulses, no
cursor-follow effects. Slightly longer, calmer easing than the flagship
voice's fluid curve — motion should feel like a page turning, not a UI
reacting.

## 6. Borders & shadows

Flat hairline borders (1px, low-contrast) instead of glass panels. Shadows
are nearly absent — if used at all, extremely soft and low-opacity (<5%),
never a visible drop shadow with hard edges.

## 7. Workflow facets in this voice

- **Component Builder**: Card components lose the glass/blur treatment and
  become flat bordered containers. Buttons favor \`outline\` and \`ghost\`
  registry variants; a solid \`accent\` fill is used sparingly, if at all.
- **Page Composer**: hero sections favor a large serif headline with a
  generous body paragraph beside or beneath it — text-forward, not
  proof-element-forward like the flagship voice's live terminal snippet
  pattern.
- **Theming Specialist**: re-point the raw token values only — background
  to warm cream, accent to sage/espresso, remove the glass/glow shadow
  recipes in favor of flat borders. Component source stays untouched.
- **Accessibility Reviewer**: near-black-on-cream generally holds strong
  contrast by default, but check the muted accent color specifically —
  desaturated sage/espresso hues can drift below AA contrast against cream
  faster than a saturated color would; verify, don't assume.
- **Motion specialist**: default to *less* motion than the flagship voice,
  not just slower motion. If in doubt, cut an animation rather than soften
  it further.

## 8. Do / Don't

- Do: let generous whitespace and serif type contrast do the visual work.
- Do: keep the accent color muted and rare.
- Don't: add a glass/blur panel treatment — this voice is intentionally flat.
- Don't: use a saturated, high-chroma accent color.
- Don't: let body copy run at less than \`1.5\` line-height.

## 9. Pre-output checklist

- [ ] Background is warm cream, not stark white or dark
- [ ] Headings use a serif display face; body text does not
- [ ] Accent color is muted/desaturated, used sparingly
- [ ] No glass/blur panels anywhere
- [ ] Body text line-height is generous (1.6+)
- [ ] Contrast of the muted accent verified against the cream background
`,
  },
  {
    slug: "brutalist-mono",
    name: "Brutalist / Mono",
    description:
      'Pure black/white, thick borders, monospace-forward everywhere including headings, hard offset shadows, near-zero radius. For developer tools, changelogs, and anything explicitly "raw" or "no-nonsense."',
    content: `---
name: dsgn-brutalist-mono
description: Pure black/white, thick borders, monospace-forward everywhere including headings, hard offset shadows, near-zero radius. For developer tools, changelogs, and anything explicitly "raw" or "no-nonsense."
---

# Brutalist / Mono

## 1. Identity

The loudest, most graphic of the seven voices, in the opposite direction from
"soft" — high-contrast, raw, unapologetically rectangular. Reads as a
developer tool built by developers for developers: a changelog, a CLI's
companion site, an internal admin panel that doesn't need to court anyone.

## 2. Color logic

- Background: pure white or pure black (this is the one voice where the
  flagship voice's "never pure black" rule is deliberately broken — the
  starkness is the point).
- Accent: a single loud, saturated color (electric yellow, pure red, or the
  flagship's cyan at full saturation) used as a hard block fill, not a
  subtle highlight.
- No gradients, no color-mix soft shadows — flat, solid fills only.

## 3. Typography

- Monospace-forward *everywhere*, including headings — not just meta/code
  text like the other six voices. Large, bold monospace display type.
- If a second typeface is used at all, it's a heavy grotesk sans for body
  copy — never a serif, never anything with soft curves.

## 4. Spacing & density

Tighter and more graphic than the other voices — content sits close to
thick borders rather than floating in whitespace. Blocky, grid-aligned
layout with visible structural lines (borders as a deliberate design
element, not just a container edge).

## 5. Motion character

Minimal and snappy — near-instant or very short transitions (100–150ms),
deliberately less "fluid" than the flagship voice's cubic-bezier curve.
Motion here should feel mechanical/immediate, not physics-based. Avoid
elaborate scroll-reveal choreography; a hard cut or a very fast fade reads
more on-brand than a slow blur-up.

## 6. Borders & shadows

Thick borders (2–4px, not 1px hairlines) in pure black or the single accent
color. Shadows are hard-edged and offset (e.g. \`4px 4px 0 #000\`, no blur
radius at all) — never soft/diffuse. Radius scale pushed toward \`0\` (see
\`reference/tokens.md\`'s \`--radius-scale\` — override that one variable rather
than every individual radius token).

## 7. Workflow facets in this voice

- **Component Builder**: Buttons get thick borders and a hard offset shadow
  that disappears (or shifts) on press for tactile feedback — favor the
  registry's \`outline\` variant restyled with a thick border over the
  softer \`soft\`/\`ghost\` variants, which read as too quiet for this voice.
- **Page Composer**: layouts favor bold graphic blocks over floating cards —
  sections can touch or overlap at hard edges rather than being separated
  by soft whitespace.
- **Theming Specialist**: set \`--radius-scale\` near \`0\`, swap
  \`--shadow-ambient\`/\`--shadow-glow\` for a hard offset shadow recipe with no
  blur, and push background to pure black or pure white.
- **Accessibility Reviewer**: contrast is usually already very high by
  construction in this voice, so the actual review focus shifts to **focus-
  state visibility** (a thick-border aesthetic can accidentally make the
  focus ring indistinguishable from decorative borders — make sure it's
  still visually distinct) and **motion-reduction** (the snappy, high-
  frequency micro-interactions this voice favors are exactly the kind that
  need a \`prefers-reduced-motion\` fallback, more than the calmer voices do).
- **Motion specialist**: default to *fast*, not smooth. If an interaction
  needs 300ms+ to read clearly in this voice, reconsider the interaction
  rather than slowing down the transition to match the flagship voice's
  fluid curve.

## 8. Do / Don't

- Do: use pure black/white and one loud accent color.
- Do: use hard, offset shadows with zero blur.
- Don't: soften corners — radius should read as near-zero.
- Don't: use a soft, diffuse, or color-mixed shadow anywhere.
- Don't: default to the flagship voice's fluid 300-900ms easing — this
  voice needs a faster, more mechanical motion signature.

## 9. Pre-output checklist

- [ ] Background is pure black or pure white
- [ ] Headings use monospace, not a display sans/serif
- [ ] Borders are thick (2-4px), not hairline
- [ ] Shadows are hard-offset with zero blur, not soft/diffuse
- [ ] Radius scale is near zero throughout
- [ ] Focus rings are visually distinct from decorative borders
- [ ] A \`prefers-reduced-motion\` fallback exists for the snappier motion
`,
  },
  {
    slug: "soft-minimal",
    name: "Soft / Minimal",
    description:
      'Silver-grey/white background, massive whitespace, ultra-diffused ambient shadows, calm micro-motion. For consumer, health, and wellness products, or anything explicitly "calm," "minimal," or "airy."',
    content: `---
name: dsgn-soft-minimal
description: Silver-grey/white background, massive whitespace, ultra-diffused ambient shadows, calm micro-motion. For consumer, health, and wellness products, or anything explicitly "calm," "minimal," or "airy."
---

# Soft / Minimal

## 1. Identity

The calmest of the seven voices — closer to a wellness or consumer-health app
than a developer tool. Nothing shouts; components feel like they're floating
just above the background rather than sitting in a hard-bordered container.
The risk profile here is different from the other six voices: the biggest
failure mode isn't visual clutter, it's *accessibility drifting quietly*
because everything is intentionally low-contrast and soft.

## 2. Color logic

- Background: silver-grey or true white, no warmth (unlike the editorial
  voice's cream) and no darkness (unlike the flagship's OLED voice).
- Accent: a single muted pastel — used even more sparingly than the
  editorial voice's sage/espresso, often just as a small highlight or an
  icon tint rather than a fill.
- Text: dark grey rather than black for primary text (softens the overall
  contrast profile slightly, but see the accessibility note below — this
  softening has a real limit).
- No gradients, no saturated fills anywhere.

## 3. Typography

- Bold, geometric sans for headings — large and confident, but not
  condensed/display like the flagship voice's Bebas Neue. Think "big, round,
  friendly," not "tall and technical."
- Body: the same geometric sans family at a lighter weight, generous
  line-height.

## 4. Spacing & density

The airiest of the seven voices alongside editorial-warm, but structured
differently — favors floating, well-separated component "islands" over
editorial's dense text columns. Generous padding inside every component,
not just between sections.

## 5. Motion character

Gentle and slow. Micro-interactions (hover states, toggles) use soft,
low-amplitude movement — nothing snaps or pulses. This is the opposite
motion register from brutalist-mono: where that voice wants instant/
mechanical, this voice wants unhurried and continuous-feeling.

## 6. Borders & shadows

No visible borders at all where possible — components are separated by
extremely soft, highly diffused ambient shadows instead of a border line.
This is the single most distinctive trait of this voice: shadow does the job
borders do elsewhere. Shadow opacity should be very low (single digits) and
blur radius large, so the effect reads as "floating," not "framed."

## 7. Workflow facets in this voice

- **Component Builder**: Cards drop borders entirely in favor of a soft
  ambient shadow for separation. Buttons favor fully rounded (\`rounded-full\`)
  shapes with soft fills over the flagship voice's sharper \`rounded-lg\`
  rectangular buttons.
- **Page Composer**: layouts favor floating, well-spaced component islands
  rather than dense grids — err toward fewer things per view, more breathing
  room around each.
- **Theming Specialist**: raise \`--radius-scale\` toward its upper end (fully
  rounded pill shapes read as more "soft" than sharp rectangles), replace
  border-based separation with the ambient-shadow recipe, keep the accent
  genuinely muted (a saturated accent breaks this voice's calm register
  immediately).
- **Accessibility Reviewer**: this is one of the voices where contrast
  checking matters most (alongside corporate's subtle-elevation cues and
  startup's gradient contrast), precisely because everything here is
  intentionally soft and low-contrast by design — actively verify every
  text/background
  and icon/background pairing against WCAG AA, don't rely on "it looks
  readable." A muted pastel accent on a light grey background is a common
  place this voice fails contrast silently if not checked.
- **Motion specialist**: keep amplitude low across the board — even the
  "emphasized" motion in this voice (e.g. a successful-save confirmation)
  should be gentle relative to the other six voices' equivalents.

## 8. Do / Don't

- Do: use soft, diffused ambient shadows instead of borders for separation.
- Do: check contrast explicitly and often — this voice's calm aesthetic
  carries real a11y risk.
- Don't: add a visible hard border anywhere it can be avoided.
- Don't: use a saturated or high-chroma accent color.
- Don't: use fast/snappy motion — everything here should feel unhurried.

## 9. Pre-output checklist

- [ ] Background is silver-grey/white, no warmth or darkness
- [ ] Headings use a bold geometric sans, not the condensed display face
      other voices use — "big, round, friendly," not "tall and technical"
- [ ] Separation between elements uses soft shadow, not hard borders
- [ ] Accent color is muted, used only as a small highlight
- [ ] Every text/background and icon/background pairing checked against
      WCAG AA — don't assume, verify
- [ ] Motion amplitude is low and unhurried throughout
- [ ] Buttons/cards lean toward fully rounded rather than sharp corners
`,
  },
  {
    slug: "neon-cyberpunk",
    name: "Neon / Cyberpunk",
    description:
      'Near-black background with saturated multi-color neon glow, tight bold display type, high-intensity motion. For gaming, music, and entertainment products, or anything explicitly "cyberpunk," "neon," or "loud."',
    content: `---
name: dsgn-neon-cyberpunk
description: Near-black background with saturated multi-color neon glow, tight bold display type, high-intensity motion. For gaming, music, and entertainment products, or anything explicitly "cyberpunk," "neon," or "loud."
---

# Neon / Cyberpunk

## 1. Identity

The most intense of the seven voices — takes the flagship voice's single-cyan
glow-on-dark idea and turns the intensity up past what a professional
SaaS/dev-tool product would want, deliberately. Appropriate for gaming,
music, live-event, and entertainment contexts where "loud" is the correct
answer, not a mistake.

## 2. Color logic

- Background: near-black, slightly cooler/bluer than the flagship voice's
  \`--void\`.
- Accent: *multiple* saturated neon hues used simultaneously and layered —
  where most of the other six voices insist on one accent color (startup's
  two-hue gradient is the other exception), this is the one voice where
  combining cyan + magenta + violet (the same three hues already
  present in this repo's real token set, just used together instead of one
  at a time) is correct, via layered glows and gradient edges rather than
  large flat fills.
- Avoid muddy combinations — layer glows with real transparency/blur so
  colors blend at the edges rather than producing a flat, muddy mixed hue
  where they overlap.

## 3. Typography

- Display/headings: tight tracking, bold weight, high-contrast against the
  dark background — condensed like the flagship voice's Bebas Neue, but
  bolder and often combined with a neon text-shadow/glow effect on key
  headlines (used sparingly — glowing text on every heading reads as
  noisy, reserve it for the single most important headline per view).
- Body/meta: a clean sans or mono, kept quiet so it doesn't compete with the
  loud display type and glow effects.

## 4. Spacing & density

Denser and more layered than the flagship voice — this voice can support
overlapping elements, diagonal accents, and grid/scanline texture details
that the calmer voices should avoid.

## 5. Motion character

The highest-intensity *sustained* motion of the seven — glow pulses,
color-shifting accents, more elaborate scroll choreography are all in-bounds
here (startup's motion is punchier in short bursts, but doesn't sustain at
this intensity). Still built on the same real-world constraints as every
other voice though: animate \`transform\`/\`opacity\` only, and — because this
voice's motion is the most likely of the seven to be genuinely uncomfortable
for motion-sensitive
users — a \`prefers-reduced-motion\` fallback isn't optional polish here, it's
required.

## 6. Borders & shadows

Glow is the primary visual language, more than actual borders. Layer
multiple \`color-mix()\`-derived glows (see \`reference/tokens.md\`'s shadow
recipe pattern) at different colors and blur radii rather than a single flat
shadow. Thin borders where used should themselves carry a subtle glow rather
than being a plain flat line.

## 7. Workflow facets in this voice

- **Component Builder**: the registry's \`glow\` Button variant is the
  default here, not the exception reserved for one CTA — but vary which
  accent color the glow uses per section so the whole page doesn't read as
  monochrome-neon.
- **Page Composer**: layouts can be more visually dense and layered than
  the other six voices — overlapping glow elements, diagonal section
  breaks, and grid/scanline background texture are all appropriate here in
  a way they wouldn't be for the calmer voices.
- **Theming Specialist**: activate multiple accent hues simultaneously
  (unusual for this token system, which is built around one active
  \`data-accent\` at a time) by layering *additional* glow elements with
  explicit colors rather than trying to make the single \`--accent\` variable
  hold more than one hue at once — keep the semantic \`--accent\` token
  pointing at one primary hue for component consistency, and treat the
  extra neon colors as page-level decorative accents layered on top.
- **Accessibility Reviewer**: this voice's biggest a11y risk is
  motion-intensity, not contrast (dark background + saturated glow usually
  reads with plenty of contrast by construction) — prioritize the
  \`prefers-reduced-motion\` fallback above all else, and double-check that
  glow effects never fully obscure text at any point in an animation cycle.
- **Motion specialist**: this is the one voice where "more" motion is
  correct by default — but every animated effect still needs the reduced-
  motion fallback; intensity is a stylistic choice, accessibility isn't.

## 8. Do / Don't

- Do: layer 2-3 neon glow colors with real blur/transparency rather than
  flattening them into one mixed hue.
- Do: provide a genuinely reduced-motion fallback for every glow/pulse
  effect — treat this as required, not optional, given the intensity here.
- Don't: use flat, unblurred saturated fills as large background areas —
  the glow-layered look is the point, a solid neon-colored panel is not.
- Don't: apply a heavy glow effect to every heading on a page — reserve it
  for the single most important one per view.

## 9. Pre-output checklist

- [ ] Multiple accent hues are layered as glow, not flattened into one
      muddy mixed color
- [ ] Only the single most important headline per view gets a glow/shadow
      text effect
- [ ] Headings use tight-tracked, bold, condensed display type — bolder
      than the flagship voice's Bebas Neue, never a plain sans/serif
- [ ] Every pulsing/glowing animation has a \`prefers-reduced-motion\`
      fallback
- [ ] Glow effects never fully obscure text at any point in their cycle
- [ ] Semantic \`--accent\` token still points to one primary hue for
      component-level consistency
`,
  },
  {
    slug: "corporate",
    name: "Corporate",
    description:
      "Near-white/near-black neutral background, one restrained accent, generous whitespace, near-invisible shadows, system-native sans type. Apple/Google/Next.js-inspired — for enterprise SaaS, developer platforms, and anything that needs to read as high-craft and trustworthy rather than experimental.",
    content: `---
name: dsgn-corporate
description: Near-white/near-black neutral background, one restrained accent, generous whitespace, near-invisible shadows, system-native sans type. Apple/Google/Next.js-inspired — for enterprise SaaS, developer platforms, and anything that needs to read as high-craft and trustworthy rather than experimental.
---

# Corporate

## 1. Identity

The most restrained of the seven voices — takes cues from Apple's marketing
pages, Google's Material 3 surfaces, and Next.js's own docs site: confident
through restraint, not through loudness. Nothing here competes with the
content for attention. Reads as high-craft, considered, and safe to put in
front of an enterprise buyer — the opposite instinct from neon-cyberpunk's
"loud is correct," but arrived at deliberately, not from a lack of ideas.

## 2. Color logic

- Background: true near-white (\`#FAFAFA\`–\`#FFFFFF\`) in light mode, true
  near-black (\`#0A0A0B\`–\`#111113\`) in dark mode — neutral, not warm like
  editorial-warm's cream and not cool-tinted like neon-cyberpunk's void.
- Accent: exactly one, desaturated relative to the flagship voice's cyan —
  a muted blue or near-black is the default instinct, used sparingly and
  almost never as a large fill. Most of the interface should be neutral
  grayscale; the accent marks the one action per view that matters.
- Borders over shadows for separation where possible — a 1px neutral-gray
  hairline reads as more "engineered" than a soft shadow does.
- No gradients, no glow, no glass/backdrop-blur panels — those all read as
  "consumer/marketing" rather than "enterprise tool."

## 3. Typography

- System-native sans (the OS's own UI font stack, or a geometric grotesk
  that reads the same) for both headings and body — no condensed display
  face like the flagship voice's Bebas Neue. Headings are large through
  size and weight, not through stretching or all-caps.
- Tight, controlled letter-spacing — slightly negative tracking on large
  headings is correct here (the opposite of the flagship voice's wide
  uppercase tracking); body copy stays at normal tracking for readability.
- Fewer weights in play than other voices — regular and semibold cover most
  of the interface; reserve bold for true emphasis, not decoration.

## 4. Spacing & density

Generous but not airy in soft-minimal's floating-island sense — spacing
here reads as *precision*, not calm. Consistent, grid-aligned padding;
components line up to a shared baseline rather than drifting. Whitespace is
used to group related things, not just to create breathing room.

## 5. Motion character

Subtle and fast — 150–250ms, no bounce or overshoot easing. Motion here
should be nearly invisible if you're not looking for it: a fade, a small
scale, never a slide-and-settle. The instinct to check: if a reviewer would
describe the motion as "smooth" rather than notice it as an effect at all,
it's right for this voice.

## 6. Borders & shadows

Borders do almost all the separation work — a consistent 1px neutral border
(not the flagship voice's --rule on a dark glass panel, a genuinely flat
neutral gray) around cards, inputs, and containers. Shadows exist only as a
near-invisible single-digit-opacity ambient layer for true elevation (a
dropdown over content, a modal), never as a decorative glow — \`--glow-accent\`
should read as effectively off in this voice.

## 7. Workflow facets in this voice

- **Component Builder**: cards use a 1px neutral border, not a shadow, for
  their primary separation; reserve shadow for genuinely elevated surfaces
  (dropdowns, modals). Buttons favor a tight \`rounded-md\`, not the flagship
  voice's pill shapes, except where a pill is the platform-native pattern
  (a filter chip, a status badge).
- **Page Composer**: grid-aligned layouts with a strict, visible rhythm —
  err toward a systemized 8px spacing scale applied consistently rather than
  bespoke spacing per section.
- **Theming Specialist**: lower \`--radius-scale\` toward its default-to-sharp
  end, drop \`--glow-accent\` to near-zero, keep the accent genuinely singular
  and desaturated — a second bright color anywhere breaks this voice's
  restraint immediately.
- **Accessibility Reviewer**: the near-invisible shadow/border approach
  means elevation cues are subtle — verify a modal/dropdown is distinguishable
  from its background by more than opacity alone (a border or a real shadow,
  not just a 2% tint), and that focus states are clearly visible against
  the near-white/near-black backgrounds.
- **Motion specialist**: keep every transition under 250ms with linear or
  ease-out timing — no spring/bounce easing anywhere in this voice.

## 8. Do / Don't

- Do: use a single, desaturated accent color, reserved for the one action
  that matters per view.
- Do: use 1px neutral borders as the primary separation method.
- Don't: add glass/backdrop-blur panels, gradients, or decorative glow.
- Don't: use the flagship voice's condensed all-caps display type — system
  sans, size and weight for hierarchy instead.
- Don't: use bounce/spring easing or motion longer than ~250ms.

## 9. Pre-output checklist

- [ ] Background is neutral near-white/near-black, no warmth or color tint
- [ ] Exactly one accent color, desaturated, used sparingly
- [ ] Separation uses 1px neutral borders, not shadows, except for true
      elevation (dropdowns, modals)
- [ ] Headings use system-native sans at size/weight for hierarchy, not the
      condensed display face other voices use
- [ ] No gradients, glow, or glass/backdrop-blur panels anywhere
- [ ] Motion is under ~250ms with linear/ease-out timing, no bounce
- [ ] Spacing follows a consistent, grid-aligned rhythm
`,
  },
  {
    slug: "startup",
    name: "Startup",
    description:
      "High-saturation gradient accent, oversized confident type, energetic overshoot motion, bold claims in the hero. For product launches, marketing sites, and anything that needs to feel fast-moving and ambitious rather than settled.",
    content: `---
name: dsgn-startup
description: High-saturation gradient accent, oversized confident type, energetic overshoot motion, bold claims in the hero. For product launches, marketing sites, and anything that needs to feel fast-moving and ambitious rather than settled.
---

# Startup

## 1. Identity

The most ambitious-*feeling* of the seven voices — not the loudest in raw
color intensity (that's still neon-cyberpunk), but the one built to make a
first-time visitor feel like they've found something moving fast. Reads as
"we shipped this last week and it already works," the opposite instinct
from corporate's "this has been engineered and reviewed." Appropriate for
landing pages, product launches, and marketing sites where the job is
conversion and momentum, not enterprise trust-building.

## 2. Color logic

- Background: near-black or a very deep saturated tone (deep violet-black,
  not the flagship voice's neutral \`--void\`) — dark enough for a bright
  accent to pop, warmer/more colorful than the flagship's technical OLED.
- Accent: a bold gradient (two of the flagship voice's real hues — cyan
  into violet, or magenta into warm — not a single flat fill) used
  confidently and often: hero headlines, primary CTAs, stat callouts. Where
  corporate uses one desaturated color sparingly, this voice wants gradient
  accent everywhere the eye should land first.
- High contrast throughout — this voice doesn't do quiet secondary text;
  even muted copy should read clearly at a glance.

## 3. Typography

- Oversized, confident display type for headlines — bigger than the
  flagship voice's already-large headings, tight leading, often mixed
  weight (a thin word next to a bold one) for emphasis within a single
  line. This is the one voice where a headline breaking a "don't make text
  too big" instinct is often correct.
- Body copy stays legible and normal-weight — the size contrast between
  headline and body should be dramatic, not gradual.

## 4. Spacing & density

Punchy, not airy — sections are large and confident (big hero, big stat
row) but content within a section sits close together, creating a "dense
but not cluttered" feel very different from soft-minimal's floating
islands or corporate's grid precision. Whitespace is spent on section-level
breathing room, not evenly distributed everywhere.

## 5. Motion character

Fast and energetic, with real overshoot — spring/bounce easing is
*correct* here, unlike corporate's linear/ease-out-only rule. Hero elements
should feel like they arrive with momentum: a slight overshoot on scale-in,
a quick stagger across a stat row. This is the opposite motion register
from corporate: where that voice wants motion nearly invisible, this voice
wants it noticed, as long as it never blocks interaction.

## 6. Borders & shadows

Glow is a first-class tool here, more than the flagship voice's "sparing,
single accent" use — a hero CTA or headline can carry a real
\`shadow-glow\`-style effect (see \`button.tsx\`'s \`glow\` variant) without it
reading as excessive, because everything else in this voice already signals
"high energy." Borders, where used, can carry a gradient edge rather than a
flat neutral line.

## 7. Workflow facets in this voice

- **Component Builder**: primary CTAs default to the boldest available
  treatment (glow + gradient-leaning accent), not a quiet outline — this is
  the one voice where the flagship's restraint ("reserve glow for the one
  CTA per view") relaxes into "the hero CTA should be unmissable."
- **Page Composer**: front-load the boldest content — a big claim, a real
  number, a confident headline — above the fold; the hero section should do
  more visual work than any other voice's hero.
- **Theming Specialist**: raise \`--radius-scale\` toward pill shapes for
  buttons/badges (confident, friendly, fast), lean into a two-color
  gradient for the accent treatment rather than a single flat hue.
- **Accessibility Reviewer**: gradient text/fills need contrast checked at
  both ends of the gradient, not just the midpoint — verify the darkest
  point of a gradient-on-dark-background pairing still clears WCAG AA, since
  this voice's confidence can quietly break contrast at one edge of a
  gradient even when it looks fine at a glance.
- **Motion specialist**: use spring/overshoot easing for hero and CTA
  moments specifically; keep it faster and punchier than neon-cyberpunk's
  sustained high-intensity motion — this voice wants quick bursts of
  energy, not continuous intensity.

## 8. Do / Don't

- Do: use a confident two-color gradient accent on hero headlines and
  primary CTAs.
- Do: use spring/overshoot easing for hero-moment motion.
- Do: size headline type dramatically larger than body copy.
- Don't: spread the gradient accent everywhere uniformly — it should mark
  the highest-priority elements, not become wallpaper.
- Don't: use corporate's linear/no-bounce motion rule here — flat, no
  overshoot reads as the wrong voice entirely.

## 9. Pre-output checklist

- [ ] Hero headline is oversized and confident, noticeably larger than this
      voice's own body copy
- [ ] Primary CTA carries a bold gradient/glow treatment, not a quiet outline
- [ ] Motion on hero/CTA moments uses spring or overshoot easing
- [ ] Gradient contrast checked at both ends against WCAG AA, not just the
      midpoint
- [ ] Background is dark/saturated enough for the gradient accent to read
      clearly, not the flagship voice's neutral technical void
- [ ] Section-level whitespace is generous; within-section spacing stays
      punchy and close
`,
  },
  {
    slug: "terminal-phosphor",
    name: "World · Terminal / Phosphor",
    description:
      "World — green phosphor on near-black, monospace everything, faint scanlines; content presented as a live shell session with a working prompt. For developer portfolios, CLIs, dev tools and changelogs that want to feel like a terminal, not just look like one.",
    content: `---
name: dsgn-terminal-phosphor
description: World — green phosphor on near-black, monospace everything, faint scanlines; content presented as a live shell session with a working prompt. For developer portfolios, CLIs, dev tools and changelogs that want to feel like a terminal, not just look like one.
---

# Terminal / Phosphor (world)

## 1. Identity

A world, not just a voice: the page *is* a shell session. Content arrives as
the output of commands (\`whoami\`, \`cat about.txt\`, \`ls -la\`), and a real
prompt at the bottom accepts commands that drive the real site. The visual
layer is restrained — green on black, one amber secondary — because the
metaphor carries the personality. Read \`reference/worlds.md\` first.

## 2. Color logic

- Background: near-black with a green cast (\`#070b09\`), surface one step up
  (\`#0c1310\`). Never pure black — phosphor screens glow.
- Accent: phosphor green (\`#3ddc84\`) for prompts, links and the cursor;
  amber (\`#e0b341\`) as the single secondary (hashes, flags, timestamps).
- Text: pale green-white (\`#d5f7e1\`), secondary and faint steps tinted
  green, not grey.
- Map onto the existing raw tokens (\`--void\`, \`--surface\`, \`--ink*\`,
  \`--rule\`) — no new names.

## 3. Typography

- \`--font-display\`, \`--font-sans\` and \`--font-mono\` all point at one
  monospace (JetBrains Mono in the reference site). Headings are bold mono,
  sentence case, tight tracking — not uppercase display type.
- Load the world's font only when the world is active.

## 4. Spacing & density

Dense, line-based rhythm. Blocks are separated by one blank line's worth of
space, like real terminal output. Column alignment matters — use CSS grid
with \`ch\` units for \`ls\`-style rows rather than padding strings with spaces.

## 5. Motion character

Almost none, and mechanical when present: a \`steps(1)\` blinking cursor, an
optional slow "code rain" backdrop that speeds up with scroll. No easing
curves on content. Everything blinking stops under \`prefers-reduced-motion\`.

## 6. Borders & shadows

The page sits in one window chrome (title bar with three dots). Inside it:
no cards, no shadows — structure comes from prompts and indentation. A very
faint scanline overlay (multiply, ~18% black every 3px) is the only texture.

## 7. Workflow facets in this voice

- **Component Builder**: buttons become \`-> open <name>\` links or \`[ ]\`
  checkboxes; registry components are used sparingly inside the window
  (Kbd, Tooltip, Command).
- **Page Composer**: one long session per page; each section is
  \`<prompt> <command>\` followed by its output.
- **Theming Specialist**: one token block; radius near \`0.2\`; shadows off
  inside the window.
- **Accessibility Reviewer**: the prompt \`<input>\` needs a real
  \`aria-label\` ("Terminal command (type help)"); tables of \`ls\` output need
  \`role="table"\`/\`row\`/\`cell\`; green-on-black contrast must still pass AA
  for the faint step.
- **Motion specialist**: only the cursor and backdrop move.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | \`ls -la ~/projects --sort=time\` — perms, year, kind, link, \`# stat\` |
| Entity detail | \`cat <slug>/README.md\`, screenshot as a green-tinted \`imgcat\` that clears on hover |
| Entity headline | its defining commit message |
| Profile | \`whoami\` + \`cat about.txt\` |
| Timeline | \`cat experience.log\` with \`[period]\` prefixes |
| Skills | \`cat stack.json\` |
| Call to action | \`contact --list\`, easter egg \`sudo hire-me\` |
| Interaction | a working prompt: \`help\`, \`ls\`, \`open <entity>\`, \`cd <page>\`, \`world <name>\`, \`clear\`; ↑/↓ history |

## 9. Copy voice

Commit messages and shell output: lowercase, conventional-commit prefixes
(\`feat(planner):\`, \`perf(search):\`), arrows as \`->\`. Errors are honest
(\`open: foo: no such project (try ls)\`).

## 10. Do / Don't

- Do: make the prompt actually navigate — \`open x\` must reach the same page
  the default card links to.
- Do: derive every \`# stat\` comment from the content model.
- Don't: fake a terminal that only accepts the demo commands.
- Don't: use uppercase display type or soft shadows — that's a costume.

## 11. Pre-output checklist

- [ ] Every section is a prompt + output pair
- [ ] The prompt handles \`help\` and unknown commands
- [ ] \`ls\` rows align on a grid, and collapse sensibly at ~390px
- [ ] Cursor/backdrop stop under reduced motion
- [ ] Faint text still meets contrast on the green-black background
`,
  },
  {
    slug: "arcade-synth",
    name: "World · Arcade / Synth",
    description:
      "World — synthwave purple, pixel display type, chunky offset shadows; content presented as an arcade cabinet (title screen, level select, hi-scores, CONTINUE?). For games, playful portfolios, hackathon and event sites.",
    content: `---
name: dsgn-arcade-synth
description: World — synthwave purple, pixel display type, chunky offset shadows; content presented as an arcade cabinet (title screen, level select, hi-scores, CONTINUE?). For games, playful portfolios, hackathon and event sites.
---

# Arcade / Synth (world)

## 1. Identity

The site is a cabinet you just walked up to: a title screen with PRESS
START, a PLAYER 1 card, a level select where every entity is a cartridge,
a HI-SCORES table, and a CONTINUE? countdown as the call to action. Loud,
but organized — every element is still a real link to a real page. Read
\`reference/worlds.md\` first.

## 2. Color logic

- Background: deep synth purple (\`#170a35\`), surfaces a step lighter
  (\`#221050\`), with a vertical gradient toward magenta at the bottom.
- Accents: arcade yellow (\`#ffe14f\`) as primary, magenta (\`#ff4fd8\`) for
  shadows/outlines, cyan (\`#7af7ff\`) as secondary. Three accents is the
  ceiling.
- Text: white, with a lavender soft step (\`#e3d3ff\`).

## 3. Typography

- \`--font-display\`: a pixel face (Press Start 2P) — headings, buttons,
  labels only, never paragraphs.
- \`--font-mono\`: a readable bitmap-style mono (VT323) at a larger size for
  stats and meta.
- \`--font-sans\` stays a clean sans for body copy — pixel fonts at paragraph
  length are unreadable.

## 4. Spacing & density

Grid-first. Cartridges in a two-up grid for featured items, auto-fill for
the full list. Generous gaps (20px+) so the offset shadows don't collide.

## 5. Motion character

Snappy and discrete: \`steps()\` blinks on PRESS START and CONTINUE, a hard
2-4px press-down on buttons (shadow shrinks as the button moves). Backdrop:
pixel starfield + rolling perspective grid floor + striped sun, speeding up
with scroll. All of it off under reduced motion.

## 6. Borders & shadows

3px solid borders; hard offset shadows with zero blur in magenta
(\`4px 4px 0\`); square corners on buttons, slightly rounded "cartridge"
shells (14px top, 6px bottom). Screens inside cartridges get scanlines.

## 7. Workflow facets in this voice

- **Component Builder**: Button gets a pixel-font, square, offset-shadow
  treatment; Progress becomes a segmented cell bar.
- **Page Composer**: title screen → player card → level select → scores →
  continue. Each section opens with a \`★ HEADING\`.
- **Theming Specialist**: radius scale low (~0.3); shadows are hard
  offsets; \`--glow-accent\` can carry a neon edge.
- **Accessibility Reviewer**: segmented bars need an \`aria-label\` with the
  real value ("TECH 6 of 8"); blinking text must stop under reduced motion;
  pixel fonts only above ~11px.
- **Motion specialist**: discrete steps, not easing.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | LEVEL SELECT — cartridges labelled \`WORLD 1-1…\` |
| Entity headline | STAGE name + BOSS (the problem it beat) |
| Metric | \`★\` win line (the headline stat) + segmented stat bars derived from real fields |
| Profile | PLAYER 1 card: CLASS (role), GUILD (employer · city), lore (summary) |
| Timeline | HI-SCORES table |
| Call to action | CONTINUE? \`9\` → YES · EMAIL, plus secondary buttons |
| Interaction | ▶ PRESS START scrolls to the level select |

## 9. Copy voice

UPPERCASE for labels and headings, short game nouns (STAGE, BOSS, CLASS,
GUILD). Bosses are the real problem the entity solved ("a 116MB installer",
"the frozen spreadsheet").

## 10. Do / Don't

- Do: compute every bar from a field (stack size, recency).
- Do: keep body copy in a normal sans.
- Don't: invent scores, levels or XP that mean nothing.
- Don't: let three accents become five.

## 11. Pre-output checklist

- [ ] Title, player card, level select, scores and continue all exist
- [ ] Stat bars are derived and labelled for screen readers
- [ ] Pixel type never sets paragraphs
- [ ] Hard offset shadows, no blur
- [ ] Blinks and backdrop stop under reduced motion
`,
  },
  {
    slug: "iron-poster",
    name: "World · Iron / Poster",
    description:
      "World — warm paper, heavy grotesk display type, gym-poster orange, ink-black hard shadows; content presented as a training log (program sheet, session cards, PRs, training history). For fitness products, coaching, and personal sites with a \"progressive overload\" story.",
    content: `---
name: dsgn-iron-poster
description: World — warm paper, heavy grotesk display type, gym-poster orange, ink-black hard shadows; content presented as a training log (program sheet, session cards, PRs, training history). For fitness products, coaching, and personal sites with a "progressive overload" story.
---

# Iron / Poster (world)

## 1. Identity

A training log pinned to a gym wall: the project list is a program sheet,
each entity a session card with its sets ticked off, the headline result a
PR, the career a training history. The only light world of the five —
paper and ink, one hot orange. Read \`reference/worlds.md\` first.

## 2. Color logic

- Background: warm paper (\`#f6efe3\`), surfaces cream (\`#fffaf2\`).
- Ink: deep navy-black (\`#2d3142\`) used for text *and* borders and shadows.
- Accent: poster orange (\`#e36d3c\`), secondary chalk yellow (\`#ffd166\`).
- Because it's light, re-check every dark-tuned default (opacity-based
  heatmaps, glows) — they wash out on cream.

## 3. Typography

- \`--font-display\`: a heavy grotesk (Archivo Black), uppercase, tight
  tracking (\`-0.025em\`), line-height ~0.95.
- \`--font-sans\`: its text cut (Archivo) for body.
- \`--font-mono\`: for set numbers, splits and labels.

## 4. Spacing & density

Card grid (auto-fill ~300px). Inside cards, a dense list of sets with
dashed separators. Section headings are big and close to their content.

## 5. Motion character

Physical and brief: cards lift on hover by translating up-left while the
ink shadow grows. Backdrop: graph paper with slowly rising, spinning weight
plates labelled \`O(1)\`, \`O(n)\`, \`20 kg\` that speed up with scroll.

## 6. Borders & shadows

2px ink borders, \`6px 6px 0\` ink shadows (orange on hover), 14px radius on
cards, pills for buttons. Photos inside cards get a hairline border and a
"form check" tag.

## 7. Workflow facets in this voice

- **Component Builder**: Card gets the ink border + offset shadow; Badge
  becomes a day chip (\`MON\`); Table becomes the program sheet.
- **Page Composer**: header + athlete card → this week's sessions →
  training history → book a session.
- **Theming Specialist**: light-only token block; \`--shadow-ambient-raw\`
  as a hard ink offset.
- **Accessibility Reviewer**: the barbell visual needs an \`aria-label\`
  ("6 technologies"); orange on cream must pass for text (use the darker
  accent step for small text).
- **Motion specialist**: one short lift on hover; nothing loops on content.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | THE PROGRAM sheet: #, lift, split, sets, PR |
| Entity card | session card: day chip, lift name, screenshot ("form check"), barbell, one set per technology, PR, coach's note |
| Category | split, from the entity's \`kind\` (desktop app = Legs · heavy, dev tool = Pull, …) |
| Metric | PR = the headline stat |
| Profile | athlete card: role, club (employer), based, split |
| Timeline | training history, first achievement shown as the PR |
| Call to action | book a session |

## 9. Copy voice

Coach-like and dry: lift names ("Deadlift", "Cut phase"), short coach's
notes that restate a real fact in gym terms ("2 GB on the bar, 79 ms
reps").

## 10. Do / Don't

- Do: load the barbell with one plate per real technology.
- Do: keep the ink color doing triple duty (text, border, shadow).
- Don't: invent weights, reps or timings that aren't derived.
- Don't: reuse dark-world opacity values on this light palette.

## 11. Pre-output checklist

- [ ] Program sheet + session cards + history + CTA present
- [ ] Sets and plates come from the real stack
- [ ] Text contrast passes on cream (small orange text especially)
- [ ] Hover lift is the only content motion
- [ ] Table collapses to name + PR at ~390px
`,
  },
  {
    slug: "pit-lane",
    name: "World · Pit Lane",
    description:
      "World — asphalt black, italic condensed display type, yellow and red, checkered strip; content presented as a race weekend (timing tower, onboard camera, team radio, race control). For motorsport-adjacent products, performance-focused dev tools, and portfolios that sell speed.",
    content: `---
name: dsgn-pit-lane
description: World — asphalt black, italic condensed display type, yellow and red, checkered strip; content presented as a race weekend (timing tower, onboard camera, team radio, race control). For motorsport-adjacent products, performance-focused dev tools, and portfolios that sell speed.
---

# Pit Lane (world)

## 1. Identity

A race weekend broadcast: a timing tower down the side, an onboard camera
for whichever car you pick, team radio quotes, race control messages and a
driver card. Fast, slanted, high-contrast. Read \`reference/worlds.md\`
first. Keep it generic motorsport — no real team, series or driver names,
numbers or liveries.

## 2. Color logic

- Background: asphalt (\`#0f1012\`), surfaces \`#17181c\`, tower rows a step
  darker (\`#0a0a0c\`).
- Accents: signal yellow (\`#ffd60a\`) primary, racing red (\`#ff2a3c\`)
  secondary. White for the checkered strip.
- Tyre compounds use their own fixed colors (red/yellow/white/green/blue)
  as data, not decoration.

## 3. Typography

- \`--font-display\`: an italic condensed heavy face (Barlow Condensed 800
  italic), uppercase.
- \`--font-sans\`: its text family (Barlow).
- \`--font-mono\`: gaps, lap counters, labels.

## 4. Spacing & density

Broadcast density: a sticky timing tower (~360px) beside a wide content
column. On phones the tower stacks above, and picking a car scrolls the
onboard view into place.

## 5. Motion character

Directional: horizontal speed streaks in the backdrop that rush when you
scroll; a brief blur-in when the onboard camera switches; skewed buttons
that nudge right on hover. Off under reduced motion.

## 6. Borders & shadows

Hard edges, almost no radius. A 4px colored rule down the tower's left
edge, \`inset 4px 0 0\` highlight on the active row, a checkered strip across
the top. Buttons \`skewX(-10deg)\`.

## 7. Workflow facets in this voice

- **Component Builder**: Table becomes the timing tower (buttons for rows
  when pickable); Badge becomes a tyre compound chip; Button is skewed.
- **Page Composer**: driver card → tower + race control/team radio →
  career → "box, box" CTA. Projects page: classification + onboard.
- **Theming Specialist**: radius near \`0.1\`; no ambient shadows.
- **Accessibility Reviewer**: pickable rows are \`<button aria-pressed>\`;
  the onboard region is \`aria-live="polite"\`; tyre chips have a \`title\`
  with the compound name.
- **Motion specialist**: motion reads as speed — horizontal, short.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | timing tower / classification: POS, NO, DRIVER, TYRE, GAP |
| Entity detail | onboard camera (screenshot) + team radio + setup (stack) + fastest lap (stat) |
| Category | tyre compound from \`kind\` |
| Entity headline | team radio line |
| Recent activity | race control messages (\`LAP 42 · CAR 04 (SELECTA): …\`) |
| Profile | driver card with a large outlined number |
| Timeline | career by season |
| Call to action | "Box, box" |

## 9. Copy voice

Radio-clipped and calm under pressure: "Copy, building the set now. Drop in
32 bars." Race control messages in uppercase. Gaps and lap numbers are
labels, never presented as a measurement of the work.

## 10. Do / Don't

- Do: make the tower pickable on the classification page.
- Do: derive tyre compounds from a real field.
- Don't: use real driver numbers, team names, liveries or series branding.
- Don't: put a real-looking time next to a claim it doesn't measure.

## 11. Pre-output checklist

- [ ] Tower + onboard + radio + race control + career + CTA present
- [ ] Row pick updates the onboard and scrolls to it on phones
- [ ] No real-world motorsport trademarks or numbers
- [ ] Skewed buttons stay legible; focus ring visible on dark asphalt
- [ ] Streaks and camera blur stop under reduced motion
`,
  },
  {
    slug: "night-shift",
    name: "World · Night Shift",
    description:
      "World — lavender night sky, rounded friendly type, soft large radii, a moon and a peeking cat; content presented as a night journal and a polaroid wall. For personal sites, indie products and creative portfolios that should feel warm and human rather than corporate.",
    content: `---
name: dsgn-night-shift
description: World — lavender night sky, rounded friendly type, soft large radii, a moon and a peeking cat; content presented as a night journal and a polaroid wall. For personal sites, indie products and creative portfolios that should feel warm and human rather than corporate.
---

# Night Shift (world)

## 1. Identity

Late-night and personal: the home page is a journal with timestamped
entries, the project list is a wall of taped polaroids with a note on each,
and a small character (a cat) gives a verdict. Whimsy is allowed exactly
where it's obviously whimsy; facts stay facts. Read \`reference/worlds.md\`
first.

## 2. Color logic

- Background: a vertical gradient from deep indigo (\`#211a42\`) to dusk
  violet (\`#6a4f8f\`), fixed so it doesn't scroll away.
- Accents: mint (\`#a8f0d1\`) primary, moon yellow (\`#ffd84f\`) secondary,
  blush (\`#f2a7c3\`) tertiary.
- Polaroid paper is warm off-white (\`#fbf7ee\`) with indigo caption text.

## 3. Typography

- \`--font-display\`: a rounded geometric (Fredoka), sentence case, not
  uppercase.
- \`--font-sans\`: a friendly humanist (Nunito) at a slightly larger body
  size.
- Timestamps in the display face, in the moon yellow.

## 4. Spacing & density

Airy and single-column for the journal (~780px measure); a loose
auto-fill grid for the polaroid wall with room for tilt and tape.

## 5. Motion character

Slow and ambient: twinkling stars, the occasional shooting star, a moon
that drifts with scroll; polaroids straighten and lift slightly on hover;
the cat blinks and its eyes follow the cursor. All ambient motion stops
under reduced motion.

## 6. Borders & shadows

Large radii (20px+) on journal cards, pill buttons, soft long shadows under
polaroids, translucent surfaces over the sky. No hard edges anywhere.

## 7. Workflow facets in this voice

- **Component Builder**: Card becomes a journal entry or polaroid; Avatar
  gets a moon-yellow ring.
- **Page Composer**: "hi, I'm…" note → recent entries → where I am by day
  → leave a note.
- **Theming Specialist**: radius scale high (~1.8); soft ambient shadows.
- **Accessibility Reviewer**: the decorative cat is a real \`<button>\` with
  an \`aria-label\` if it's interactive; emoji ratings get an \`aria-label\`
  ("4 of 5 paws"); mint on indigo must pass for links.
- **Motion specialist**: ambient, slow, never on the text itself.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | polaroid wall: photo (screenshot), caption, note on the back |
| Entity headline | journal entry with a timestamp |
| Metric | the fact inside the entry ("search went from 1.8 seconds to 79 milliseconds") + paws derived from a real field |
| Profile | "hi, I'm…" with a short day/night line |
| Timeline | "where I am by day" |
| Call to action | "leave a note" |

## 9. Copy voice

Lowercase, first person, a little tired and fond. The cat's verdict is the
one place jokes go ("knocked the router off the desk to test it"). Never
turn a joke into a claim about the work.

## 10. Do / Don't

- Do: keep every number in an entry true to the content model.
- Do: give imageless entities a designed blank (stat on a dusk gradient).
- Don't: let whimsy invent metrics or users.
- Don't: use uppercase display type or hard edges.

## 11. Pre-output checklist

- [ ] Journal, polaroid wall, day job and CTA present
- [ ] Polaroid photos crop to a consistent ratio (\`height: auto\` with an
      \`aspect-ratio\`, or the \`height\` attribute wins)
- [ ] Ratings and the cat are labelled for screen readers
- [ ] Ambient motion stops under reduced motion
- [ ] Contrast passes for mint and blush text on the sky
`,
  },
];

const REFERENCE_DOCS = [
  {
    file: "reference/philosophy-summary.md",
    title: "Philosophy summary",
    body: "Condensed from philosophy/AGENTS.md — ten rules extracted from decisions that actually shipped in four real apps, not aspirational values.",
  },
  {
    file: "reference/component-registry.md",
    title: "Component registry",
    body: "The real 36 UI components plus utils, sourced from packages/registry/registry.json and each component's actual source — real prop names, real variants.",
  },
  {
    file: "reference/tokens.md",
    title: "Design tokens",
    body: "The site's real CSS custom properties from apps/site/app/globals.css, and the raw-value → semantic-alias → Tailwind-token indirection every style agent reskins through.",
  },
  {
    file: "reference/worlds.md",
    title: "Worlds",
    body: "Building one content model in several worlds — the metaphor map, the copy dictionary keyed by the same ids, derived visuals, and the pre-paint/URL/portal mechanics.",
  },
  {
    file: "reference/workflow-checklist.md",
    title: "Workflow checklist",
    body: "What each of the five workflow facets (build/compose/theme/a11y-review/motion) concretely means, grounded in this repo's real motion primitives and performance guardrails.",
  },
] as const;

export default function SkillPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-32">
      <Reveal>
        <Eyebrow>Skill · dsgn</Eyebrow>
        <h1 className="mt-6 font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
          Give Claude the philosophy.
        </h1>
        <p className="mt-4 text-muted-foreground">
          A Claude Code Agent Skill: install it and Claude builds UI using this project&rsquo;s real
          design philosophy and component registry — not invented conventions — routed
          automatically to one of seven distinct visual voices based on what you&rsquo;re actually
          building. Grounded in the same files everything else on this site is grounded in:{" "}
          <Link href="/philosophy" className="text-accent hover:underline">
            the philosophy docs
          </Link>
          ,{" "}
          <Link href="/components" className="text-accent hover:underline">
            the registry
          </Link>
          , and{" "}
          <Link href="/theming" className="text-accent hover:underline">
            the token system
          </Link>
          .
        </p>
        <div className="mt-6">
          <Magnetic>
            <Button asChild variant="accent" size="lg" className="rounded-full px-7 shadow-glow">
              <a href="/downloads/dsgn-skill.zip" download="dsgn-skill.zip">
                Download .zip
              </a>
            </Button>
          </Magnetic>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Install it</h2>
          <p className="text-sm text-muted-foreground">
            No terminal? The download above unzips straight into a{" "}
            <code className="font-mono text-accent">dsgn/</code> folder — drop it into your Claude
            Code skills directory and you&rsquo;re done. Prefer a one-liner instead? The skill is a
            folder of markdown, nothing to build — pull just{" "}
            <code className="font-mono text-accent">skills/dsgn</code> out of the repo (no full
            clone needed).
          </p>
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 font-mono text-xs text-muted-foreground">
                already using the dsgn CLI? — bundled, works offline
              </div>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
                  <code>{CLI_SKILL_GLOBAL}</code>
                </pre>
                <CopyButton text={CLI_SKILL_GLOBAL} className="absolute right-3 top-3" />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                or <code className="font-mono text-accent">{CLI_SKILL_PROJECT}</code> for this
                project only — same CLI that installs components, now installs the skill too.
              </p>
            </div>
            <div>
              <div className="mb-1.5 font-mono text-xs text-muted-foreground">
                global — every project
              </div>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
                  <code>{DEGIT_COMMAND}</code>
                </pre>
                <CopyButton text={DEGIT_COMMAND} className="absolute right-3 top-3" />
              </div>
            </div>
            <div>
              <div className="mb-1.5 font-mono text-xs text-muted-foreground">
                project-scoped — this project only
              </div>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
                  <code>{DEGIT_COMMAND_PROJECT}</code>
                </pre>
                <CopyButton text={DEGIT_COMMAND_PROJECT} className="absolute right-3 top-3" />
              </div>
            </div>
            <div>
              <div className="mb-1.5 font-mono text-xs text-muted-foreground">
                no npx / degit unavailable — plain git
              </div>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
                  <code>{CLONE_COMMAND}</code>
                </pre>
                <CopyButton text={CLONE_COMMAND} className="absolute right-3 top-3" />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Not using Claude Code?</h2>
          <p className="text-sm text-muted-foreground">
            Same router, seven personas, and reference docs — built as real multi-file structure for
            tools that support it (Cursor, Windsurf, Gemini CLI), shaped around what each format
            actually documents rather than one flattened file everywhere.
          </p>
          <div className="space-y-3">
            {OTHER_TOOLS.map(({ flag, tool, target, note }) => {
              const command = `npx @dhruvchoudhary/dsgn skill ${flag}`;
              return (
                <div key={flag}>
                  <div className="mb-1.5 font-mono text-xs text-muted-foreground">
                    {tool} — installs to <code className="text-accent">{target}</code>
                  </div>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
                      <code>{command}</code>
                    </pre>
                    <CopyButton text={command} className="absolute right-3 top-3" />
                  </div>
                  {note ? <p className="mt-1.5 text-xs text-muted-foreground">{note}</p> : null}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Non-destructive by default, like every <code className="font-mono text-accent">dsgn</code>{" "}
            install command — pass <code className="font-mono text-accent">--overwrite</code> if the
            target file already exists and you want it replaced.
          </p>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">The router — SKILL.md</h2>
          <p className="text-sm text-muted-foreground">
            The entry point Claude reads first. Full file also covers source-of-truth references
            and how the handoff to a sub-agent works when one is available.
          </p>
          <div className="relative">
            <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
              <code>{SKILL_MD_PREVIEW}</code>
            </pre>
            <CopyButton text={SKILL_MD_PREVIEW} className="absolute right-3 top-3" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={160}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">The seven style agents</h2>
          <p className="text-sm text-muted-foreground">
            Each is a complete, self-contained persona — a visual style plus that style&rsquo;s
            take on all five workflow facets. None contradict the philosophy; they only differ in
            what the UI looks and moves like.
          </p>
          <Frame glow={false}>
            <Accordion type="single" collapsible className="w-full">
              {AGENTS.map((agent) => (
                <AccordionItem key={agent.slug} value={agent.slug}>
                  <AccordionTrigger>
                    <div className="text-left">
                      <div className="font-display text-base uppercase tracking-wide">
                        {agent.name}
                      </div>
                      <div className="mt-1 text-xs font-normal normal-case text-muted-foreground">
                        {agent.description}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mb-1.5 font-mono text-xs text-muted-foreground">
                      agents/{agent.slug}.md
                    </div>
                    <div className="relative">
                      <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
                        <code>{agent.content}</code>
                      </pre>
                      <CopyButton text={agent.content} className="absolute right-3 top-3" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Frame>
        </div>
      </Reveal>

      <Reveal delay={180}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">A worked example</h2>
          <p className="text-sm text-muted-foreground">
            Illustrative, not a screenshot of a real session — but every claim in it (the routing
            rule applied, the persona&rsquo;s stated behavior, the code produced) is real, pulled
            from the actual files above.
          </p>
          <Frame glow={false} className="space-y-5">
            <div>
              <div className="mb-1.5 font-mono text-xs text-muted-foreground">you</div>
              <p className="rounded-lg border border-border bg-card p-4 text-sm">
                I&rsquo;m starting a new project — a sleep and meditation tracker. No design system
                yet, just a blank Next.js + Tailwind app. Build me a session-summary card.
              </p>
            </div>

            <div>
              <div className="mb-1.5 font-mono text-xs text-muted-foreground">
                router — skill.md, applied in order
              </div>
              <div className="space-y-1.5 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                <p>
                  <span className="font-mono text-accent">1. explicit request</span> — no style
                  named. Skip.
                </p>
                <p>
                  <span className="font-mono text-accent">2. existing brand cues</span> — fresh
                  scaffold, nothing to match. Skip.
                </p>
                <p>
                  <span className="font-mono text-accent">3. project type</span> — a sleep/
                  meditation tracker is a wellness product →{" "}
                  <span className="text-foreground">Soft / Minimal</span>.
                </p>
              </div>
            </div>

            <div>
              <div className="mb-1.5 font-mono text-xs text-muted-foreground">
                soft-minimal — component builder facet
              </div>
              <p className="text-sm text-muted-foreground">
                Its own file: &ldquo;Cards drop borders entirely in favor of a soft ambient shadow
                for separation. Buttons favor fully rounded (
                <code className="font-mono text-accent">rounded-full</code>) shapes with soft
                fills.&rdquo; Applied to the real registry components:
              </p>
              <div className="relative mt-2">
                <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
                  <code>{WORKED_EXAMPLE_CODE}</code>
                </pre>
                <CopyButton text={WORKED_EXAMPLE_CODE} className="absolute right-3 top-3" />
              </div>
            </div>
          </Frame>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Reference docs</h2>
          <p className="text-sm text-muted-foreground">
            What grounds every persona in real repo content instead of invented conventions.
          </p>
          <Frame glow={false}>
            <div className="space-y-3">
              {REFERENCE_DOCS.map((doc) => (
                <div
                  key={doc.file}
                  className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <div className="shrink-0 sm:w-40">
                    <span className="font-mono text-sm text-accent">{doc.file}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{doc.body}</span>
                </div>
              ))}
            </div>
          </Frame>
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="https://github.com/dhruvch1244/design/tree/main/skills/dsgn"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-accent hover:underline"
          >
            Browse the full package on GitHub ↗
          </a>
          <Link href="/components" className="text-sm text-accent hover:underline">
            ← See the components this skill installs
          </Link>
          <Link href="/best-practices" className="text-sm text-accent hover:underline">
            Each voice&rsquo;s Do/Don&rsquo;t + checklist →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
