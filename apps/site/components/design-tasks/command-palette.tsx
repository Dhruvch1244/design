"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/dsgn/command";
import { BoardIcon, ListIcon, TimelineIcon, SearchIcon, MoonIcon } from "@/components/design-tasks/icons";
import { LabelSwatch } from "@/components/design-tasks/task-bits";
import { columnName } from "@/lib/design-tasks/board";
import { useBoard, type ViewId } from "@/lib/design-tasks/store";

// Matches @/components/theme-toggle's own toggle exactly (same data-theme
// attribute, same localStorage key) rather than this project's original
// lib/theme.ts, which is dropped in the embedded version in favor of the
// site's single shared data-theme attribute on <html>.
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

const VIEWS: { id: ViewId; name: string; icon: React.ReactNode }[] = [
  { id: "board", name: "Board", icon: <BoardIcon className="h-4 w-4" /> },
  { id: "list", name: "List", icon: <ListIcon className="h-4 w-4" /> },
  { id: "timeline", name: "Timeline", icon: <TimelineIcon className="h-4 w-4" /> },
];

export function CommandPalette() {
  const { tasks, paletteOpen, setPaletteOpen, setView, openTask, clearFilters } = useBoard();

  function run(action: () => void) {
    setPaletteOpen(false);
    action();
  }

  return (
    <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen} label="Search Alcove">
      <CommandInput placeholder="Jump to a task, or type a command…" />
      <CommandList>
        <CommandEmpty>Nothing in cycle 14 matches that.</CommandEmpty>

        <CommandGroup heading="Views">
          {VIEWS.map((view) => (
            <CommandItem
              key={view.id}
              value={`view ${view.name}`}
              onSelect={() => run(() => setView(view.id))}
            >
              {view.icon}
              {view.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Tasks">
          {tasks.map((task) => (
            <CommandItem
              key={task.id}
              value={`${task.id} ${task.title}`}
              onSelect={() => run(() => openTask(task.id))}
            >
              <span className="flex shrink-0 items-center gap-1">
                {task.labels.slice(0, 2).map((l) => (
                  <LabelSwatch key={l} id={l} />
                ))}
              </span>
              <span className="truncate">{task.title}</span>
              <CommandShortcut>
                {task.id} · {columnName(task.column)}
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem value="clear filters" onSelect={() => run(clearFilters)}>
            <SearchIcon className="h-4 w-4" />
            Clear every filter
          </CommandItem>
          <CommandItem
            value="toggle theme appearance dark light"
            onSelect={() => run(() => toggleTheme())}
          >
            <MoonIcon className="h-4 w-4" />
            Switch appearance
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
