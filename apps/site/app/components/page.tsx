import type { Metadata } from "next";
import { Link } from "@/components/link";
import { Button } from "@/components/dsgn/button";
import { Badge } from "@/components/dsgn/badge";
import { Switch } from "@/components/dsgn/switch";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Checkbox } from "@/components/dsgn/checkbox";
import { Progress } from "@/components/dsgn/progress";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { CursorGlow } from "@/components/motion/cursor-glow";
import { SectionSearchButton } from "@/components/section-search-button";
import { COMPONENTS_DATA } from "@/lib/components-data";

export const metadata: Metadata = {
  title: "Components — Dhruv Choudhary",
  description: "Live components from the dsgn registry, installed with the dsgn CLI.",
};

const SEARCH_SECTIONS = COMPONENTS_DATA.map(({ slug, title }) => ({ id: slug, text: title }));

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  className: "h-5 w-5",
} as const;

/** One tile in the visual gallery grid — a small, mostly-static preview,
 * linking to that component's own dedicated page for the full interactive
 * version, variants, and install command. */
function GalleryTile({ slug, label, children }: { slug: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={`/components/${slug}`} className="group block">
      <Frame
        glow={false}
        className="flex h-28 flex-col items-center justify-center gap-3 transition-colors duration-300 ease-fluid group-hover:border-accent"
      >
        {/* inert: these mini previews are real interactive widgets (Switch,
            Checkbox, Progress) rendered purely for visual demo — the actual
            interactive/navigable element is the outer Link, whose text
            content is the label span below. Without inert, a screen reader
            or keyboard user would still tab into an unlabeled toggle/checkbox
            that does nothing meaningful here. */}
        <div
          inert
          className="flex h-8 items-center justify-center text-muted-foreground group-hover:text-accent"
        >
          {children}
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-foreground">{label}</span>
      </Frame>
    </Link>
  );
}

