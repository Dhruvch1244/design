import type { Metadata } from "next";
import { Link } from "@/components/link";
import { SkillPromoBanner } from "@/components/skill-promo-banner";
import { Button } from "@/components/dsgn/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/dsgn/card";
import { Badge } from "@/components/dsgn/badge";
import { Input } from "@/components/dsgn/input";
import { Textarea } from "@/components/dsgn/textarea";
import { Switch } from "@/components/dsgn/switch";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/dsgn/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/dsgn/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/dsgn/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/dsgn/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/dsgn/avatar";
import { Checkbox } from "@/components/dsgn/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/dsgn/radio-group";
import { Separator } from "@/components/dsgn/separator";
import { Progress } from "@/components/dsgn/progress";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/dsgn/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/dsgn/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/dsgn/dropdown-menu";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/dsgn/table";
import { Skeleton } from "@/components/dsgn/skeleton";
import { EmptyState } from "@/components/dsgn/empty-state";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { CursorGlow } from "@/components/motion/cursor-glow";
import { CopyButton } from "@/components/copy-button";
import { ButtonPlayground } from "@/components/button-playground";
import { BadgePlayground } from "@/components/badge-playground";
import { SwitchPlayground } from "@/components/switch-playground";
import { SelectPlayground } from "@/components/select-playground";
import { CheckboxPlayground } from "@/components/checkbox-playground";
import { TableOfContents, type TocEntry } from "@/components/table-of-contents";
import { ComponentJumpCommand } from "@/components/component-jump-command";
import { SectionSearchButton } from "@/components/section-search-button";
import { LazyMount } from "@/components/lazy-mount";

export const metadata: Metadata = {
  title: "Components — Dhruv Choudhary",
  description: "Live components from the dsgn registry, installed with the dsgn CLI.",
};

const VARIANTS = [
  "primary",
  "secondary",
  "accent",
  "glow",
  "soft",
  "outline",
  "ghost",
  "link",
  "destructive",
] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const ICON_SIZES = ["icon-sm", "icon", "icon-lg"] as const;
const BADGE_VARIANTS = ["primary", "secondary", "accent", "outline", "destructive"] as const;

const SECTIONS: TocEntry[] = [
  { id: "button", text: "Button" },
  { id: "card", text: "Card" },
  { id: "badge", text: "Badge" },
  { id: "input", text: "Input" },
  { id: "command", text: "Command" },
  { id: "textarea", text: "Textarea" },
  { id: "switch", text: "Switch" },
  { id: "tooltip", text: "Tooltip" },
  { id: "tabs", text: "Tabs" },
  { id: "select", text: "Select" },
  { id: "dialog", text: "Dialog" },
  { id: "alert", text: "Alert" },
  { id: "avatar", text: "Avatar" },
  { id: "checkbox", text: "Checkbox" },
  { id: "radio-group", text: "Radio Group" },
  { id: "separator", text: "Separator" },
  { id: "progress", text: "Progress" },
  { id: "accordion", text: "Accordion" },
  { id: "popover", text: "Popover" },
  { id: "dropdown-menu", text: "Dropdown Menu" },
  { id: "table", text: "Table" },
  { id: "skeleton", text: "Skeleton" },
  { id: "empty-state", text: "Empty State" },
];

function InstallCommand({ name }: { name: string }) {
  const cmd = `npx @dhruvchoudhary/dsgn add ${name}`;
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-glass px-5 py-2.5 backdrop-blur-xl">
      <pre className="overflow-x-auto font-mono text-sm text-accent">
        <code>$ {cmd}</code>
      </pre>
      <CopyButton text={cmd} />
    </div>
  );
}

function Section({
  id,
  index,
  title,
  name,
  children,
}: {
  id: string;
  index: number;
  title: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-28 space-y-6 border-t border-border pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-muted-foreground">0{index}</span>
            <h2 className="font-display text-2xl uppercase tracking-wide">{title}</h2>
          </div>
          <InstallCommand name={name} />
        </div>
        {children}
      </section>
    </Reveal>
  );
}

/** One tile in the visual gallery grid — a small, mostly-static preview (not
 * a full interactive mount) so 20 of these on one page stay lightweight,
 * linking down to the real interactive version in its full section below. */
