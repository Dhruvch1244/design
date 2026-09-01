/**
 * Alcove's data layer.
 *
 * Imports nothing from React, Next, or any component — the first pillar of
 * the dsgn philosophy ("physical separation of logic and UI") as a real
 * boundary rather than a naming convention. Everything here is a plain
 * value or a pure function, so the whole board can be reasoned about, and
 * the overlay in `lib/overlay.ts` tested, with no renderer involved.
 *
 * All content is fictional. Alcove, Fernway Studio, the people and the
 * tasks are invented for this demo.
 */

export type ColumnId = "backlog" | "progress" | "review" | "done";

export type Priority = "low" | "medium" | "high" | "urgent";

export type LabelId = "design" | "ios" | "api" | "research" | "a11y" | "infra" | "copy";

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Local time zone label, shown in the hover preview. */
  location: string;
  /** How many tasks this person is currently carrying, per the seed board. */
  focus: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface SubtaskGroup {
  id: string;
  name: string;
  items: Subtask[];
}

export interface ActivityEntry {
  id: string;
  personId: string;
  text: string;
  time: string;
  unread: boolean;
}

export interface Task {
  id: string;
  title: string;
  summary: string;
  column: ColumnId;
  priority: Priority;
  labels: LabelId[];
  assigneeIds: string[];
  /** ISO date (yyyy-mm-dd). Drives both the due chip and the timeline bar. */
  startDate: string;
  dueDate: string;
  comments: number;
  subtaskGroups: SubtaskGroup[];
  activity: ActivityEntry[];
}

export interface Column {
  id: ColumnId;
  name: string;
  /** The one-line rule the team applies when deciding what belongs here. */
  rule: string;
}

/**
 * A fixed "today" instead of `new Date()`. Two reasons, both real: a board
 * rendered on the server and rehydrated on the client must agree on every
 * relative date string, and a screenshot of this showcase should not decay
 * into "overdue by 400 days" a year from now.
 */
export const TODAY = "2026-05-18";

/** The timeline window: three calendar weeks, Mon 11 May - Sun 31 May 2026. */
export const TIMELINE_START = "2026-05-11";
export const TIMELINE_DAYS = 21;

export const COLUMNS: Column[] = [
  { id: "backlog", name: "Backlog", rule: "Agreed it matters, not started" },
  { id: "progress", name: "In progress", rule: "Someone is actively on it" },
  { id: "review", name: "In review", rule: "Waiting on a second pair of eyes" },
  { id: "done", name: "Done", rule: "Shipped in cycle 14" },
];

export const PRIORITIES: { id: Priority; name: string }[] = [
  { id: "urgent", name: "Urgent" },
  { id: "high", name: "High" },
  { id: "medium", name: "Medium" },
  { id: "low", name: "Low" },
];

export const LABELS: { id: LabelId; name: string }[] = [
  { id: "design", name: "Design" },
  { id: "ios", name: "iOS" },
  { id: "api", name: "API" },
  { id: "research", name: "Research" },
  { id: "a11y", name: "Accessibility" },
  { id: "infra", name: "Infra" },
  { id: "copy", name: "Copy" },
];

export const PEOPLE: Person[] = [
  {
    id: "priya",
    name: "Priya Raghunathan",
    initials: "PR",
    role: "Product design",
    location: "Bengaluru",
    focus: "Board interactions",
  },
  {
    id: "tomas",
    name: "Tomas Aldridge",
    initials: "TA",
    role: "iOS engineering",
    location: "Lisbon",
    focus: "Offline editing",
  },
  {
    id: "noor",
    name: "Noor Haddad",
    initials: "NH",
    role: "Backend engineering",
    location: "Amman",
    focus: "Sync and rate limits",
  },
  {
    id: "elias",
    name: "Elias Brenner",
    initials: "EB",
    role: "Design systems",
    location: "Leipzig",
    focus: "Label and colour tokens",
  },
  {
    id: "mira",
    name: "Mira Sandoval",
    initials: "MS",
    role: "User research",
    location: "Montevideo",
    focus: "Weekly planning study",
  },
  {
    id: "kwame",
    name: "Kwame Osei",
    initials: "KO",
    role: "Quality engineering",
    location: "Accra",
    focus: "Release regression pass",
  },
];

