"use client";

import * as React from "react";
import { Button } from "@/components/dsgn/button";
import { TabsList, TabsTrigger } from "@/components/dsgn/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/dsgn/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { MobileNavSheet, useMobileNav } from "@/components/shared/mobile-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import { SidebarContent } from "@/components/design-tasks/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { FilterPopover } from "@/components/design-tasks/filter-popover";
import { NewTaskDialog } from "@/components/design-tasks/new-task-dialog";
import { AssigneeStack } from "@/components/design-tasks/task-bits";
import {
  BoardIcon,
  ListIcon,
  MenuIcon,
  SearchIcon,
  TimelineIcon,
  UndoIcon,
} from "@/components/design-tasks/icons";
import { PEOPLE, formatDay, TIMELINE_START, addDays, TIMELINE_DAYS } from "@/lib/design-tasks/board";
import { describeEdit } from "@/lib/design-tasks/overlay";
import { useBoard } from "@/lib/design-tasks/store";

function MobileNav() {
  const nav = useMobileNav();
  return (
    <MobileNavSheet
      open={nav.open}
      onOpenChange={nav.setOpen}
      title="Navigation"
      className="w-72 bg-background p-0"
      trigger={
        <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation">
          <MenuIcon className="h-5 w-5" />
        </Button>
      }
    >
      <SidebarContent onNavigate={nav.close} />
    </MobileNavSheet>
  );
}

function PendingChanges() {
  const { edits, undo, discardAll, tasks } = useBoard();
  const titleOf = React.useCallback(
    (id: string) => tasks.find((t) => t.id === id)?.title ?? id,
    [tasks],
  );

  if (edits.length === 0) {
    return (
      <span className="hidden items-center gap-1.5 px-2 text-xs text-ink-faint sm:inline-flex">
        No changes yet
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="soft" size="sm" leftIcon={<UndoIcon className="h-4 w-4" />}>
          <span className="tnum">{edits.length}</span>
          <span className="hidden sm:inline">unsaved</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          Staged over the original board — nothing is written until you publish the cycle.
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {edits
          .slice(-5)
          .reverse()
          .map((edit, i) => (
            <DropdownMenuItem key={`${edit.kind}-${i}`} className="cursor-default text-xs">
              <span className="truncate">{describeEdit(edit, titleOf)}</span>
            </DropdownMenuItem>
          ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={undo}>Undo the last change</DropdownMenuItem>
        <DropdownMenuItem onSelect={discardAll}>Discard all {edits.length}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar() {
  const { setPaletteOpen, density, setDensity, view } = useBoard();
  const windowEnd = addDays(TIMELINE_START, TIMELINE_DAYS - 1);

  return (
    <header className="shrink-0 px-4 pt-4 md:px-6 md:pt-6">
      <div className="flex items-start gap-3">
        <MobileNav />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-ink-faint">
            Fernway Studio · {formatDay(TIMELINE_START)} – {formatDay(windowEnd)}
          </p>
          <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">
            Cycle 14 · Mobile app
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="mr-1 hidden xl:block">
            <AssigneeStack ids={PEOPLE.map((p) => p.id)} />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPaletteOpen(true)}
                aria-label="Search tasks and commands"
                className="gap-2 px-2.5 md:px-3"
              >
                <SearchIcon className="h-4 w-4" />
                <span className="hidden text-muted-foreground md:inline">Search</span>
                <kbd className="ml-1 hidden rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.625rem] text-ink-faint md:inline">
                  ⌘K
                </kbd>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search or jump to a task</TooltipContent>
          </Tooltip>

          <ThemeToggle />
          <NewTaskDialog />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 pb-4 md:gap-3">
        <TabsList aria-label="Board view">
          <TabsTrigger value="board" className="gap-1.5">
            <BoardIcon className="h-4 w-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <ListIcon className="h-4 w-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <TimelineIcon className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {view === "board" && (
          <ToggleGroup
            type="single"
            size="sm"
            value={density}
            onValueChange={(next) => next && setDensity(next as typeof density)}
            aria-label="Card density"
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="roomy">Roomy</ToggleGroupItem>
            <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
          </ToggleGroup>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <PendingChanges />
          <FilterPopover />
        </div>
      </div>
    </header>
  );
}
