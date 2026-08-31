"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Button } from "@/components/dsgn/button";
import { EmptyState } from "@/components/dsgn/empty-state";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { SparkIcon } from "@/components/design-tasks/icons";
import {
  PEOPLE,
  TIMELINE_DAYS,
  TIMELINE_START,
  TODAY,
  addDays,
  daysBetween,
  formatDay,
  isWeekend,
  weekdayShort,
  type Task,
} from "@/lib/design-tasks/board";
import { filterTasks, useBoard } from "@/lib/design-tasks/store";
import { cn } from "@/lib/utils";

const DAYS = Array.from({ length: TIMELINE_DAYS }, (_, i) => addDays(TIMELINE_START, i));
const TODAY_INDEX = daysBetween(TIMELINE_START, TODAY);

/** Clamp a task's span into the visible window; a bar that starts before the
 *  window still renders, flush to the left edge, rather than disappearing. */
function span(task: Task): { start: number; length: number } {
  const rawStart = daysBetween(TIMELINE_START, task.startDate);
  const rawEnd = daysBetween(TIMELINE_START, task.dueDate);
  const start = Math.max(0, Math.min(rawStart, TIMELINE_DAYS - 1));
  const end = Math.max(start, Math.min(rawEnd, TIMELINE_DAYS - 1));
  return { start, length: end - start + 1 };
}

const BAR_TONE: Record<Task["column"], string> = {
  backlog: "var(--muted-foreground)",
  progress: "var(--accent)",
  review: "var(--hue-research)",
  done: "var(--hue-infra)",
};

function DayGrid({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("grid", className)}
      style={{ gridTemplateColumns: `repeat(${TIMELINE_DAYS}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

function TaskBar({ task }: { task: Task }) {
  const { openTask } = useBoard();
  const { start, length } = span(task);
  const tone = BAR_TONE[task.column];

  return (
    <DayGrid className="h-9 items-center">
      <div style={{ gridColumn: `${start + 1} / span ${length}` }} className="px-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => openTask(task.id)}
              className="flex h-7 w-full items-center gap-1.5 overflow-hidden rounded-full px-2.5 text-left text-xs font-medium transition-transform duration-300 ease-[var(--ease-fluid)] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{
                color: tone,
                background: `color-mix(in srgb, ${tone} 14%, transparent)`,
              }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: tone }}
              />
              <span className="truncate">{task.title}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            <span className="tnum font-mono">{task.id}</span> · {formatDay(task.startDate)} to{" "}
            {formatDay(task.dueDate)}
          </TooltipContent>
        </Tooltip>
      </div>
    </DayGrid>
  );
}

export function TimelineView() {
  const { tasks, filters, clearFilters } = useBoard();
  const visible = React.useMemo(() => filterTasks(tasks, filters), [tasks, filters]);

  const lanes = PEOPLE.map((person) => ({
    person,
    tasks: visible
      .filter((t) => t.assigneeIds.includes(person.id))
      .sort((a, b) => span(a).start - span(b).start),
  })).filter((lane) => lane.tasks.length > 0);

  if (lanes.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-start justify-center pt-10">
        <EmptyState
          title="Nobody has work in this window"
          description="The three weeks from 11 May contain no task matching the current filters."
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
    <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-card p-3 shadow-sm md:p-4">
      {/* The grid has a real minimum width. Rather than letting it push the
          page sideways, it scrolls inside this container — the page itself
          never gains a horizontal scrollbar at any viewport. */}
      <div className="min-w-[54rem]">
        <div className="grid grid-cols-[9.5rem_1fr] items-end gap-x-3 pb-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
            Cycle 14
          </span>
          <DayGrid>
            {DAYS.map((day, i) => (
              <div
                key={day}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-t-md pb-1 pt-1",
                  isWeekend(day) && "bg-muted/50",
                )}
              >
                <span className="text-[0.625rem] uppercase text-ink-faint">
                  {weekdayShort(day)}
                </span>
                <span
                  className={cn(
                    "tnum flex h-5 w-5 items-center justify-center rounded-full text-[0.6875rem]",
                    i === TODAY_INDEX
                      ? "bg-accent font-semibold text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {day.slice(-2)}
                </span>
              </div>
            ))}
          </DayGrid>
        </div>

        <div className="relative">
          {/* Today's marker sits on its own absolutely-positioned layer, a
              sibling of the lanes rather than an ancestor of them — a
              decorative layer must never be able to take real content down
              with it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 z-10 w-px bg-accent/45"
            style={{
              left: `calc(9.5rem + 0.75rem + ((100% - 9.5rem - 0.75rem) * ${
                (TODAY_INDEX + 0.5) / TIMELINE_DAYS
              }))`,
            }}
          />

          <div className="space-y-4">
            {lanes.map((lane) => (
              <div key={lane.person.id} className="grid grid-cols-[9.5rem_1fr] gap-x-3">
                <div className="flex items-start gap-2 pt-1.5">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-accent/14 text-[0.625rem] font-semibold text-accent">
                      {lane.person.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-tight">
                      {lane.person.name.split(" ")[0]}
                    </p>
                    <p className="truncate text-[0.6875rem] text-ink-faint">{lane.person.role}</p>
                  </div>
                </div>
                <div className="relative">
                  {/* Weekend wash, painted once per lane behind the bars. */}
                  <DayGrid className="pointer-events-none absolute inset-0">
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className={cn("h-full", isWeekend(day) && "bg-muted/50")}
                      />
                    ))}
                  </DayGrid>
                  <div className="relative space-y-1">
                    {lane.tasks.map((task) => (
                      <TaskBar key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