export const WORKSPACES = [
  { id: "fernway", name: "Fernway Studio", plan: "Team" },
  { id: "quarry", name: "Quarry Field Kit", plan: "Trial" },
];

export const CURRENT_USER = PEOPLE[0];

const SEED_TASKS: Task[] = [
  {
    id: "ALC-104",
    title: "Drag and drop reordering on the board",
    summary:
      "Cards can be moved between columns from the detail panel, but not by dragging. Needs a pointer implementation that also works with a keyboard: grab, move, drop, and an announcement of where the card landed.",
    column: "progress",
    priority: "urgent",
    labels: ["ios", "design"],
    assigneeIds: ["tomas", "priya"],
    startDate: "2026-05-12",
    dueDate: "2026-05-21",
    comments: 9,
    subtaskGroups: [
      {
        id: "g-104-a",
        name: "Pointer",
        items: [
          { id: "s-104-1", title: "Lift, drag and drop between columns", done: true },
          { id: "s-104-2", title: "Auto-scroll a column while dragging near its edge", done: true },
          { id: "s-104-3", title: "Drop placeholder that matches the card height", done: false },
        ],
      },
      {
        id: "g-104-b",
        name: "Keyboard and screen reader",
        items: [
          { id: "s-104-4", title: "Space to grab, arrows to move, space to drop", done: true },
          { id: "s-104-5", title: "Announce the destination column and position", done: false },
          { id: "s-104-6", title: "Escape cancels and returns the card", done: false },
        ],
      },
    ],
    activity: [
      { id: "a-104-1", personId: "priya", text: "Reworked the drop placeholder so it matches the dragged card's height.", time: "2h ago", unread: true },
      { id: "a-104-2", personId: "tomas", text: "Keyboard grab is in. Announcements are still hardcoded English.", time: "Yesterday", unread: true },
      { id: "a-104-3", personId: "kwame", text: "Filed two edge cases: drag onto an empty column, drag onto itself.", time: "Mon", unread: false },
    ],
  },
  {
    id: "ALC-109",
    title: "Subtask groups in the task detail panel",
    summary:
      "Long checklists are unreadable as one flat list. Group them, collapse the groups that are finished, and show one completion figure for the whole task rather than per group.",
    column: "progress",
    priority: "high",
    labels: ["design"],
    assigneeIds: ["priya"],
    startDate: "2026-05-14",
    dueDate: "2026-05-22",
    comments: 4,
    subtaskGroups: [
      {
        id: "g-109-a",
        name: "Structure",
        items: [
          { id: "s-109-1", title: "Group header with its own completion count", done: true },
          { id: "s-109-2", title: "Collapse a group once every item is checked", done: true },
          { id: "s-109-3", title: "Reorder groups", done: false },
        ],
      },
      {
        id: "g-109-b",
        name: "Rollup",
        items: [
          { id: "s-109-4", title: "One progress figure across all groups", done: true },
          { id: "s-109-5", title: "Show the same figure on the board card", done: false },
        ],
      },
    ],
    activity: [
      { id: "a-109-1", personId: "elias", text: "Group headers should use the same weight as the panel section titles.", time: "5h ago", unread: true },
      { id: "a-109-2", personId: "priya", text: "Rollup figure now counts every group, not just the open ones.", time: "Yesterday", unread: false },
    ],
  },
  {
    id: "ALC-112",
    title: "Rate limit the activity feed endpoint",
    summary:
      "A board with a busy cycle can fan out several hundred activity reads a minute. Add a per-workspace budget, return a retry hint, and make the client back off instead of hammering.",
    column: "progress",
    priority: "medium",
    labels: ["api", "infra"],
    assigneeIds: ["noor"],
    startDate: "2026-05-15",
    dueDate: "2026-05-26",
    comments: 2,
    subtaskGroups: [
      {
        id: "g-112-a",
        name: "Server",
        items: [
          { id: "s-112-1", title: "Per-workspace token bucket", done: true },
          { id: "s-112-2", title: "Return a retry-after hint on refusal", done: false },
        ],
      },
      {
        id: "g-112-b",
        name: "Client",
        items: [
          { id: "s-112-3", title: "Honour the retry hint instead of a fixed backoff", done: false },
          { id: "s-112-4", title: "Surface a quiet 'reconnecting' state, not an error", done: false },
        ],
      },
    ],
    activity: [
      { id: "a-112-1", personId: "noor", text: "Bucket is per workspace, not per user. Draft is up for review.", time: "3h ago", unread: true },
    ],
  },
  {
    id: "ALC-098",
    title: "Colour contrast pass on task labels",
    summary:
      "Label chips were picked for how they look on white and never checked on the darker board panel or in dark mode. Measure every pairing and move the ones that fail, rather than adjusting by eye.",
    column: "review",
    priority: "high",
    labels: ["a11y", "design"],
    assigneeIds: ["elias"],
    startDate: "2026-05-11",
    dueDate: "2026-05-19",
    comments: 6,
    subtaskGroups: [
      {
        id: "g-098-a",
        name: "Audit",
        items: [
          { id: "s-098-1", title: "Measure all seven label hues on card and panel", done: true },
          { id: "s-098-2", title: "Measure the same seven in dark mode", done: true },
          { id: "s-098-3", title: "Record the ratios next to the tokens", done: true },
        ],
      },
      {
        id: "g-098-b",
        name: "Fixes",
        items: [
          { id: "s-098-4", title: "Darken research and copy for the light theme", done: true },
          { id: "s-098-5", title: "Re-check the priority dot against its chip", done: false },
        ],
      },
    ],
    activity: [
      { id: "a-098-1", personId: "elias", text: "Four of seven hues failed on the panel. Ratios are now in the token file.", time: "1h ago", unread: true },
      { id: "a-098-2", personId: "mira", text: "Two study participants called the old research chip unreadable.", time: "Yesterday", unread: false },
    ],
  },
  {
    id: "ALC-101",
    title: "Timeline zoom: week, fortnight, month",
    summary:
      "The timeline is fixed at three weeks. Add zoom levels that keep the same bars and only change the scale, so switching does not reflow a person's mental picture of the cycle.",
    column: "review",
    priority: "medium",
    labels: ["design", "ios"],
    assigneeIds: ["mira", "tomas"],
    startDate: "2026-05-13",
    dueDate: "2026-05-20",
    comments: 3,
    subtaskGroups: [
      {
        id: "g-101-a",
        name: "Scale",
        items: [
          { id: "s-101-1", title: "Day column width per zoom level", done: true },
          { id: "s-101-2", title: "Keep today's marker anchored while zooming", done: true },
          { id: "s-101-3", title: "Month view collapses weekends", done: false },
        ],
      },
    ],
    activity: [
      { id: "a-101-1", personId: "tomas", text: "Anchoring on today rather than the left edge reads much better.", time: "4h ago", unread: false },
    ],
  },
  {
    id: "ALC-118",
    title: "Cut cold start time on the task list",
    summary:
      "First paint on a cold launch is measurably slow on a mid-range device. Profile it against a real device rather than the simulator before changing anything.",
    column: "backlog",
    priority: "high",
    labels: ["infra", "ios"],
    assigneeIds: ["noor"],
    startDate: "2026-05-20",
    dueDate: "2026-05-28",
    comments: 1,
    subtaskGroups: [
      {
        id: "g-118-a",
        name: "Measure first",
        items: [
          { id: "s-118-1", title: "Capture a cold start trace on a mid-range device", done: false },
          { id: "s-118-2", title: "Write down the current number before touching code", done: false },
        ],
      },
    ],
    activity: [
      { id: "a-118-1", personId: "kwame", text: "Attaching traces from three devices so we are not tuning against one.", time: "Yesterday", unread: false },
    ],
  },
  {
    id: "ALC-121",
    title: "Queue edits made without a signal",
    summary:
      "Edits made offline are currently dropped on relaunch. Hold them as a pending overlay, replay them in order once the connection returns, and never silently discard one.",
    column: "backlog",
    priority: "high",
    labels: ["ios", "api"],
    assigneeIds: ["tomas", "noor"],
    startDate: "2026-05-21",
    dueDate: "2026-05-30",
    comments: 5,
    subtaskGroups: [
      {
        id: "g-121-a",
        name: "Queue",
        items: [
          { id: "s-121-1", title: "Persist pending edits across a relaunch", done: false },
          { id: "s-121-2", title: "Replay in the order they were made", done: false },
          { id: "s-121-3", title: "Show what is still pending, per task", done: false },
        ],
      },
      {
        id: "g-121-b",
        name: "Conflicts",
        items: [
          { id: "s-121-4", title: "Decide what happens when the server moved the same card", done: false },
        ],
      },
    ],
    activity: [
      { id: "a-121-1", personId: "noor", text: "The conflict rule needs a decision before any of this is built.", time: "2d ago", unread: false },
    ],
  },
  {
    id: "ALC-124",
    title: "Interview five teams about weekly planning",
    summary:
      "We keep designing the board around how we plan. Talk to five teams who are not us, and write down what they actually do on a Monday morning.",
    column: "backlog",
    priority: "medium",
    labels: ["research"],
    assigneeIds: ["mira"],
    startDate: "2026-05-19",
    dueDate: "2026-05-29",
    comments: 2,
    subtaskGroups: [
      {
        id: "g-124-a",
        name: "Recruit",
        items: [
          { id: "s-124-1", title: "Five teams, none of them design agencies", done: true },
          { id: "s-124-2", title: "Schedule the sessions across two weeks", done: false },
        ],
      },
      {
        id: "g-124-b",
        name: "Synthesis",
        items: [
          { id: "s-124-3", title: "Write the questions before the first session", done: false },
          { id: "s-124-4", title: "One page of findings, no slide deck", done: false },
        ],
      },
    ],
    activity: [
      { id: "a-124-1", personId: "mira", text: "Three teams confirmed. Looking for two outside product work.", time: "3d ago", unread: false },
    ],
  },
  {
    id: "ALC-127",
    title: "Retire the old label picker",
    summary:
      "Two label pickers exist. The old one is reachable from the list view and behaves differently on multi-select. Remove it and route both entry points at the new one.",
    column: "backlog",
    priority: "low",
    labels: ["design", "copy"],
    assigneeIds: ["elias"],
    startDate: "2026-05-25",
    dueDate: "2026-05-31",
    comments: 0,
    subtaskGroups: [
      {
        id: "g-127-a",
        name: "Removal",
        items: [
          { id: "s-127-1", title: "Point the list view at the new picker", done: false },
          { id: "s-127-2", title: "Delete the old component and its styles", done: false },
        ],
      },
    ],
    activity: [],
  },
  {
    id: "ALC-130",
    title: "Keyboard shortcut reference sheet",
    summary:
      "Every shortcut exists and none of them are documented anywhere a person can find. One sheet, opened from the command palette.",
    column: "backlog",
    priority: "low",
    labels: ["copy"],
    assigneeIds: ["priya"],
    startDate: "2026-05-26",
    dueDate: "2026-05-31",
    comments: 1,
    subtaskGroups: [
      {
        id: "g-130-a",
        name: "Content",
        items: [
          { id: "s-130-1", title: "List every shortcut that currently works", done: true },
          { id: "s-130-2", title: "Group by what the person is trying to do", done: false },
        ],
      },
    ],
    activity: [],
  },
  {
    id: "ALC-087",
    title: "Sign in with workspace SSO",
    summary:
      "Teams on the Team plan asked for single sign-on before rollout. Shipped behind a per-workspace setting with a fallback to email.",
    column: "done",
    priority: "high",
    labels: ["api", "infra"],
    assigneeIds: ["noor"],
    startDate: "2026-05-11",
    dueDate: "2026-05-15",
    comments: 12,
    subtaskGroups: [
      {
        id: "g-087-a",
        name: "Rollout",
        items: [
          { id: "s-087-1", title: "Per-workspace toggle", done: true },
          { id: "s-087-2", title: "Fallback to email sign-in", done: true },
          { id: "s-087-3", title: "Session migration for people already signed in", done: true },
        ],
      },
    ],
    activity: [
      { id: "a-087-1", personId: "noor", text: "Rolled out to both workspaces. No failed sessions in the first day.", time: "Fri", unread: false },
    ],
  },
  {
    id: "ALC-090",
    title: "Empty states for a brand new board",
    summary:
      "A new board opened to four empty columns and no explanation. Each column now says what belongs in it and offers the one action that makes sense there.",
    column: "done",
    priority: "medium",
    labels: ["design", "copy"],
    assigneeIds: ["priya", "elias"],
    startDate: "2026-05-11",
    dueDate: "2026-05-14",
    comments: 7,
    subtaskGroups: [
      {
        id: "g-090-a",
        name: "Copy",
        items: [
          { id: "s-090-1", title: "One line per column, no exclamation marks", done: true },
          { id: "s-090-2", title: "Different copy for filtered-empty and truly empty", done: true },
        ],
      },
    ],
    activity: [
      { id: "a-090-1", personId: "priya", text: "Filtered-empty and empty now read differently, which was the whole point.", time: "Thu", unread: false },
    ],
  },
  {
    id: "ALC-093",
    title: "Search that matches on task ID",
    summary:
      "Typing a task ID into search returned nothing, which is the one query people type from memory. IDs are now matched first and shown above title matches.",
    column: "done",
    priority: "low",
    labels: ["ios"],
    assigneeIds: ["tomas"],
    startDate: "2026-05-12",
    dueDate: "2026-05-15",
    comments: 3,
    subtaskGroups: [
      {
        id: "g-093-a",
        name: "Matching",
        items: [
          { id: "s-093-1", title: "Match on the ID with or without the prefix", done: true },
          { id: "s-093-2", title: "Rank ID matches above title matches", done: true },
        ],
      },
    ],
    activity: [
      { id: "a-093-1", personId: "kwame", text: "Verified against the twenty IDs I keep mistyping.", time: "Thu", unread: false },
    ],
  },
];

