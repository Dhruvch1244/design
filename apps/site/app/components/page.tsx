import type { Metadata } from "next";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/dsgn/select";
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
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { CursorGlow } from "@/components/motion/cursor-glow";
import { CopyButton } from "@/components/copy-button";

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
  index,
  title,
  name,
  children,
}: {
  index: number;
  title: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="space-y-6 border-t border-border pt-12">
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

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 px-6 pb-32">
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
        </CursorGlow>
      </Reveal>

      <Section index={1} title="Button" name="button">
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
      </Section>

      <Section index={2} title="Card" name="card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Non-destructive by default</CardTitle>
            <CardDescription>Pillar #3 of the philosophy.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Edits are modeled as an overlay over an untouched original, so undo is structural,
              not reconstructed after the fact.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">
              Read the pillar
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section index={3} title="Badge" name="badge">
        <Frame>
          <div className="flex flex-wrap items-center gap-3">
            {BADGE_VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </div>
        </Frame>
      </Section>

      <Section index={4} title="Input" name="input">
        <Frame>
          <div className="max-w-sm space-y-3">
            <Input placeholder="Email address" />
            <Input placeholder="Disabled" disabled />
          </div>
        </Frame>
      </Section>

      <Section index={5} title="Command" name="command">
        <Frame>
          <p className="text-sm text-muted-foreground">
            A ⌘K command palette (Radix-adjacent, built on{" "}
            <code className="font-mono text-accent">cmdk</code>) — press{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">⌘K</kbd>{" "}
            anywhere on this site to see it in use.
          </p>
        </Frame>
      </Section>

      <Section index={6} title="Textarea" name="textarea">
        <Frame>
          <Textarea placeholder="Write something..." className="max-w-sm" />
        </Frame>
      </Section>

      <Section index={7} title="Switch" name="switch">
        <Frame>
          <div className="flex items-center gap-6">
            <Switch defaultChecked aria-label="Enabled example" />
            <Switch aria-label="Disabled example" disabled />
          </div>
        </Frame>
      </Section>

      <Section index={8} title="Tooltip" name="tooltip">
        <Frame>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  Hover me
                </Button>
              </TooltipTrigger>
              <TooltipContent>Non-destructive by default.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Frame>
      </Section>

      <Section index={9} title="Tabs" name="tabs">
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

      <Section index={10} title="Select" name="select">
        <Frame>
          <Select defaultValue="lyric-viewer">
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Choose an app" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lyric-viewer">lyric-viewer</SelectItem>
              <SelectItem value="file-viewer">file-viewer</SelectItem>
              <SelectItem value="review-grader">review-grader</SelectItem>
            </SelectContent>
          </Select>
        </Frame>
      </Section>

      <Section index={11} title="Dialog" name="dialog">
        <Frame>
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
        </Frame>
      </Section>
    </div>
  );
}
