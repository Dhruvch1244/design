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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/dsgn/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/dsgn/pagination";
import { Frame } from "@/components/brand/frame";
import { ComponentJumpCommand } from "@/components/component-jump-command";
import { LazyMount } from "@/components/lazy-mount";
import { ButtonPlayground } from "@/components/button-playground";
import { BadgePlayground } from "@/components/badge-playground";
import { SwitchPlayground } from "@/components/switch-playground";
import { SelectPlayground } from "@/components/select-playground";
import { CheckboxPlayground } from "@/components/checkbox-playground";
import { COMPONENTS_DATA } from "@/lib/components-data";

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

const SEARCH_SECTIONS = COMPONENTS_DATA.map(({ slug, title }) => ({ id: slug, text: title }));

/** One demo per component, keyed by slug — rendered on that component's own
 * /components/[slug] page. Kept as plain functions (not JSX constants) so
 * each only does work when its own page actually renders it. */
export const COMPONENT_DEMOS: Record<string, () => React.ReactNode> = {
  button: () => (
    <div className="space-y-6">
      <ButtonPlayground />
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">All variants &amp; sizes</p>
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
  ),

  card: () => (
    <div className="flex flex-wrap items-start gap-4">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Non-destructive by default</CardTitle>
          <CardDescription>Pillar #3 of the philosophy.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Edits are modeled as an overlay over an untouched original, so undo is structural, not
            reconstructed after the fact.
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
          <p className="font-display text-4xl uppercase text-accent">{COMPONENTS_DATA.length}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">Components</p>
        </CardContent>
      </Card>
    </div>
  ),

  badge: () => (
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
  ),

  input: () => (
    <Frame>
      <div className="max-w-sm space-y-3">
        <Input placeholder="Email address" />
        <Input placeholder="Disabled" disabled />
      </div>
    </Frame>
  ),

  command: () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Built on <code className="font-mono text-accent">cmdk</code> — press{" "}
        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> anywhere
        on this site for the real thing, or use the sidebar search on the left.
      </p>
      <LazyMount minHeight={276}>
        <ComponentJumpCommand sections={SEARCH_SECTIONS} />
      </LazyMount>
    </div>
  ),

  textarea: () => (
    <Frame>
      <Textarea placeholder="Write something..." className="max-w-sm" />
    </Frame>
  ),

  switch: () => (
    <div className="space-y-6">
      <SwitchPlayground />
      <Frame>
        <div className="flex items-center gap-6">
          <Switch defaultChecked aria-label="Enabled example" />
          <Switch aria-label="Disabled example" disabled />
        </div>
      </Frame>
    </div>
  ),

  tooltip: () => (
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
  ),

  tabs: () => (
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
  ),

  select: () => <SelectPlayground />,

  dialog: () => (
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
                Edits are modeled as an overlay over an untouched original, so undo is structural, not
                reconstructed after the fact.
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
  ),

  alert: () => (
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
  ),

  avatar: () => (
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
  ),

  checkbox: () => (
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
  ),

  "radio-group": () => (
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
  ),

  separator: () => (
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
  ),

  progress: () => (
    <Frame>
      <div className="max-w-sm space-y-4">
        <Progress value={25} aria-label="25%" />
        <Progress value={66} aria-label="66%" />
        <Progress value={100} aria-label="100%" />
      </div>
    </Frame>
  ),

  accordion: () => (
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
  ),

  popover: () => (
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
  ),

  "dropdown-menu": () => (
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
  ),

  table: () => (
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
  ),

  skeleton: () => (
    <Frame>
      <div className="flex max-w-sm items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </Frame>
  ),

  "empty-state": () => (
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
  ),

  breadcrumb: () => (
    <Frame>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/components">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/components/table">Table</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Row actions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </Frame>
  ),

  pagination: () => (
    <Frame>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Frame>
  ),
};
