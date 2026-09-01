"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/dsgn/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { Checkbox } from "@/components/dsgn/checkbox";
import { Progress } from "@/components/dsgn/progress";
import { Separator } from "@/components/dsgn/separator";
import { Button } from "@/components/dsgn/button";
import { Textarea } from "@/components/dsgn/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/dsgn/collapsible";
import { NotificationList } from "@/components/design-tasks/notification-list";
import { ChevronDownIcon, CommentIcon } from "@/components/design-tasks/icons";
import { AssigneeStack, DueChip, LabelChip, PriorityChip } from "@/components/design-tasks/task-bits";
import {
  COLUMNS,
  formatDay,
  personById,
  subtaskTotals,
  type ColumnId,
  type SubtaskGroup,
  type Task,
} from "@/lib/design-tasks/board";
import { useBoard } from "@/lib/design-tasks/store";
import { cn } from "@/lib/utils";

function SubtaskGroupBlock({ task, group }: { task: Task; group: SubtaskGroup }) {
  const done = group.items.filter((i) => i.done).length;
  const complete = done === group.items.length;
  // A finished group starts collapsed — the open state is per group and is
  // seeded from the data, not stored, so reopening the sheet is idempotent.
  const [open, setOpen] = React.useState(!complete);
  const { pushEdit } = useBoard();

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg bg-muted/45 px-3 py-2.5">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 ease-[var(--ease-fluid)]",
            !open && "-rotate-90",
          )}
        />
        <span className="flex-1 text-sm font-medium">{group.name}</span>
        <span className="tnum text-xs text-ink-faint">
          {done}/{group.items.length}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-2 space-y-0.5 pl-6">
          {group.items.map((item) => (
            <li key={item.id} className="flex items-start gap-2.5 py-1.5">
              <Checkbox
                id={`${task.id}-${item.id}`}
                checked={item.done}
                onCheckedChange={(next) =>
                  pushEdit({
                    kind: "subtask",
                    taskId: task.id,
                    subtaskId: item.id,
                    previous: item.done,
                    next: next === true,
                  })
                }
                className="mt-0.5"
              />
              <label
                htmlFor={`${task.id}-${item.id}`}
                className={cn(
                  "cursor-pointer text-sm leading-snug transition-colors duration-300 ease-[var(--ease-fluid)]",
                  item.done ? "text-ink-faint line-through decoration-ink-faint/50" : "text-foreground",
                )}
              >
                {item.title}
              </label>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DescriptionEditor({ task }: { task: Task }) {
  const { pushEdit } = useBoard();
  // The draft is staged in local state and only becomes an overlay entry on
  // Save. Closing the sheet mid-edit is trivially correct: there is nothing
  // to roll back, because nothing was applied.
  const [draft, setDraft] = React.useState(task.summary);

  // Re-sync during render rather than in an effect. The saved value can move
  // underneath this component (a Save here, or an Undo from the header), and
  // React's documented adjust-state-on-prop-change idiom re-renders once
  // before paint instead of the effect version's second committed render.
  const [synced, setSynced] = React.useState(task.summary);
  if (synced !== task.summary) {
    setSynced(task.summary);
    setDraft(task.summary);
  }

  const dirty = draft !== task.summary;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
          Description
        </h3>
        {dirty && <span className="text-xs text-accent">Unsaved</span>}
      </div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label={`Description for ${task.id}`}
        className="min-h-28 resize-none text-sm leading-relaxed"
      />
      {/* Mounted only while dirty. Holding an always-present row at opacity 0
          avoids a layout shift but leaves a visible hole under the field,
          which reads as a rendering fault in a voice this quiet. */}
      {dirty && (
        <div data-reveal className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDraft(task.summary)}>
            Discard
          </Button>
          <Button
            size="sm"
            onClick={() =>
              pushEdit({ kind: "summary", taskId: task.id, previous: task.summary, next: draft })
            }
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

export function TaskDetailSheet() {
  const { tasks, openTaskId, openTask, pushEdit } = useBoard();
  const task = tasks.find((t) => t.id === openTaskId) ?? null;

  return (
    <Sheet open={task !== null} onOpenChange={(open) => !open && openTask(null)}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        {task && <SheetBody key={task.id} task={task} onMove={pushEdit} />}
      </SheetContent>
    </Sheet>
  );
}

function SheetBody({
  task,
  onMove,
}: {
  task: Task;
  onMove: ReturnType<typeof useBoard>["pushEdit"];
}) {
  const totals = subtaskTotals(task);

  return (
    <>
      <SheetHeader className="shrink-0 gap-3 px-6 pb-4 pt-6">
        <div className="flex items-center gap-2.5 pr-8">
          <span className="tnum font-mono text-xs tracking-tight text-ink-faint">{task.id}</span>
          <PriorityChip value={task.priority} />
          {task.comments > 0 && (
            <span className="tnum inline-flex items-center gap-1 text-xs text-ink-faint">
              <CommentIcon className="h-3.5 w-3.5" />
              {task.comments}
            </span>
          )}
        </div>
        <SheetTitle className="text-xl leading-tight tracking-tight">{task.title}</SheetTitle>
        <SheetDescription className="sr-only">
          Task detail for {task.id}. Change status, assignees, subtasks and description.
        </SheetDescription>
        <div className="flex flex-wrap items-center gap-1.5">
          {task.labels.map((l) => (
            <LabelChip key={l} id={l} />
          ))}
        </div>
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        <dl className="grid grid-cols-[7rem_1fr] items-center gap-x-4 gap-y-3 rounded-lg bg-muted/45 p-4">
          <dt className="text-xs font-medium text-ink-faint">Status</dt>
          <dd>
            <Select
              value={task.column}
              onValueChange={(next) =>
                onMove({
                  kind: "move",
                  taskId: task.id,
                  previous: task.column,
                  next: next as ColumnId,
                })
              }
            >
              <SelectTrigger className="h-9 w-full max-w-56 bg-card" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMNS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>

          <dt className="text-xs font-medium text-ink-faint">Assignees</dt>
          <dd className="flex items-center gap-2.5">
            <AssigneeStack ids={task.assigneeIds} size="md" />
            <span className="truncate text-sm text-muted-foreground">
              {task.assigneeIds.map((id) => personById(id)?.name.split(" ")[0]).join(", ")}
            </span>
          </dd>

          <dt className="text-xs font-medium text-ink-faint">Dates</dt>
          <dd className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="tnum">{formatDay(task.startDate)}</span>
            <span aria-hidden="true" className="text-ink-faint">
              &rarr;
            </span>
            <DueChip task={task} />
          </dd>
        </dl>

        <Separator className="my-6" />

        <DescriptionEditor task={task} />

        <Separator className="my-6" />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Subtasks
            </h3>
            <div className="flex items-center gap-2.5">
              <Progress
                value={totals.percent}
                aria-label="Subtasks complete"
                className="h-1.5 w-24"
              />
              <span className="tnum text-xs text-ink-faint">
                {totals.done}/{totals.total}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {task.subtaskGroups.map((group) => (
              <SubtaskGroupBlock key={group.id} task={task} group={group} />
            ))}
          </div>
        </div>

        {task.activity.length > 0 && (
          <>
            <Separator className="my-6" />
            <NotificationList
              asPanel={false}
              items={task.activity.map((a) => ({
                id: a.id,
                initials: personById(a.personId)?.initials ?? "??",
                text: a.text,
                time: a.time,
                unread: a.unread,
              }))}
            />
          </>
        )}
      </div>
    </>
  );
}
