"use client";

import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/dsgn/breadcrumb";
import { Button } from "@/components/dsgn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconBell, IconBook, IconMenu, IconSearch } from "@/components/design-analytics/icons";
import { VIEW_BY_ID, WORKSPACE_NAME, type ViewId } from "@/lib/design-analytics/views";

export interface TopBarProps {
  activeView: ViewId;
  onOpenNav: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

export function TopBar({ activeView, onOpenNav, onOpenSearch, onOpenSettings }: TopBarProps) {
  const view = VIEW_BY_ID[activeView];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenNav}
        aria-label="Open navigation"
      >
        <IconMenu className="h-4.5 w-4.5" />
      </Button>

      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="hidden sm:inline-flex">
            <span className="text-muted-foreground">{WORKSPACE_NAME}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:inline-flex" />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{view.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        {/*
          The search control is a button that opens the palette, not a real
          input. A focusable text field here would compete with the palette's
          own input for focus and would need its own results surface; the
          registry's CommandDialog already is that surface.
        */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="hidden gap-2 pr-2 font-normal text-muted-foreground sm:inline-flex"
          leftIcon={<IconSearch className="h-4 w-4" />}
        >
          Search
          <kbd className="ml-4 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenSearch}
          className="sm:hidden"
          aria-label="Search"
        >
          <IconSearch className="h-4.5 w-4.5" />
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
              <IconBell className="h-4.5 w-4.5" />
              <span
                aria-hidden="true"
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications — 2 unread</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Instrumentation guide"
              className="hidden sm:inline-flex"
            >
              <IconBook className="h-4.5 w-4.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Instrumentation guide</TooltipContent>
        </Tooltip>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="ml-1 rounded-full transition-opacity duration-150 ease-fluid hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[11px] font-medium">RM</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-sm font-medium">Rosa Marchetti</span>
              <span className="block text-xs text-muted-foreground">rosa@northbridge.dev</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onOpenSettings}>Workspace settings</DropdownMenuItem>
            <DropdownMenuItem>Personal preferences</DropdownMenuItem>
            <DropdownMenuItem>Write keys</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