function GalleryTile({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <a href={`#${id}`} className="group block">
      <Frame
        glow={false}
        className="flex h-28 flex-col items-center justify-center gap-3 transition-colors duration-300 ease-fluid group-hover:border-accent"
      >
        {/* inert: these mini previews are real interactive widgets (Switch,
            Checkbox, Select, Progress) rendered purely for visual demo — the
            actual interactive/navigable element is the outer <a>, whose text
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
    </a>
  );
}

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  className: "h-5 w-5",
} as const;

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-32">
      <div className="pt-6">
        <SkillPromoBanner />
      </div>
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
          <div className="mt-6">
            <SectionSearchButton
              sections={SECTIONS}
              heading="Components"
              placeholder="Jump to a component..."
              label="Search components"
            />
          </div>
        </CursorGlow>
      </Reveal>

      {/* Visual overview — a gallery of small previews instead of jumping
          straight into 20 sections of prose. Click any tile to jump to its
          full, interactive section below. */}
      <Reveal delay={100}>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
          <GalleryTile id="button" label="Button">
            <Button size="sm" variant="accent">
              Button
            </Button>
          </GalleryTile>
          <GalleryTile id="card" label="Card">
            <div className="h-8 w-14 space-y-1.5 rounded-md border border-border p-1.5">
              <div className="h-1 w-full rounded-full bg-muted-foreground/40" />
              <div className="h-1 w-2/3 rounded-full bg-muted-foreground/25" />
            </div>
          </GalleryTile>
          <GalleryTile id="badge" label="Badge">
            <Badge variant="accent">Badge</Badge>
          </GalleryTile>
          <GalleryTile id="input" label="Input">
            <div className="h-7 w-16 rounded-md border border-border" />
          </GalleryTile>
          <GalleryTile id="command" label="Command">
            <svg {...ICON_PROPS}>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
          </GalleryTile>
          <GalleryTile id="textarea" label="Textarea">
            <div className="h-9 w-16 space-y-1 rounded-md border border-border p-1.5">
              <div className="h-1 w-full rounded-full bg-muted-foreground/30" />
              <div className="h-1 w-full rounded-full bg-muted-foreground/20" />
            </div>
          </GalleryTile>
          <GalleryTile id="switch" label="Switch">
            <Switch defaultChecked className="scale-90" />
          </GalleryTile>
          <GalleryTile id="tooltip" label="Tooltip">
            <svg {...ICON_PROPS}>
              <path d="M4 5h16v10H9l-4 4v-4H4z" />
            </svg>
          </GalleryTile>
          <GalleryTile id="tabs" label="Tabs">
            <div className="flex gap-1 rounded-full bg-muted p-1">
              <div className="h-5 w-8 rounded-full bg-background" />
              <div className="h-5 w-8 rounded-full" />
            </div>
          </GalleryTile>
          <GalleryTile id="select" label="Select">
            <div className="flex h-7 w-16 items-center justify-between rounded-md border border-border px-2">
              <span className="h-1 w-6 rounded-full bg-muted-foreground/30" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </GalleryTile>
          <GalleryTile id="dialog" label="Dialog">
            <svg {...ICON_PROPS}>
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M4 9h16" />
            </svg>
          </GalleryTile>
          <GalleryTile id="alert" label="Alert">
            <div className="h-7 w-16 rounded-md border-l-2 border-accent bg-muted/60" />
          </GalleryTile>
          <GalleryTile id="avatar" label="Avatar">
            <Avatar className="h-8 w-8">
              <AvatarFallback>DC</AvatarFallback>
            </Avatar>
          </GalleryTile>
          <GalleryTile id="checkbox" label="Checkbox">
            <Checkbox defaultChecked />
          </GalleryTile>
          <GalleryTile id="radio-group" label="Radio Group">
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-accent">
              <div className="h-2 w-2 rounded-full bg-accent" />
            </div>
          </GalleryTile>
          <GalleryTile id="separator" label="Separator">
            <div className="h-px w-16 bg-border" />
          </GalleryTile>
          <GalleryTile id="progress" label="Progress">
            <Progress value={60} className="w-16" />
          </GalleryTile>
          <GalleryTile id="accordion" label="Accordion">
            <div className="flex w-16 items-center justify-between border-b border-border pb-1.5">
              <span className="h-1 w-8 rounded-full bg-muted-foreground/30" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </GalleryTile>
          <GalleryTile id="popover" label="Popover">
            <svg {...ICON_PROPS}>
              <rect x="4" y="4" width="16" height="12" rx="2" />
              <path d="M9 16v4l4-4" />
            </svg>
          </GalleryTile>
          <GalleryTile id="dropdown-menu" label="Dropdown Menu">
            <svg {...ICON_PROPS} strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </GalleryTile>
          <GalleryTile id="table" label="Table">
            <div className="grid w-16 grid-cols-2 gap-0.5">
              <div className="h-1.5 rounded-sm bg-muted-foreground/30" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/30" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/15" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/15" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/15" />
              <div className="h-1.5 rounded-sm bg-muted-foreground/15" />
            </div>
          </GalleryTile>
          <GalleryTile id="skeleton" label="Skeleton">
            <div className="w-16 space-y-1.5">
              <div className="h-1.5 w-full animate-pulse rounded-full bg-muted-foreground/25" />
              <div className="h-1.5 w-2/3 animate-pulse rounded-full bg-muted-foreground/15" />
            </div>
          </GalleryTile>
          <GalleryTile id="empty-state" label="Empty State">
            <svg {...ICON_PROPS} strokeDasharray="3 3">
              <rect x="4" y="4" width="16" height="16" rx="3" />
            </svg>
          </GalleryTile>
        </div>
      </Reveal>

      <div className="mt-16 flex gap-16">
        <aside className="hidden w-48 shrink-0 lg:block">
          <div className="sticky top-28">
            <TableOfContents toc={SECTIONS} />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-16">
          <Section id="button" index={1} title="Button" name="button">
            <div className="space-y-6">
              <ButtonPlayground />
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                All variants &amp; sizes
              </p>
            <Frame>
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  {VARIANTS.map((variant) => (
                    <Button key={variant} variant={variant}>
                      {variant}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {SIZES.map((size) => (
                    <Button key={size} size={size}>
                      size {size}
                    </Button>
                  ))}
                  {ICON_SIZES.map((size) => (
                    <Button key={size} size={size} variant="outline" aria-label={`icon ${size}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button
                    variant="accent"
                    leftIcon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                        <path d="M12 4v16M4 12h16" />
                      </svg>
                    }
                  >
                    leftIcon
                  </Button>
                  <Button variant="accent" className="rounded-full px-6 shadow-glow">
                    asChild + pill
                  </Button>
                </div>
              </div>
            </Frame>
            </div>
          </Section>

          <Section id="card" index={2} title="Card" name="card">
            <div className="flex flex-wrap items-start gap-4">
              <Card className="max-w-sm">
                <CardHeader>
                  <CardTitle>Non-destructive by default</CardTitle>
                  <CardDescription>Pillar #3 of the philosophy.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Edits are modeled as an overlay over an untouched original, so undo is
                    structural, not reconstructed after the fact.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">
                    Read the pillar
                  </Button>
                </CardFooter>
              </Card>
              <Card className="w-40 text-center">
                <CardContent className="pt-6">
                  <p className="font-display text-4xl uppercase text-accent">{SECTIONS.length}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    Components
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section id="badge" index={3} title="Badge" name="badge">
            <div className="space-y-6">
              <BadgePlayground />
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">All variants</p>
              <Frame>
                <div className="flex flex-wrap items-center gap-3">
                  {BADGE_VARIANTS.map((variant) => (
                    <Badge key={variant} variant={variant}>
                      {variant}
                    </Badge>
                  ))}
                </div>
              </Frame>
            </div>
          </Section>

          <Section id="input" index={4} title="Input" name="input">
            <Frame>
              <div className="max-w-sm space-y-3">
                <Input placeholder="Email address" />
                <Input placeholder="Disabled" disabled />
              </div>
            </Frame>
          </Section>

          <Section id="command" index={5} title="Command" name="command">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Built on <code className="font-mono text-accent">cmdk</code> — press{" "}
                <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">⌘K</kbd>{" "}
                anywhere on this site for the real thing, or the &ldquo;Search components&rdquo;
                button at the top of this page. This inline version is here so the Command
                section has one too.
              </p>
              <LazyMount minHeight={276}>
                <ComponentJumpCommand sections={SECTIONS} />
              </LazyMount>
            </div>
          </Section>

          <Section id="textarea" index={6} title="Textarea" name="textarea">
            <Frame>
              <Textarea placeholder="Write something..." className="max-w-sm" />
            </Frame>
          </Section>

          <Section id="switch" index={7} title="Switch" name="switch">
            <div className="space-y-6">
              <SwitchPlayground />
              <Frame>
                <div className="flex items-center gap-6">
                  <Switch defaultChecked aria-label="Enabled example" />
                  <Switch aria-label="Disabled example" disabled />
                </div>
              </Frame>
            </div>
          </Section>

          <Section id="tooltip" index={8} title="Tooltip" name="tooltip">
            <Frame>
              <TooltipProvider>
                <div className="flex flex-wrap items-center justify-center gap-6 py-6">
                  {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <Tooltip key={side}>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          {side}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side={side}>Non-destructive by default.</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </Frame>
          </Section>

          <Section id="tabs" index={9} title="Tabs" name="tabs">
            <Frame>
              <Tabs defaultValue="philosophy" className="max-w-sm">
                <TabsList>
                  <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
                  <TabsTrigger value="registry">Registry</TabsTrigger>
                </TabsList>
                <TabsContent value="philosophy" className="text-sm text-muted-foreground">
                  Every rule traces to a real, named, shipped decision.
                </TabsContent>
                <TabsContent value="registry" className="text-sm text-muted-foreground">
                  Components you own the moment the CLI copies them in.
                </TabsContent>
              </Tabs>
            </Frame>
          </Section>

          <Section id="select" index={10} title="Select" name="select">
            <SelectPlayground />
          </Section>

          <Section id="dialog" index={11} title="Dialog" name="dialog">
            <Frame>
              <div className="flex flex-wrap items-center gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="accent">Open dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Non-destructive by default</DialogTitle>
                      <DialogDescription>
                        Edits are modeled as an overlay over an untouched original, so undo is
                        structural, not reconstructed after the fact.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete project</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete lyric-viewer?</DialogTitle>
                      <DialogDescription>This removes the case study and its assets.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive">Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Frame>
          </Section>

          <Section id="alert" index={12} title="Alert" name="alert">
            <div className="space-y-3">
              <Alert>
                <AlertTitle>Non-destructive by default</AlertTitle>
                <AlertDescription>Edits are an overlay over an untouched original.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Structural failure</AlertTitle>
                <AlertDescription>Missing required section marker at offset 0x4A2.</AlertDescription>
              </Alert>
            </div>
          </Section>

          <Section id="avatar" index={13} title="Avatar" name="avatar">
            <Frame>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://github.com/dhruvch1244.png" alt="Dhruv Choudhary" />
                  <AvatarFallback>DC</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>lv</AvatarFallback>
                </Avatar>
              </div>
            </Frame>
          </Section>

          <Section id="checkbox" index={14} title="Checkbox" name="checkbox">
            <div className="space-y-6">
              <CheckboxPlayground />
              <Frame>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox defaultChecked /> Non-destructive
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox disabled /> Disabled
                  </label>
                </div>
              </Frame>
            </div>
          </Section>

          <Section id="radio-group" index={15} title="Radio Group" name="radio-group">
            <Frame>
              <RadioGroup defaultValue="lyric-viewer" className="text-sm">
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="lyric-viewer" id="rg-lv" /> lyric-viewer
                </label>
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="file-viewer" id="rg-fv" /> file-viewer
                </label>
              </RadioGroup>
            </Frame>
          </Section>

          <Section id="separator" index={16} title="Separator" name="separator">
            <Frame>
              <p className="text-sm text-muted-foreground">Above</p>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">Below</p>
              <div className="mt-6 flex h-5 items-center gap-3 text-sm text-muted-foreground">
                <span>Left</span>
                <Separator orientation="vertical" />
                <span>Right</span>
              </div>
            </Frame>
          </Section>

          <Section id="progress" index={17} title="Progress" name="progress">
            <Frame>
              <div className="max-w-sm space-y-4">
                <Progress value={25} aria-label="25%" />
                <Progress value={66} aria-label="66%" />
                <Progress value={100} aria-label="100%" />
              </div>
            </Frame>
          </Section>

          <Section id="accordion" index={18} title="Accordion" name="accordion">
            <Frame>
              <Accordion type="single" collapsible className="max-w-sm">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Non-destructive by default</AccordionTrigger>
                  <AccordionContent>
                    Edits are an overlay over an untouched original. Undo is structural.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Trust the data</AccordionTrigger>
                  <AccordionContent>Gatekeep structure, never content.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </Frame>
          </Section>

          <Section id="popover" index={19} title="Popover" name="popover">
            <Frame>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm text-muted-foreground">
                    Anchored, dismissible content — the base primitive Command&rsquo;s dialog and
                    Select&rsquo;s dropdown are both built from the same idea.
                  </p>
                </PopoverContent>
              </Popover>
            </Frame>
          </Section>

          <Section id="dropdown-menu" index={20} title="Dropdown Menu" name="dropdown-menu">
            <Frame>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Case studies</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>lyric-viewer</DropdownMenuItem>
                  <DropdownMenuItem>file-viewer</DropdownMenuItem>
                  <DropdownMenuItem>review-grader</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Frame>
          </Section>

          <Section id="table" index={21} title="Table" name="table">
            <Frame>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pillar</TableHead>
                    <TableHead>Shipped in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Physical separation</TableCell>
                    <TableCell className="text-muted-foreground">lyric-viewer</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Non-destructive by default</TableCell>
                    <TableCell className="text-muted-foreground">file-viewer</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Idioms stay current</TableCell>
                    <TableCell className="text-muted-foreground">review-grader</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Frame>
          </Section>

          <Section id="skeleton" index={22} title="Skeleton" name="skeleton">
            <Frame>
              <div className="flex max-w-sm items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </Frame>
          </Section>

          <Section id="empty-state" index={23} title="Empty State" name="empty-state">
            <div className="max-w-sm">
              <EmptyState
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
                    <rect x="4" y="4" width="16" height="16" rx="3" />
                    <path d="M9 9h6M9 15h3" />
                  </svg>
                }
                title="No results"
                description="Nothing matches that filter yet."
                action={
                  <Button variant="outline" size="sm">
                    Clear filter
                  </Button>
                }
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
