// Single source of truth for the component list shown in the /components
// sidebar and used to generate one static page per component. Order here
// is the display order everywhere (sidebar, gallery grid, index generation).
export interface ComponentEntry {
  slug: string;
  title: string;
  description: string;
}

export const COMPONENTS_DATA: ComponentEntry[] = [
  {
    slug: "button",
    title: "Button",
    description:
      "9 variants (primary/secondary/accent/glow/soft/outline/ghost/link/destructive) and 8 sizes, left/right icon slots, a non-reflowing loading state, and asChild composition via Radix Slot.",
  },
  {
    slug: "card",
    title: "Card",
    description: "Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.",
  },
  { slug: "badge", title: "Badge", description: "Badge with variant props via class-variance-authority." },
  { slug: "input", title: "Input", description: "Styled text input wrapping the native <input> element." },
  {
    slug: "command",
    title: "Command",
    description: "A ⌘K command palette built on cmdk, with its own dialog chrome.",
  },
  {
    slug: "textarea",
    title: "Textarea",
    description: "Styled multi-line text input wrapping the native <textarea> element.",
  },
  {
    slug: "switch",
    title: "Switch",
    description: "Toggle switch built on Radix Switch, legible in both checked states and both themes.",
  },
  { slug: "tooltip", title: "Tooltip", description: "Tooltip, TooltipProvider, TooltipTrigger, TooltipContent built on Radix Tooltip." },
  { slug: "tabs", title: "Tabs", description: "Tabs, TabsList, TabsTrigger, TabsContent — a pill-segmented control." },
  { slug: "select", title: "Select", description: "Select, SelectTrigger, SelectContent, SelectItem, SelectValue built on Radix Select." },
  { slug: "dialog", title: "Dialog", description: "Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter built on Radix Dialog." },
  { slug: "alert", title: "Alert", description: "Alert, AlertTitle, AlertDescription with default/destructive variants." },
  { slug: "avatar", title: "Avatar", description: "Avatar, AvatarImage, AvatarFallback built on Radix Avatar." },
  { slug: "checkbox", title: "Checkbox", description: "Checkbox built on Radix Checkbox." },
  { slug: "radio-group", title: "Radio Group", description: "RadioGroup, RadioGroupItem built on Radix Radio Group." },
  { slug: "separator", title: "Separator", description: "Horizontal or vertical divider built on Radix Separator." },
  { slug: "progress", title: "Progress", description: "Progress bar built on Radix Progress." },
  {
    slug: "accordion",
    title: "Accordion",
    description: "Accordion, AccordionItem, AccordionTrigger, AccordionContent built on Radix Accordion.",
  },
  { slug: "popover", title: "Popover", description: "Popover, PopoverTrigger, PopoverContent, PopoverAnchor built on Radix Popover." },
  {
    slug: "dropdown-menu",
    title: "Dropdown Menu",
    description: "DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, and more, built on Radix.",
  },
  {
    slug: "table",
    title: "Table",
    description: "Table, TableHeader, TableBody, TableRow, TableHead, TableCell — styled native <table>, no primitive dependency.",
  },
  { slug: "skeleton", title: "Skeleton", description: "A pulsing placeholder for content that hasn't loaded yet." },
  {
    slug: "empty-state",
    title: "Empty State",
    description: "The \"no rows yet\" / \"no results\" state — icon, title, description, optional action.",
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    description: "Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage — plain semantic nav/ol markup, no primitive dependency.",
  },
  {
    slug: "pagination",
    title: "Pagination",
    description: "Pagination, PaginationContent, PaginationLink, PaginationPrevious, PaginationNext — built on Button's own variants, no primitive dependency.",
  },
];
