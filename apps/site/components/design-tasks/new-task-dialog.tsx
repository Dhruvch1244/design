"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dsgn/dialog";
import { Input } from "@/components/dsgn/input";
import { Textarea } from "@/components/dsgn/textarea";
import { Button } from "@/components/dsgn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { PlusIcon } from "@/components/design-tasks/icons";
import {
  COLUMNS,
  CURRENT_USER,
  PRIORITIES,
  TODAY,
  addDays,
  type ColumnId,
  type Priority,
} from "@/lib/design-tasks/board";
import { useBoard } from "@/lib/design-tasks/store";

export function NewTaskDialog() {
  const { pushEdit, tasks, openTask } = useBoard();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [column, setColumn] = React.useState<ColumnId>("backlog");
  const [priority, setPriority] = React.useState<Priority>("medium");

  function reset() {
    setTitle("");
    setSummary("");
    setColumn("backlog");
    setPriority("medium");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    // Structural check only: a task needs a title to be a task at all. There
    // is deliberately no rule about how it should be worded, how long it may
    // be, or what it must start with — that would be gatekeeping content.
    if (!trimmed) return;

    // IDs come from the highest number already on the board, so they stay
    // stable and gap-free without a counter that survives a re-render.
    const highest = tasks.reduce((max, t) => {
      const n = Number.parseInt(t.id.replace(/\D/g, ""), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const id = `ALC-${highest + 1}`;

    pushEdit({
      kind: "create",
      task: {
        id,
        title: trimmed,
        summary: summary.trim() || "No description yet.",
        column,
        priority,
        labels: [],
        assigneeIds: [CURRENT_USER.id],
        startDate: TODAY,
        dueDate: addDays(TODAY, 7),
        comments: 0,
        subtaskGroups: [],
        activity: [],
      },
    });

    setOpen(false);
    reset();
    openTask(id);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>
          <span className="hidden sm:inline">New task</span>
          <span className="sr-only sm:hidden">New task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>
              It lands in cycle 14 assigned to you. Nothing is written anywhere permanent —
              Undo in the header removes it again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-5">
            <div className="space-y-1.5">
              <label htmlFor="new-task-title" className="text-xs font-medium text-ink-faint">
                Title
              </label>
              <Input
                id="new-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs doing?"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-task-summary" className="text-xs font-medium text-ink-faint">
                Description
              </label>
              <Textarea
                id="new-task-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Optional. What does done look like?"
                className="min-h-24 resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-ink-faint">Column</span>
                <Select value={column} onValueChange={(v) => setColumn(v as ColumnId)}>
                  <SelectTrigger aria-label="Column">
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
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-ink-faint">Priority</span>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger aria-label="Priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={title.trim() === ""}>
              Add to board
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
