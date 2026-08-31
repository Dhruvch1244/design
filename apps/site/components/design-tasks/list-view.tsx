"use client";

import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/dsgn/collapsible";
import { Checkbox } from "@/components/dsgn/checkbox";
import { Separator } from "@/components/dsgn/separator";
import { Button } from "@/components/dsgn/button";
import { EmptyState } from "@/components/dsgn/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { ChevronDownIcon, SparkIcon } from "@/components/design-tasks/icons";
import { AssigneeStack, DueChip, LabelSwatch, PriorityChip } from "@/components/design-tasks/task-bits";
import { COLUMNS, type ColumnId, type Task } from "@/lib/design-tasks/board";
import { byPriority, filterTasks, tasksInColumn, useBoard } from "@/lib/design-tasks/store";
import { cn } from "@/lib/utils";

function Row({
  task,
  selected,
  onToggle,
}: {
  task: Task;
  selected: boolean;
  onToggle: (next: boolean) => void;
}) {
  const { openTask } = useBoard();
  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors duration-300 ease-[var(--ease-fluid)]",
        selected ? "bg-accent/8" : "hover:bg-muted/60",
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(next) => onToggle(next === true)}
        aria-label={`Select ${task.id}`}
        // z-10: the row title below stretches a pseudo-element across the
        // whole row to make it clickable, which otherwise sits on top of
        // this checkbox and swallows the click. Caught by a Playwright run,
        // not by reading the markup.
        className="relative z-10 shrink-0"
      />
      <span className="tnum hidden w-16 shrink-0 font-mono text-[0.6875rem] tracking-tight text-ink-faint sm:block">
        {task.id}
      </span>
      <button
        type="button"
        onClick={() => openTask(task.id)}
        className="min-w-0 flex-1 truncate text-left text-sm font-medium after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
      >
        {task.title}
      </button>
      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        {task.labels.map((l) => (
          <LabelSwatch key={l} id={l} />
        ))}
      </div>
      <div className="hidden shrink-0 lg:block">
        <PriorityChip value={task.priority} />
      </div>
      <div className="hidden w-24 shrink-0 justify-end md:flex">
        <DueChip task={task} />
      </div>
      <div className="relative z-10 shrink-0">
        <AssigneeStack ids={task.assigneeIds} />
      </div>
    </div>
  );
}

export function ListView() {
  const { tasks, filters, clearFilters, pushEdit } = useBoard();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [openGroups, setOpenGroups] = React.useState<ColumnId[]>(
    COLUMNS.map((c) => c.id).filter((id) => id !== "done"),
  );

  const visible = React.useMemo(() => filterTasks(tasks, filters), [tasks, filters]);

  function toggleRow(id: string, next: boolean) {
    setSelected((prev) => (next ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  /**
   * A bulk move builds every entry first and appends them together, so the
   * whole action is one thing from the person's point of view — and its
   * undo is one Undo per row, in the order they were applied, with nothing
   * half-done in between.
   */
  function bulkMove(next: string) {
    const targets = visible.filter((t) => selected.includes(t.id) && t.column !== next);
    targets.forEach((task) =>
      pushEdit({
        kind: "move",
        taskId: task.id,
        previous: task.column,
        next: next as ColumnId,
      }),
    );
    setSelected([]);
  }

  if (visible.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-start justify-center pt-10">
        <EmptyState
          title="No tasks match these filters"
          description="Cycle 14 still has thirteen tasks. None of them match every filter that is currently on."
          icon={<SparkIcon className="h-5 w-5" />}
          action={
            <Button variant="soft" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <div className="mx-auto max-w-4xl space-y-3">
          {COLUMNS.map((column) => {
            const rows = tasksInColumn(visible, column.id).sort(byPriority);
            if (rows.length === 0) return null;
            const open = openGroups.includes(column.id);
            return (
              <Collapsible
                key={column.id}
                open={open}
                onOpenChange={(next) =>
                  setOpenGroups((prev) =>
                    next ? [...prev, column.id] : prev.filter((c) => c !== column.id),
                  )
                }
                className="rounded-2xl bg-card p-2 shadow-sm"
              >
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 ease-[var(--ease-fluid)]",
                      !open && "-rotate-90",
                    )}
                  />
                  <span className="text-sm font-semibold tracking-tight">{column.name}</span>
                  <span className="tnum rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-ink-faint">
                    {rows.length}
                  </span>
                  <span className="ml-auto hidden text-xs text-ink-faint sm:block">
                    {column.rule}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-1">
                    {rows.map((task, i) => (
                      <React.Fragment key={task.id}>
                        <Row
                          task={task}
                          selected={selected.includes(task.id)}
                          onToggle={(next) => toggleRow(task.id, next)}
                        />
                        {i < rows.length - 1 && <Separator className="mx-2.5 w-auto" />}
                      </React.Fragment>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      {/* Bulk bar. Slides rather than appears, and only ever animates
          transform/opacity so it cannot reflow the list behind it. */}
      <div
        className={cn(
          "pointer-events-none sticky bottom-0 flex justify-center pb-1 transition-all duration-300 ease-[var(--ease-fluid)]",
          selected.length > 0 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
        aria-hidden={selected.length === 0}
      >
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-3 rounded-full bg-card px-3 py-2 shadow-lg",
            selected.length === 0 && "pointer-events-none",
          )}
        >
          <span className="tnum pl-2 text-sm font-medium">{selected.length} selected</span>
          <Select value="" onValueChange={bulkMove}>
            <SelectTrigger className="h-9 w-40 rounded-full" aria-label="Move selected to">
              <SelectValue placeholder="Move to…" />
            </SelectTrigger>
            <SelectContent>
              {COLUMNS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
