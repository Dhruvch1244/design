"use client";

import * as React from "react";
import { Card } from "@/components/dsgn/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/dsgn/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/dsgn/alert-dialog";
import { CommentIcon } from "@/components/design-tasks/icons";
import {
  AssigneeStack,
  DueChip,
  LabelChip,
  LabelSwatch,
  PriorityChip,
  SubtaskMeter,
} from "@/components/design-tasks/task-bits";
import { COLUMNS, PRIORITIES, type ColumnId, type Priority, type Task } from "@/lib/design-tasks/board";
import { useBoard } from "@/lib/design-tasks/store";
import { cn } from "@/lib/utils";

export function TaskCard({ task, index }: { task: Task; index: number }) {
  const { openTask, pushEdit, density } = useBoard();
  const [confirmArchive, setConfirmArchive] = React.useState(false);
  const compact = density === "compact";

  function move(next: string) {
    if (next === task.column) return;
    pushEdit({
      kind: "move",
      taskId: task.id,
      previous: task.column,
      next: next as ColumnId,
    });
  }

  function setPriority(next: string) {
    if (next === task.priority) return;
    pushEdit({
      kind: "priority",
      taskId: task.id,
      previous: task.priority,
      next: next as Priority,
    });
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card
            data-reveal
            style={{ "--reveal-index": index } as React.CSSProperties}
            className={cn(
              "group relative cursor-default transition-[transform,box-shadow] duration-300 ease-[var(--ease-fluid)]",
              "hover:-translate-y-0.5 hover:shadow-md focus-within:shadow-md",
              compact ? "p-3" : "p-4",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              {compact ? (
                <div className="flex items-center gap-1 pt-1">
                  {task.labels.map((l) => (
                    <LabelSwatch key={l} id={l} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  {task.labels.map((l) => (
                    <LabelChip key={l} id={l} />
                  ))}
                </div>
              )}
              {(task.priority === "urgent" || task.priority === "high") && (
                <PriorityChip value={task.priority} className="shrink-0" />
              )}
            </div>

            <h3 className={cn("font-medium leading-snug", compact ? "mt-2 text-sm" : "mt-3 text-[0.9375rem]")}>
              {/*
                The whole card is the click target via a stretched
                pseudo-element on this button, rather than a click handler on
                a <div>. One real, focusable, keyboard-operable control per
                card — and the avatars below stay separately reachable
                because they sit above it on the z axis.
              */}
              <button
                type="button"
                onClick={() => openTask(task.id)}
                className="text-left after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2"
              >
                {task.title}
              </button>
            </h3>

            {!compact && <SubtaskMeter task={task} className="mt-3" />}

            <div className={cn("flex items-center justify-between gap-3", compact ? "mt-2.5" : "mt-3.5")}>
              {/* Wraps rather than squeezing. At four columns on a 1280px
                  screen the ID, due chip and comment count do not always fit
                  on one line, and a mid-word "ALC-\n098" reads as a bug. */}
              <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="tnum shrink-0 whitespace-nowrap font-mono text-[0.6875rem] tracking-tight text-ink-faint">
                  {task.id}
                </span>
                <DueChip task={task} />
                {task.comments > 0 && !compact && (
                  <span className="tnum inline-flex items-center gap-1 text-xs text-ink-faint">
                    <CommentIcon className="h-3.5 w-3.5" />
                    {task.comments}
                  </span>
                )}
              </div>
              <div className="relative z-10 shrink-0">
                <AssigneeStack ids={task.assigneeIds} />
              </div>
            </div>
          </Card>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56">
          <ContextMenuItem onSelect={() => openTask(task.id)}>
            Open details
            <ContextMenuShortcut>Enter</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>Move to</ContextMenuLabel>
          <ContextMenuRadioGroup value={task.column} onValueChange={move}>
            {COLUMNS.map((column) => (
              <ContextMenuRadioItem key={column.id} value={column.id}>
                {column.name}
              </ContextMenuRadioItem>
            ))}
          </ContextMenuRadioGroup>
          <ContextMenuSeparator />
          <ContextMenuLabel>Priority</ContextMenuLabel>
          <ContextMenuRadioGroup value={task.priority} onValueChange={setPriority}>
            {PRIORITIES.map((p) => (
              <ContextMenuRadioItem key={p.id} value={p.id}>
                {p.name}
              </ContextMenuRadioItem>
            ))}
          </ContextMenuRadioGroup>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
            onSelect={(event) => {
              // Radix closes the menu and restores focus on select; opening
              // the confirm dialog in the same tick fights that. Deferring
              // one frame lets the menu finish before the dialog claims focus.
              event.preventDefault();
              requestAnimationFrame(() => setConfirmArchive(true));
            }}
          >
            Archive task
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {task.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              {task.title} leaves the board. It stays in the cycle history, and Undo in the
              header brings it straight back — nothing about this is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={() => pushEdit({ kind: "archive", taskId: task.id })}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
