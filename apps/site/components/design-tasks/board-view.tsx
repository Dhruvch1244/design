"use client";

import * as React from "react";
import { ScrollArea } from "@/components/dsgn/scroll-area";
import { Button } from "@/components/dsgn/button";
import { EmptyState } from "@/components/dsgn/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { TaskCard } from "@/components/design-tasks/task-card";
import { MoreIcon, PlusIcon, SparkIcon } from "@/components/design-tasks/icons";
import { COLUMNS, type Column, type Task } from "@/lib/design-tasks/board";
import { byPriority, filterTasks, tasksInColumn, useBoard } from "@/lib/design-tasks/store";
import { cn } from "@/lib/utils";

function ColumnPanel({
  column,
  tasks,
  filtered,
  active,
}: {
  column: Column;
  tasks: Task[];
  filtered: boolean;
  active: boolean;
}) {
  const { clearFilters } = useBoard();

  return (
    <section
      data-column={column.id}
      data-column-active={active ? "true" : "false"}
      aria-label={column.name}
      className="flex min-h-0 flex-col rounded-2xl bg-panel p-2.5 md:p-3"
    >
      <header className="flex shrink-0 items-center gap-2 px-1.5 pb-3 pt-1">
        <h2 className="text-sm font-semibold tracking-tight">{column.name}</h2>
        <span className="tnum rounded-full bg-card/70 px-2 py-0.5 text-[0.6875rem] font-medium text-ink-faint">
          {tasks.length}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Add a task to ${column.name}`}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add to {column.name}</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`${column.name} column options`}>
                <MoreIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{column.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sort by priority</DropdownMenuItem>
              <DropdownMenuItem>Sort by due date</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Collapse column</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <p className="shrink-0 px-1.5 pb-3 text-xs leading-relaxed text-ink-faint">{column.rule}</p>

      {/*
        Each column scrolls on its own rather than the page scrolling: the
        board is an application view, not a document, and four columns of
        different lengths sharing one page scrollbar makes the shortest
        column's header drift away from its cards.
      */}
      <ScrollArea className="-mx-1 min-h-0 flex-1 px-1">
        <div className="space-y-2.5 pb-1">
          {tasks.length === 0 ? (
            // Filtered-empty and genuinely-empty say different things. A
            // column that looks empty because of a filter is the single
            // easiest way to make someone think their data is gone.
            <EmptyState
              title={filtered ? "Nothing matches here" : "Nothing in this column"}
              description={
                filtered
                  ? "Other columns may still have matches."
                  : `${column.rule}. Add the first one.`
              }
              icon={<SparkIcon className="h-5 w-5" />}
              action={
                filtered ? (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button variant="soft" size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>
                    New task
                  </Button>
                )
              }
              className="p-6"
            />
          ) : (
            tasks.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)
          )}
        </div>
      </ScrollArea>
    </section>
  );
}

export function BoardView() {
  const { tasks, filters, filtersActive, mobileColumn, setMobileColumn } = useBoard();
  const visible = React.useMemo(() => filterTasks(tasks, filters), [tasks, filters]);

  const byColumn = COLUMNS.map((column) => ({
    column,
    tasks: tasksInColumn(visible, column.id).sort(byPriority),
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/*
        Mobile board strategy, decided rather than defaulted: below md, four
        columns cannot be side by side without either horizontal page scroll
        or three unreadable slivers. One column shows at a time and this chip
        row switches between them. The columns are all still rendered — CSS
        in globals.css hides the inactive ones off `data-column-active` — so
        server and client markup are identical and there is no hydration
        branch or layout flash.
      */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-0.5 md:hidden" role="tablist" aria-label="Board column">
        {byColumn.map(({ column, tasks: columnTasks }) => {
          const active = column.id === mobileColumn;
          return (
            <button
              key={column.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMobileColumn(column.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium",
                "transition-colors duration-300 ease-[var(--ease-fluid)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active ? "bg-card text-foreground shadow-sm" : "bg-panel text-muted-foreground",
              )}
            >
              {column.name}
              <span className="tnum text-[0.6875rem] text-ink-faint">{columnTasks.length}</span>
            </button>
          );
        })}
      </div>

      {/* Explicit row tracks: without them the auto rows at the two-column
          tablet size size to content and overflow the fixed-height shell. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 gap-3 md:grid-cols-2 md:grid-rows-2 md:gap-4 xl:grid-cols-4 xl:grid-rows-1">
        {byColumn.map(({ column, tasks: columnTasks }) => (
          <ColumnPanel
            key={column.id}
            column={column}
            tasks={columnTasks}
            filtered={filtersActive}
            active={column.id === mobileColumn}
          />
        ))}
      </div>
    </div>
  );
}