/** The untouched original. Nothing in the app ever mutates this — see `lib/overlay.ts`. */
export const SEED_BOARD: readonly Task[] = Object.freeze(SEED_TASKS);

export function personById(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

export function labelName(id: LabelId): string {
  return LABELS.find((l) => l.id === id)?.name ?? id;
}

export function columnName(id: ColumnId): string {
  return COLUMNS.find((c) => c.id === id)?.name ?? id;
}

/** Whole days from `from` to `to`, both `yyyy-mm-dd`. Negative means `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** "12 May" — explicit locale and time zone so server and client agree. */
export function formatDay(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function weekdayShort(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "narrow",
    timeZone: "UTC",
  });
}

export function isWeekend(iso: string): boolean {
  const day = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

export interface DueState {
  label: string;
  tone: "overdue" | "soon" | "normal" | "done";
}

/**
 * Relative due wording. Note what this does *not* do: it never hides or
 * reclassifies a task whose date looks implausible. An unusual value is
 * surfaced as information (an overdue tone), never filtered out — the
 * philosophy's "trust the data" line between structure and content.
 */
export function dueState(task: Task): DueState {
  if (task.column === "done") return { label: formatDay(task.dueDate), tone: "done" };
  const delta = daysBetween(TODAY, task.dueDate);
  if (delta < 0) return { label: `${Math.abs(delta)}d overdue`, tone: "overdue" };
  if (delta === 0) return { label: "Due today", tone: "soon" };
  if (delta === 1) return { label: "Due tomorrow", tone: "soon" };
  if (delta <= 3) return { label: `Due in ${delta}d`, tone: "soon" };
  return { label: formatDay(task.dueDate), tone: "normal" };
}

export function subtaskTotals(task: Task): { done: number; total: number; percent: number } {
  const items = task.subtaskGroups.flatMap((g) => g.items);
  const done = items.filter((i) => i.done).length;
  return {
    done,
    total: items.length,
    percent: items.length === 0 ? 0 : Math.round((done / items.length) * 100),
  };
}
