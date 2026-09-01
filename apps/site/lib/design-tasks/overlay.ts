/**
 * Non-destructive edits, as an overlay.
 *
 * This is the dsgn philosophy's third pillar implemented literally rather
 * than paraphrased: the seed board in `lib/board.ts` is never mutated. Every
 * change a person makes — moving a card, checking a subtask, rewriting a
 * summary, archiving something — is appended here as an entry carrying both
 * its previous and next value. The view renders `seed + overlay`.
 *
 * Undo is therefore "drop the last entry", not "compute and apply an
 * inverse". That distinction is the whole point: there is no edit in this
 * app whose inverse has to be worked out, including the lossy ones
 * (archive), because nothing was ever destroyed to begin with.
 *
 * Pure module: no React, no DOM.
 */

import type { ColumnId, Priority, Task } from "./board";

export type Edit =
  | { kind: "move"; taskId: string; previous: ColumnId; next: ColumnId }
  | { kind: "priority"; taskId: string; previous: Priority; next: Priority }
  | { kind: "subtask"; taskId: string; subtaskId: string; previous: boolean; next: boolean }
  | { kind: "summary"; taskId: string; previous: string; next: string }
  | { kind: "assign"; taskId: string; previous: string[]; next: string[] }
  | { kind: "archive"; taskId: string }
  | { kind: "create"; task: Task };

/** A short human sentence for the pending-changes list. */
export function describeEdit(edit: Edit, titleOf: (id: string) => string): string {
  switch (edit.kind) {
    case "move":
      return `Moved ${edit.taskId} to ${edit.next}`;
    case "priority":
      return `Set ${edit.taskId} to ${edit.next} priority`;
    case "subtask":
      return `${edit.next ? "Checked" : "Unchecked"} a subtask on ${edit.taskId}`;
    case "summary":
      return `Rewrote the description of ${edit.taskId}`;
    case "assign":
      return `Changed who is on ${edit.taskId}`;
    case "archive":
      return `Archived ${edit.taskId} — ${titleOf(edit.taskId)}`;
    case "create":
      return `Added ${edit.task.id}`;
  }
}

function mapTask(tasks: Task[], id: string, fn: (t: Task) => Task): Task[] {
  return tasks.map((t) => (t.id === id ? fn(t) : t));
}

/**
 * Fold the overlay over an untouched copy of the seed.
 *
 * O(edits x tasks) and deliberately so: the overlay is a session's worth of
 * changes, and a recomputation from the original on every render is what
 * makes "the original is never touched" a structural guarantee rather than
 * a convention somebody has to remember.
 */
export function applyOverlay(seed: readonly Task[], edits: readonly Edit[]): Task[] {
  let tasks: Task[] = seed.map((t) => ({ ...t }));

  for (const edit of edits) {
    switch (edit.kind) {
      case "create":
        tasks = [{ ...edit.task }, ...tasks];
        break;
      case "archive":
        tasks = tasks.filter((t) => t.id !== edit.taskId);
        break;
      case "move":
        tasks = mapTask(tasks, edit.taskId, (t) => ({ ...t, column: edit.next }));
        break;
      case "priority":
        tasks = mapTask(tasks, edit.taskId, (t) => ({ ...t, priority: edit.next }));
        break;
      case "summary":
        tasks = mapTask(tasks, edit.taskId, (t) => ({ ...t, summary: edit.next }));
        break;
      case "assign":
        tasks = mapTask(tasks, edit.taskId, (t) => ({ ...t, assigneeIds: [...edit.next] }));
        break;
      case "subtask":
        tasks = mapTask(tasks, edit.taskId, (t) => ({
          ...t,
          subtaskGroups: t.subtaskGroups.map((g) => ({
            ...g,
            items: g.items.map((i) =>
              i.id === edit.subtaskId ? { ...i, done: edit.next } : i,
            ),
          })),
        }));
        break;
    }
  }

  return tasks;
}