export default function ComponentsPage() {
  return (
    <>
      <Reveal>
        <CursorGlow className="rounded-[2rem] py-4">
          <Eyebrow>Registry · dsgn</Eyebrow>
          <h1 className="mt-6 max-w-2xl font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
            Components you own the moment they land.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            These aren&rsquo;t imported from a package at runtime — the dsgn CLI copies the source
            straight into your project, the same way it copied them into this site. Edit the file
            freely; there&rsquo;s nothing to eject later.
          </p>
          <Link
            href="/examples"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            See these composed into small real apps →
          </Link>
          <span className="mx-2 text-muted-foreground">·</span>
          <Link href="/theming" className="text-sm text-accent hover:underline">
            Reskin all of it for your own brand →
          </Link>
          {/* Sidebar (ComponentsSidebar in layout.tsx) covers search on lg+;
              below that it's hidden, so this modal search is the only way
              in on mobile. */}
          <div className="mt-6 lg:hidden">
            <SectionSearchButton
              sections={SEARCH_SECTIONS}
              heading="Components"
              placeholder="Jump to a component..."
              label="Search components"
            />
          </div>
        </CursorGlow>
      </Reveal>

      {/* Visual overview — a gallery of small previews. Click any tile to
          open that component's own page. */}
      <Reveal delay={100}>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <GalleryTile slug="button" label="Button">
            <Button size="sm" variant="accent">
              Button
            </Button>
          </GalleryTile>
          <GalleryTile slug="card" label="Card">
            <div className="h-8 w-14 space-y-1.5 rounded-md border border-border p-1.5">
              <div className="h-1 w-full rounded-full bg-muted-foreground/40" />
              <div className="h-1 w-2/3 rounded-full bg-muted-foreground/25" />
            </div>
          </GalleryTile>
          <GalleryTile slug="badge" label="Badge">
            <Badge variant="accent">Badge</Badge>
          </GalleryTile>
          <GalleryTile slug="input" label="Input">
            <div className="h-7 w-16 rounded-md border border-border" />
          </GalleryTile>
          <GalleryTile slug="command" label="Command">
            <svg {...ICON_PROPS}>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
          </GalleryTile>
          <GalleryTile slug="textarea" label="Textarea">
            <div className="h-9 w-16 space-y-1 rounded-md border border-border p-1.5">
              <div className="h-1 w-full rounded-full bg-muted-foreground/30" />
              <div className="h-1 w-full rounded-full bg-muted-foreground/20" />
            </div>
          </GalleryTile>
          <GalleryTile slug="switch" label="Switch">
            <Switch defaultChecked className="scale-90" />
          </GalleryTile>
          <GalleryTile slug="tooltip" label="Tooltip">
            <svg {...ICON_PROPS}>
              <path d="M4 5h16v10H9l-4 4v-4H4z" />
            </svg>
          </GalleryTile>
          <GalleryTile slug="tabs" label="Tabs">
            <div className="flex gap-1 rounded-full bg-muted p-1">
              <div className="h-5 w-8 rounded-full bg-background" />
              <div className="h-5 w-8 rounded-full" />
            </div>
          </GalleryTile>
          <GalleryTile slug="select" label="Select">
            <div className="flex h-7 w-16 items-center justify-between rounded-md border border-border px-2">
              <span className="h-1 w-6 rounded-full bg-muted-foreground/30" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </GalleryTile>
          <GalleryTile slug="dialog" label="Dialog">
            <svg {...ICON_PROPS}>
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M4 9h16" />
            </svg>
          </GalleryTile>
          <GalleryTile slug="alert" label="Alert">
            <div className="h-7 w-16 rounded-md border-l-2 border-accent bg-muted/60" />
          </GalleryTile>
          <GalleryTile slug="avatar" label="Avatar">
            <Avatar className="h-8 w-8">
              <AvatarFallback>DC</AvatarFallback>
            </Avatar>
          </GalleryTile>
          <GalleryTile slug="checkbox" label="Checkbox">
            <Checkbox defaultChecked />
          </GalleryTile>
          <GalleryTile slug="radio-group" label="Radio Group">
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-accent">
              <div className="h-2 w-2 rounded-full bg-accent" />
            </div>
          </GalleryTile>
          <GalleryTile slug="separator" label="Separator">
            <div className="h-px w-16 bg-border" />
          </GalleryTile>
          <GalleryTile slug="progress" label="Progress">
            <Progress value={60} className="w-16" />
          </GalleryTile>
          <GalleryTile slug="accordion" label="Accordion">
            <div className="flex w-16 items-center justify-between border-b border-border pb-1.5">
              <span className="h-1 w-8 rounded-full bg-muted-foreground/30" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </GalleryTile>
          <GalleryTile slug="popover" label="Popover">
            <svg {...ICON_PROPS}>
              <rect x="4" y="4" width="16" height="12" rx="2" />
              <path d="M9 16v4l4-4" />
            </svg>
          </GalleryTile>
          <GalleryTile slug="dropdown-menu" label="Dropdown Menu">
            <svg {...ICON_PROPS} strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </GalleryTile>
          <GalleryTile slug="table" label="Table">
            <div className="grid w-16 grid-cols-2 gap-0.5">
              <div className="h-1.5 rounded-sm bg-muted-foreground/30" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/30" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/15" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/15" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/15" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/15" />
            </div>
          </GalleryTile>
          <GalleryTile slug="skeleton" label="Skeleton">
            <div className="w-16 space-y-1.5">
              <div className="h-1.5 w-full animate-pulse rounded-full bg-muted-foreground/25" />
              <div className="h-1.5 w-2/3 animate-pulse rounded-full bg-muted-foreground/15" />
            </div>
          </GalleryTile>
          <GalleryTile slug="empty-state" label="Empty State">
            <svg {...ICON_PROPS} strokeDasharray="3 3">
              <rect x="4" y="4" width="16" height="16" rx="3" />
            </svg>
          </GalleryTile>
          <GalleryTile slug="breadcrumb" label="Breadcrumb">
            <svg {...ICON_PROPS} strokeLinecap="round">
              <path d="M4 12h4l3-7 3 14 3-7h3" />
            </svg>
          </GalleryTile>
          <GalleryTile slug="pagination" label="Pagination">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 rounded-full border border-border" />
              <div className="h-5 w-5 rounded-full bg-accent" />
              <div className="h-5 w-5 rounded-full border border-border" />
            </div>
          </GalleryTile>
          <GalleryTile slug="alert-dialog" label="Alert Dialog">
            <svg {...ICON_PROPS}>
              <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              <path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
            </svg>
          </GalleryTile>
          <GalleryTile slug="sheet" label="Sheet">
            <div className="flex h-8 w-16 items-center justify-end overflow-hidden rounded-md border border-border">
              <div className="h-full w-6 bg-accent/30" />
            </div>
          </GalleryTile>
          <GalleryTile slug="combobox" label="Combobox">
            <div className="flex h-7 w-16 items-center justify-between rounded-md border border-border px-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" />
              </svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </GalleryTile>
          <GalleryTile slug="toast" label="Toast">
            <div className="h-8 w-16 rounded-md border border-border bg-card px-2 py-1.5">
              <div className="h-1 w-full rounded-full bg-muted-foreground/30" />
              <div className="mt-1 h-1 w-2/3 rounded-full bg-muted-foreground/20" />
            </div>
          </GalleryTile>
          <GalleryTile slug="toggle-group" label="Toggle Group">
            <div className="flex gap-0.5 rounded-md border border-border p-0.5">
              <div className="h-5 w-5 rounded bg-accent/20" />
              <div className="h-5 w-5 rounded" />
              <div className="h-5 w-5 rounded" />
            </div>
          </GalleryTile>
          <GalleryTile slug="slider" label="Slider">
            <div className="relative h-1.5 w-16 rounded-full bg-muted">
              <div className="absolute h-1.5 w-2/3 rounded-full bg-accent" />
              <div className="absolute -top-1 left-[calc(66%-6px)] h-3.5 w-3.5 rounded-full border-2 border-accent bg-background" />
            </div>
          </GalleryTile>
          <GalleryTile slug="collapsible" label="Collapsible">
            <div className="flex h-7 w-16 items-center justify-between rounded-md border border-border px-2">
              <div className="h-1 w-8 rounded-full bg-muted-foreground/30" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </GalleryTile>
          <GalleryTile slug="toggle" label="Toggle">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/20">
              <svg {...ICON_PROPS} className="h-4 w-4">
                <path d="M6 4h6a3.5 3.5 0 0 1 0 7H6zM6 11h7a3.5 3.5 0 0 1 0 7H6z" />
              </svg>
            </div>
          </GalleryTile>
          <GalleryTile slug="hover-card" label="Hover Card">
            <div className="relative h-8 w-16">
              <div className="h-4 w-10 rounded bg-muted-foreground/20" />
              <div className="absolute left-1 top-4 h-5 w-14 rounded-md border border-border bg-card shadow-sm" />
            </div>
          </GalleryTile>
          <GalleryTile slug="scroll-area" label="Scroll Area">
            <div className="flex h-8 w-16 items-center justify-end gap-1 rounded-md border border-border pr-1">
              <div className="h-5 w-0.5 rounded-full bg-border" />
            </div>
          </GalleryTile>
          <GalleryTile slug="context-menu" label="Context Menu">
            <div className="flex h-8 w-16 flex-col justify-center gap-1 rounded-md border border-border p-1.5">
              <div className="h-1 w-8 rounded-full bg-muted-foreground/30" />
              <div className="h-1 w-6 rounded-full bg-muted-foreground/20" />
              <div className="h-1 w-7 rounded-full bg-muted-foreground/20" />
            </div>
          </GalleryTile>
        </div>
      </Reveal>
    </>
  );
}
