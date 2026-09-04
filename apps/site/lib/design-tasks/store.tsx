"use client";

/**
 * The one place board state lives.
 *
 * Two things are deliberately kept apart in here:
 *   - the *edit overlay* (`edits`), which is data and is folded over the
 *     frozen seed by the pure `applyOverlay` in lib/overlay.ts;
 *   - *view state* (which task is open, what is filtered, which column the
 *     phone layout is showing), which is UI and never touches the data.
 *
 * Mixing the two is how "undo" quietly becomes "undo, and also reopen a
 * panel the person had closed". Undo here pops one entry off `edits` and
 * nothing else moves.
 */

import * as React from "react";
import { useCommandShortcut } from "@/components/shared/use-command-shortcut";
import {
  SEED_BOARD,
  type ColumnId,
  type LabelId,
  type Priority,
  type Task,
} from "./board";
import { applyOverlay, type Edit } from "./overlay";

export type ViewId = "board" | "list" | "timeline";
export type Density = "roomy" | "compact";

export interface Filters {
  labels: LabelId[];
  people: string[];
  query: string;
}

const EMPTY_FILTERS: Filters = { labels: [], people: [], query: "" };

interface BoardContextValue {
  tasks: Task[];
  edits: Edit[];
  pushEdit: (edit: Edit) => void;
  undo: () => void;
  discardAll: () => void;

  view: ViewId;
  setView: (v: ViewId) => void;
  density: Density;
  setDensity: (d: Density) => void;

  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filtersActive: boolean;
  clearFilters: () => void;

  openTaskId: string | null;
  openTask: (id: string | null) => void;

  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;

  mobileColumn: ColumnId;
  setMobileColumn: (id: ColumnId) => void;
}

const BoardContext = React.createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [edits, setEdits] = React.useState<Edit[]>([]);
  const [view, setView] = React.useState<ViewId>("board");
  const [density, setDensity] = React.useState<Density>("roomy");
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS);
  const [openTaskId, setOpenTaskId] = React.useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [mobileColumn, setMobileColumn] = React.useState<ColumnId>("progress");

  // The board is derived, never stored. Storing it would be the moment the
  // original stopped being the source of truth.
  const tasks = React.useMemo(() => applyOverlay(SEED_BOARD, edits), [edits]);

  const pushEdit = React.useCallback((edit: Edit) => {
    setEdits((prev) => [...prev, edit]);
  }, []);

  const undo = React.useCallback(() => {
    setEdits((prev) => prev.slice(0, -1));
  }, []);

  const discardAll = React.useCallback(() => setEdits([]), []);

  const clearFilters = React.useCallback(() => setFilters(EMPTY_FILTERS), []);

  const filtersActive =
    filters.labels.length > 0 || filters.people.length > 0 || filters.query.trim() !== "";

  const openTask = React.useCallback((id: string | null) => setOpenTaskId(id), []);

  // One global shortcut owner. Every other component asks the store to open
  // the palette rather than binding its own key handler, so there is exactly
  // one place that can claim a keystroke. The listener itself is shared with
  // the other showcases (components/shared/use-command-shortcut.ts), which is
  // also where the guard against opening the palette on top of an already-open
  // Sheet lives — ⌘K over the task detail sheet used to render the palette
  // outside that sheet's focus trap.
  useCommandShortcut([
    { key: "k", onTrigger: () => setPaletteOpen((open) => !open), ownsOpenModal: paletteOpen },
  ]);

  const value: BoardContextValue = {
    tasks,
    edits,
    pushEdit,
    undo,
    discardAll,
    view,
    setView,
    density,
    setDensity,
    filters,
    setFilters,
    filtersActive,
    clearFilters,
    openTaskId,
    openTask,
    paletteOpen,
    setPaletteOpen,
    mobileColumn,
    setMobileColumn,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard(): BoardContextValue {
  const ctx = React.useContext(BoardContext);
  if (!ctx) throw new Error("useBoard must be used inside <BoardProvider>");
  return ctx;
}

/**
 * Filtering is a *view* concern and is applied here, not in the data layer.
 * It hides nothing permanently and reports its own emptiness back to the
 * caller so a filtered-empty column can say something different from a
 * genuinely empty one.
 */
export function filterTasks(tasks: Task[], filters: Filters): Task[] {
  const q = filters.query.trim().toLowerCase();
  return tasks.filter((task) => {
    if (filters.labels.length && !task.labels.some((l) => filters.labels.includes(l))) {
      return false;
    }
    if (filters.people.length && !task.assigneeIds.some((p) => filters.people.includes(p))) {
      return false;
    }
    if (q && !`${task.id} ${task.title}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function tasksInColumn(tasks: Task[], column: ColumnId): Task[] {
  return tasks.filter((t) => t.column === column);
}

const PRIORITY_ORDER: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function byPriority(a: Task, b: Task): number {
  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
}
