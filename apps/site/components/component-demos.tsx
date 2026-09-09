"use client";

import * as React from "react";
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/dsgn/alert-dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/dsgn/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/dsgn/toggle-group";
import { Slider } from "@/components/dsgn/slider";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/dsgn/collapsible";
import { Toggle } from "@/components/dsgn/toggle";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/dsgn/hover-card";
import { ScrollArea } from "@/components/dsgn/scroll-area";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/dsgn/context-menu";
import { Label } from "@/components/dsgn/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/dsgn/form";
import { Calendar } from "@/components/dsgn/calendar";
import { DatePicker } from "@/components/dsgn/date-picker";
import { DataTable } from "@/components/dsgn/data-table";
import { useForm } from "react-hook-form";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/dsgn/drawer";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/dsgn/navigation-menu";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from "@/components/dsgn/menubar";
import { MultiSelect } from "@/components/dsgn/multi-select";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/dsgn/carousel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/dsgn/resizable";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/dsgn/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Kbd } from "@/components/dsgn/kbd";
import { FileUpload } from "@/components/dsgn/file-upload";
import { Stepper } from "@/components/dsgn/stepper";
import { Timeline } from "@/components/dsgn/timeline";
import { Rating } from "@/components/dsgn/rating";
import { ColorPicker } from "@/components/dsgn/color-picker";
import { AvatarGroup } from "@/components/dsgn/avatar-group";
import { CommandPaletteProvider, CommandPalette } from "@/components/dsgn/command-palette";
import { ComboboxDemo } from "@/components/combobox-demo";
import { ToastDemo } from "@/components/toast-demo";
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

  label: () => (
    <Frame>
      <div className="max-w-sm space-y-2">
        <Label htmlFor="demo-email">Email</Label>
        <Input id="demo-email" placeholder="you@example.com" />
      </div>
    </Frame>
  ),

  form: () => {
    function FormDemo() {
      const form = useForm({ defaultValues: { email: "" } });
      return (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(() => {})}
            className="max-w-sm space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: "Email is required.",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email." },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Resolver-agnostic — pair with <code className="font-mono text-accent">zodResolver</code> in
                    your own <code className="font-mono text-accent">useForm()</code> call for schema validation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      );
    }
    return (
      <Frame>
        <FormDemo />
      </Frame>
    );
  },

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

  "alert-dialog": () => (
    <Frame>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete project</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lyric-viewer?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the case study and its assets. This action cannot be undone — unlike a
              plain Dialog, this one can&rsquo;t be dismissed by clicking outside it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Frame>
  ),

  sheet: () => (
    <Frame>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open filters</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the component list by category.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p>Same Dialog primitive underneath — edge-anchored instead of centered.</p>
          </div>
          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Frame>
  ),

  combobox: () => <ComboboxDemo />,

  toast: () => <ToastDemo />,

  "toggle-group": () => (
    <Frame>
      <ToggleGroup type="single" defaultValue="center">
        <ToggleGroupItem value="left" aria-label="Align left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" strokeLinecap="round">
            <path d="M4 6h16M4 12h10M4 18h13" />
          </svg>
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" strokeLinecap="round">
            <path d="M4 6h16M7 12h10M5 18h14" />
          </svg>
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" strokeLinecap="round">
            <path d="M4 6h16M10 12h10M7 18h13" />
          </svg>
        </ToggleGroupItem>
      </ToggleGroup>
    </Frame>
  ),

  slider: () => (
    <Frame>
      <div className="max-w-sm space-y-8">
        <Slider defaultValue={[60]} max={100} step={1} aria-label="Volume" />
        <Slider defaultValue={[20, 80]} max={100} step={1} thumbLabels={["Minimum price", "Maximum price"]} />
      </div>
    </Frame>
  ),

  collapsible: () => (
    <Frame>
      <Collapsible defaultOpen className="w-full max-w-sm">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            What&apos;s included
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-1 rounded-md border border-border p-3 text-sm text-muted-foreground">
          <p>Unlimited components, every recipe, and the Claude Code Agent Skill.</p>
        </CollapsibleContent>
      </Collapsible>
    </Frame>
  ),

  toggle: () => (
    <Frame>
      <div className="flex items-center gap-2">
        <Toggle aria-label="Toggle bold" defaultPressed>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M6 4h6a3.5 3.5 0 0 1 0 7H6zM6 11h7a3.5 3.5 0 0 1 0 7H6z" />
          </svg>
        </Toggle>
        <Toggle aria-label="Toggle italic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" strokeLinecap="round">
            <path d="M10 4h6M6 20h6M13 4 8 20" />
          </svg>
        </Toggle>
      </div>
    </Frame>
  ),

  "hover-card": () => (
    <Frame>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">@dhruvchoudhary</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>DC</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Dhruv Choudhary</p>
              <p className="text-xs text-muted-foreground">Building dsgn — a component registry + design philosophy skill.</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </Frame>
  ),

  "scroll-area": () => (
    <Frame>
      <ScrollArea className="h-48 w-full max-w-sm rounded-md border border-border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              Notification {i + 1} — a scrollable panel with a custom-styled scrollbar.
            </p>
          ))}
        </div>
      </ScrollArea>
    </Frame>
  ),

  "context-menu": () => (
    <Frame>
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-full max-w-sm select-none items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Duplicate</ContextMenuItem>
          <ContextMenuItem>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </Frame>
  ),

  calendar: () => {
    function CalendarDemo() {
      const [date, setDate] = React.useState<Date | undefined>(new Date());
      return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border border-border" />;
    }
    return (
      <Frame>
        <CalendarDemo />
      </Frame>
    );
  },

  "date-picker": () => {
    function DatePickerDemo() {
      const [date, setDate] = React.useState<Date | undefined>(undefined);
      return <DatePicker value={date} onValueChange={setDate} />;
    }
    return (
      <Frame>
        <DatePickerDemo />
      </Frame>
    );
  },

  "data-table": () => {
    interface Invoice {
      id: string;
      status: "paid" | "pending" | "overdue";
      amount: number;
      customer: string;
    }
    const invoices: Invoice[] = [
      { id: "INV-001", status: "paid", amount: 250, customer: "Ada Lovelace" },
      { id: "INV-002", status: "pending", amount: 150, customer: "Grace Hopper" },
      { id: "INV-003", status: "overdue", amount: 350, customer: "Alan Turing" },
      { id: "INV-004", status: "paid", amount: 450, customer: "Margaret Hamilton" },
      { id: "INV-005", status: "pending", amount: 550, customer: "Katherine Johnson" },
    ];
    const columns: ColumnDef<Invoice>[] = [
      { accessorKey: "id", header: "Invoice" },
      { accessorKey: "customer", header: "Customer" },
      { accessorKey: "status", header: "Status" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
      },
    ];
    return (
      <Frame>
        <DataTable columns={columns} data={invoices} filterColumn="customer" filterPlaceholder="Filter customers..." />
      </Frame>
    );
  },

  drawer: () => (
    <Frame>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="accent">Open drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Real drag-to-dismiss</DrawerTitle>
            <DrawerDescription>
              Built on <code className="font-mono text-accent">vaul</code> — try dragging the handle above down to
              close it, not just clicking away.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Frame>
  ),

  "navigation-menu": () => (
    <Frame>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[300px] gap-2 p-4">
                <li>
                  <NavigationMenuLink className="block rounded-md p-2 text-sm hover:bg-muted">
                    Button — 9 variants, 8 sizes.
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink className="block rounded-md p-2 text-sm hover:bg-muted">
                    Data Table — sortable, filterable, paginated.
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Philosophy</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Frame>
  ),

  menubar: () => (
    <Frame>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Save <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Close</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Undo <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </Frame>
  ),

  "multi-select": () => {
    function MultiSelectDemo() {
      const [value, setValue] = React.useState<string[]>(["react"]);
      const options = [
        { value: "react", label: "React" },
        { value: "vue", label: "Vue" },
        { value: "svelte", label: "Svelte" },
        { value: "solid", label: "SolidJS" },
      ];
      return <MultiSelect options={options} value={value} onValueChange={setValue} className="max-w-sm" />;
    }
    return (
      <Frame>
        <MultiSelectDemo />
      </Frame>
    );
  },

  carousel: () => (
    <Frame>
      <Carousel className="w-full max-w-xs">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-muted text-3xl font-semibold">
                {index + 1}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </Frame>
  ),

  resizable: () => (
    <Frame>
      <ResizablePanelGroup className="h-48 max-w-md rounded-lg border border-border">
        <ResizablePanel defaultSize={50} className="flex items-center justify-center text-sm text-muted-foreground">
          One
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className="flex items-center justify-center text-sm text-muted-foreground">
          Two
        </ResizablePanel>
      </ResizablePanelGroup>
    </Frame>
  ),

  "input-otp": () => (
    <Frame>
      <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </Frame>
  ),

  kbd: () => (
    <Frame>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette
      </p>
    </Frame>
  ),

  "file-upload": () => {
    function FileUploadDemo() {
      const [files, setFiles] = React.useState<File[]>([]);
      return <FileUpload value={files} onValueChange={setFiles} className="max-w-sm" />;
    }
    return (
      <Frame>
        <FileUploadDemo />
      </Frame>
    );
  },

  stepper: () => (
    <Frame>
      <Stepper
        currentStep={1}
        className="max-w-lg"
        steps={[
          { label: "Account", description: "Create your login" },
          { label: "Profile", description: "Tell us about you" },
          { label: "Review", description: "Confirm and finish" },
        ]}
      />
    </Frame>
  ),

  timeline: () => (
    <Frame>
      <Timeline
        className="max-w-sm"
        items={[
          { title: "Order placed", timestamp: "9:41 AM", description: "Your order has been received." },
          { title: "Payment confirmed", timestamp: "9:42 AM", description: "Card charged successfully." },
          { title: "Shipped", timestamp: "2:15 PM", description: "Package handed to carrier." },
        ]}
      />
    </Frame>
  ),

  rating: () => {
    function RatingDemo() {
      const [value, setValue] = React.useState(3);
      return (
        <div className="flex flex-col items-start gap-3">
          <Rating value={3.5} readOnly aria-label="Average rating" />
          <Rating value={value} onValueChange={setValue} aria-label="Rate this product" />
        </div>
      );
    }
    return (
      <Frame>
        <RatingDemo />
      </Frame>
    );
  },

  "color-picker": () => {
    function ColorPickerDemo() {
      const [value, setValue] = React.useState("#3b82f6");
      return <ColorPicker value={value} onValueChange={setValue} />;
    }
    return (
      <Frame>
        <ColorPickerDemo />
      </Frame>
    );
  },

  "avatar-group": () => (
    <Frame>
      <AvatarGroup
        max={3}
        avatars={[
          { src: "https://github.com/dhruvch1244.png", alt: "Dhruv Choudhary", fallback: "DC" },
          { fallback: "JS" },
          { fallback: "AK" },
          { fallback: "MP" },
          { fallback: "RL" },
        ]}
      />
    </Frame>
  ),

  "command-palette": () => {
    function CommandPaletteDemo() {
      const [lastSelected, setLastSelected] = React.useState<string | null>(null);
      return (
        <CommandPaletteProvider>
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-muted-foreground">
              Press <Kbd>⌘</Kbd>+<Kbd>K</Kbd> (or Ctrl+K) to open the palette.
              {lastSelected ? ` Last selected: ${lastSelected}.` : ""}
            </p>
          </div>
          <CommandPalette
            items={[
              { id: "profile", label: "View profile", group: "Navigation", onSelect: () => setLastSelected("View profile") },
              { id: "settings", label: "Open settings", group: "Navigation", onSelect: () => setLastSelected("Open settings") },
              { id: "new-doc", label: "New document", group: "Actions", shortcut: "⌘N", onSelect: () => setLastSelected("New document") },
              { id: "logout", label: "Log out", group: "Actions", onSelect: () => setLastSelected("Log out") },
            ]}
          />
        </CommandPaletteProvider>
      );
    }
    return (
      <Frame>
        <CommandPaletteDemo />
      </Frame>
    );
  },
};
