// Real, separately-built sites that install dsgn from npm like any other
// consumer would — proof of what the registry produces in a fresh project,
// not a demo page inside this site's own component gallery. Each one is a
// genuine external repo; /showcase links out to both the live embed and the
// repo, and the repo itself carries the exact prompt that built it (its
// README and its first commit message, verbatim, no edits).
export interface ShowcaseSite {
  slug: string;
  name: string;
  org: string;
  tagline: string;
  category: string;
  voice: string;
  componentCount: number;
  liveHref: string;
  repoHref: string;
  screenshot: string;
  // Verbatim, no edits — the same text given to the agent that built the
  // site, byte-for-byte identical to what's in the repo's own README and
  // first commit message. Never paraphrase this field.
  prompt: string;
}

export const SHOWCASE_SITES: ShowcaseSite[] = [
  {
    slug: "halyard",
    name: "Halyard",
    org: "Northbridge Labs",
    tagline:
      "A fictional product-analytics workspace — five views, a hand-drawn traffic chart, and a filterable event schema registry.",
    category: "SaaS analytics dashboard",
    voice: "corporate",
    componentCount: 29,
    liveHref: "/design-analytics",
    repoHref: "https://github.com/Dhruvch1244/dsgn-showcase-analytics",
    screenshot: "/showcase/halyard.png",
    prompt: `Build a standalone showcase/demo site that proves out dsgn, a copy-paste component registry + design-philosophy Claude Code skill published on npm as @dhruvchoudhary/dsgn (source monorepo at C:\\Users\\dhruv\\workspace\\Design, live registry served from https://design.dhruvchoudhary.com/r, docs/marketing site at https://design.dhruvchoudhary.com). The goal is a real, working example of what someone gets when they install dsgn into a fresh project — this will eventually be screenshotted and used to advertise the tool alongside the prompt/skill that built it, so it needs to actually look good, not just function.

Where to build it: a brand-new standalone Next.js project in a fresh sibling directory, C:\\Users\\dhruv\\workspace\\dsgn-showcase-analytics — NOT inside the C:\\Users\\dhruv\\workspace\\Design monorepo. This needs to be a genuine external consumer of the published package (npx @dhruvchoudhary/dsgn add <component>), not an internal workspace shortcut — that's the actual point of building it as a separate project: it's the first real end-to-end test of someone installing this tool fresh.

Concept — read this carefully, it's a hard constraint: an ORIGINAL SaaS analytics dashboard UI for an invented product with an invented name. Real, plausible-looking content (metrics, chart placeholders, a data table of rows, filters) is fine and expected — but do NOT use any real company's name, logo, actual brand colors, or copied marketing copy. Nothing that could read as "this is secretly Stripe's dashboard" or similar. Invent the product name and all copy yourself.

Stack: Next.js (App Router), React, Tailwind CSS v4, TypeScript — same stack as the source monorepo, so the installed dsgn components work without adaptation. Scaffold it fresh (create-next-app or equivalent with Tailwind v4 + TypeScript + App Router).

Style voice: use the corporate voice (Apple/Google/Next.js-inspired: neutral, restrained, near-invisible shadows) — read philosophy/ and skills/dsgn/agents/corporate.md in the source monorepo for its real documented rules before styling anything, don't guess at what "corporate" means. The source monorepo's apps/site/app/globals.css also has real CSS custom-property values for every voice/accent if you want a concrete starting palette — the philosophy docs still take precedence for the actual design rules.

Install real components via the real CLI (npx @dhruvchoudhary/dsgn init then npx @dhruvchoudhary/dsgn add <component> <component> ...) — this is dogfooding, don't hand-copy component source files. Build a dashboard that plausibly uses a good spread of the 36-component registry: sidebar/top nav, stat cards, a data table with row actions, filter controls (a Combobox or Select, a ToggleGroup, maybe a Slider for a range filter), a Sheet or Dialog for a settings/detail panel, Tabs for switching between views, a Toast for confirming an action, Tooltips on icon-only buttons, and a command palette (Command/CommandDialog) for search — check skills/dsgn/reference/component-registry.md in the source monorepo for the full real list and real prop signatures before using any component; don't invent props that don't exist.

Verify before reporting done: dev server runs with no console/page errors, tsc --noEmit clean, visually reviewed at both a desktop (1280px+) and phone (390px) viewport — check for horizontal overflow or broken layouts at mobile width specifically. Use Playwright (already available via npx playwright) or the Chrome extension tools if connected, whichever is faster to set up.

Do not commit, push, or deploy anything — this is local-only for now, I'll review it with the user before any of that. When done, report back: what you built, which components you installed, any real bugs or friction you hit in the actual dsgn CLI/registry while dogfooding it (this is valuable signal for the tool itself, distinct from the showcase site's own quality), and the local dev server URL/port so it can be reviewed. Keep the final report under 400 words — I don't need a blow-by-blow, I need the outcome and anything that surprised you.`,
  },
  {
    slug: "alcove",
    name: "Alcove",
    org: "Fernway Studio",
    tagline:
      "A fictional planning tool for a small product team — a Kanban board, a grouped list, and a person-lane timeline, all sharing one non-destructive overlay model.",
    category: "Project / Kanban board",
    voice: "soft-minimal",
    componentCount: 25,
    liveHref: "/design-tasks",
    repoHref: "https://github.com/Dhruvch1244/dsgn-showcase-tasks",
    screenshot: "/showcase/alcove.png",
    prompt: `Build a standalone showcase/demo site that proves out dsgn, a copy-paste component registry + design-philosophy Claude Code skill published on npm as @dhruvchoudhary/dsgn (source monorepo at C:\\Users\\dhruv\\workspace\\Design, live registry served from https://design.dhruvchoudhary.com/r, docs/marketing site at https://design.dhruvchoudhary.com). This is showcase #4 of 5 — the first, "Halyard" (a SaaS analytics dashboard in the corporate voice), already shipped at C:\\Users\\dhruv\\workspace\\dsgn-showcase-analytics and is live at https://design.dhruvchoudhary.com/design-analytics — skim its README for the pattern (don't copy its content, it's a different concept). The goal is a real, working example of what someone gets when they install dsgn into a fresh project — this will be screenshotted and used to advertise the tool alongside the prompt that built it, so it needs to actually look good, not just function.

Where to build it: a brand-new standalone Next.js project in a fresh sibling directory, C:\\Users\\dhruv\\workspace\\dsgn-showcase-tasks — NOT inside the C:\\Users\\dhruv\\workspace\\Design monorepo. This must be a genuine external consumer of the published package (npx @dhruvchoudhary/dsgn add <component>), not a hand-copied shortcut.

Concept — hard constraint: an ORIGINAL project/task management tool for an invented product with an invented name (do not reuse "Halyard" or "Northbridge Labs"). A Kanban-style board (columns: e.g. Backlog/In Progress/Review/Done), task cards with assignees/labels/due dates, a task detail view. Real, plausible-looking content (task titles, people, labels) is fine and expected — but do NOT use any real company's name, logo, actual brand colors, or copied copy. Nothing that could read as a clone of a specific real tool's (Linear, Trello, Jira, Asana, etc.) exact branding — an original visual identity in this functional category is fine and expected, a copy of one specific real tool's brand is not.

Stack: Next.js (App Router), React, Tailwind CSS v4, TypeScript — same stack as the source monorepo. Scaffold fresh via create-next-app with Tailwind v4 + TypeScript + App Router.

Style voice: use the soft-minimal voice — read philosophy/ and skills/dsgn/agents/soft-minimal.md in the source monorepo for its real documented rules before styling anything. The source monorepo's apps/site/app/globals.css has real CSS custom-property values for the soft-minimal voice under [data-voice="soft-minimal"] if you want a concrete starting palette — the philosophy docs still take precedence for the actual rules.

Install real components via the real CLI (npx @dhruvchoudhary/dsgn init then npx @dhruvchoudhary/dsgn add <component> <component> ...) — dogfooding, don't hand-copy source. Halyard already exercised Table, Combobox, Toast, Sheet, ToggleGroup, Slider, Progress, Command heavily — for this app, lean toward a different spread so the 5 showcases collectively cover the registry: DropdownMenu, Context Menu (card right-click actions), Avatar/AvatarFallback (assignees), Progress (subtask completion), Checkbox (subtask list), Tabs (board/list/timeline view switcher), Command or CommandDialog (quick-add / jump-to-task), Sheet or Dialog (task detail panel), HoverCard (assignee preview on hover), ScrollArea (each Kanban column's scrollable card list), Collapsible (collapsed subtask groups), Badge (labels/priority), Separator. Check skills/dsgn/reference/component-registry.md in the source monorepo for the full real list and real prop signatures before using any component; don't invent props that don't exist.

Verify before reporting done: dev server runs with no console/page errors, tsc --noEmit clean, visually reviewed at both a desktop (1280px+) and phone (390px) viewport — check for horizontal overflow or broken layouts at mobile width specifically (a Kanban board is a real mobile-layout challenge — decide deliberately how it degrades, don't just let columns overflow silently). Use Playwright.

Do not commit, push, or deploy anything — this is local-only for now, I'll review it before any of that. When done, report back: what you built (product name, concept), which components you installed, the local dev server URL/port for review, and any real bugs or friction you hit in the actual dsgn CLI/registry while dogfooding it (distinct signal from the showcase's own quality — flag these clearly, they may need fixing upstream). Keep the final report under 400 words.`,
  },
];
