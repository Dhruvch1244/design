import { Link } from "@/components/link";
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
import { Input } from "@/components/dsgn/input";
import { Checkbox } from "@/components/dsgn/checkbox";
import { Switch } from "@/components/dsgn/switch";
import { Separator } from "@/components/dsgn/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/dsgn/select";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Badge } from "@/components/dsgn/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/dsgn/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/dsgn/table";
import { Skeleton } from "@/components/dsgn/skeleton";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/dsgn/command";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { CursorGlow } from "@/components/motion/cursor-glow";
import { SkillPromoBanner } from "@/components/skill-promo-banner";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Examples — Dhruv Choudhary",
  description: "Small, realistic app pieces composed from the dsgn registry — not just isolated components.",
};

const TEAM = [
  { name: "Dhruv Choudhary", role: "Admin", initials: "DC" },
  { name: "lyric-viewer", role: "Editor", initials: "lv" },
  { name: "file-viewer", role: "Viewer", initials: "fv" },
] as const;

// The registry's real component names (registry.json), so the search below
// is filtering actual data instead of sample rows.
const REGISTRY_COMPONENTS = [
  "accordion", "alert", "avatar", "badge", "button", "card", "checkbox",
  "command", "dialog", "dropdown-menu", "empty-state", "input", "popover",
  "progress", "radio-group", "select", "separator", "skeleton", "switch",
  "table", "tabs", "textarea", "tooltip",
] as const;

// Real numbers about this project, not placeholder dashboard data — a fake
// "$1.2M revenue" stat tile would be exactly the kind of ungrounded demo
// content the philosophy pages argue against. Registry count is derived
// from REGISTRY_COMPONENTS above rather than a second hardcoded literal,
// so the two can't silently drift out of sync the way this one already did.
const STATS = [
  { label: "Registry components", value: String(REGISTRY_COMPONENTS.length) },
  { label: "Case studies", value: "3" },
  { label: "Philosophy pillars", value: "9" },
] as const;

// The 3 real case studies this philosophy was extracted from — same data
// as apps/site/lib/case-studies.ts, not invented dashboard rows.
const PROJECTS = [
  { name: "lyric-viewer", stack: "Tauri 2 + Rust", status: "Shipped" },
  { name: "file-viewer", stack: ".NET / WPF", status: "Shipped" },
  { name: "review-grader", stack: "Angular 17.3", status: "Shipped" },
] as const;

// dsgn itself is MIT-licensed and free — this tier layout is illustrative
// of the composition, not a real dsgn pricing plan.
const PLANS = [
  {
    name: "Community",
    price: "Free",
    tagline: "Everything in the registry, MIT licensed.",
    features: ["Full component registry", "npx @dhruvchoudhary/dsgn add", "Unlimited projects"],
    featured: false,
  },
  {
    name: "Team",
    price: "Custom",
    tagline: "For teams standardizing on one registry.",
    features: ["Everything in Community", "Private component registry", "Shared token overrides"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "SSO, audit logs, dedicated support.",
    features: ["Everything in Team", "SSO / SAML", "Dedicated support channel"],
    featured: false,
  },
] as const;

function ExampleFrame({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="space-y-6 border-t border-border pt-12">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-muted-foreground">0{index}</span>
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wide">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex justify-center py-4">{children}</div>
      </section>
    </Reveal>
  );
}

export default function ExamplesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-32">
      <div className="pt-6">
        <SkillPromoBanner />
      </div>
      <Reveal>
        <CursorGlow className="rounded-[2rem] py-4">
          <Eyebrow>Examples · dsgn</Eyebrow>
          <h1 className="mt-6 max-w-2xl font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
            Small apps, not just components.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A single Button or Switch in isolation doesn&rsquo;t tell you much about how it holds
            up in real layout. These are small, realistic compositions — a sign-in form, a
            settings panel, a team list, a dashboard, pricing tiers, a live search — built
            entirely from the same{" "}
            <Link href="/components" className="text-accent hover:underline">
              registry components
            </Link>{" "}
            shown on their own elsewhere on this site.
          </p>
        </CursorGlow>
      </Reveal>

      <ExampleFrame
        index={1}
        title="Sign in"
        description="Card + Input + Checkbox + Button — a real auth form, not a lorem-ipsum mockup."
      >
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your dsgn account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="ex-email">
                Email
              </label>
              <Input id="ex-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="ex-password">
                Password
              </label>
              <Input id="ex-password" type="password" placeholder="••••••••" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked /> Remember me
            </label>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3">
            <Button variant="accent" className="w-full">
              Sign in
            </Button>
            <Button variant="link" size="sm" className="self-center">
              Forgot password?
            </Button>
          </CardFooter>
        </Card>
      </ExampleFrame>

      <ExampleFrame
        index={2}
        title="Settings panel"
        description="Card + Switch + Select + Separator — a preferences screen, staged not mutated."
      >
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Changes apply on Save, not as you toggle them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email notifications</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Marketing emails</span>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Theme</span>
              <Select defaultValue="system">
                <SelectTrigger className="w-32" aria-label="Theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="accent" className="w-full">
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </ExampleFrame>

      <ExampleFrame
        index={3}
        title="Team list"
        description="Avatar + Badge + DropdownMenu — a real list with per-row actions."
      >
        <Frame className="w-full max-w-sm" glow={false}>
          <div className="space-y-1">
            {TEAM.map((member, i) => (
              <div key={member.name}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "Admin" ? "accent" : "outline"}>
                      {member.role}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name}`}>
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <circle cx="5" cy="12" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="19" cy="12" r="1.5" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit role</DropdownMenuItem>
                        <DropdownMenuItem>Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {i < TEAM.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </Frame>
      </ExampleFrame>

      <ExampleFrame
        index={4}
        title="Stat row"
        description="Real numbers about this project — not placeholder dashboard data."
      >
        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <Frame key={stat.label} glow={false} className="text-center">
              <p className="font-display text-4xl uppercase text-accent">{stat.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {stat.label}
              </p>
            </Frame>
          ))}
        </div>
      </ExampleFrame>

      <ExampleFrame
        index={5}
        title="Project dashboard"
        description="Table + Badge + Skeleton — the real 3 case studies, plus a loading row for contrast."
      >
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Case studies</CardTitle>
            <CardDescription>Every project this design philosophy was extracted from.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Stack</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROJECTS.map((project) => (
                  <TableRow key={project.name}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="text-muted-foreground">{project.stack}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{project.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-14" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </ExampleFrame>

      <ExampleFrame
        index={6}
        title="Pricing tiers"
        description="Card + Badge + Button — a 3-tier plan layout (illustrative pattern, not an actual dsgn plan)."
      >
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn("flex flex-col", plan.featured && "border-accent")}
            >
              <CardHeader>
                {plan.featured && (
                  <Badge variant="accent" className="mb-2 w-fit">
                    Most popular
                  </Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="font-display text-3xl uppercase">{plan.price}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={plan.featured ? "accent" : "outline"} className="w-full">
                  {plan.price === "Free" ? "Get started" : "Talk to us"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ExampleFrame>

      <ExampleFrame
        index={7}
        title="Component search"
        description="Command — searching this registry's real component list, not sample data."
      >
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card">
          <Command loop>
            <CommandInput placeholder="Search components..." />
            <CommandList>
              <CommandEmpty>No components found.</CommandEmpty>
              <CommandGroup heading="Registry">
                {REGISTRY_COMPONENTS.map((name) => (
                  <CommandItem key={name} value={name}>
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </ExampleFrame>
    </div>
  );
}
