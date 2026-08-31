"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Separator } from "@/components/dsgn/separator";
import { NotificationList } from "@/components/design-tasks/notification-list";
import {
  AlcoveMark,
  BoardIcon,
  ChevronDownIcon,
  InboxIcon,
  PeopleIcon,
  SettingsIcon,
  SparkIcon,
} from "@/components/design-tasks/icons";
import { CURRENT_USER, WORKSPACES, personById } from "@/lib/design-tasks/board";
import { useBoard } from "@/lib/design-tasks/store";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "board", label: "Cycle 14", icon: BoardIcon, active: true },
  { id: "mine", label: "My tasks", icon: SparkIcon, active: false },
  { id: "inbox", label: "Inbox", icon: InboxIcon, active: false, count: 4 },
  { id: "people", label: "People", icon: PeopleIcon, active: false },
  { id: "settings", label: "Settings", icon: SettingsIcon, active: false },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { tasks } = useBoard();
  const [workspace, setWorkspace] = React.useState(WORKSPACES[0].id);
  const current = WORKSPACES.find((w) => w.id === workspace) ?? WORKSPACES[0];

  // The rail feed is the same recipe component the task sheet uses, fed the
  // most recent unread entry from each task rather than a per-task list.
  const feed = React.useMemo(
    () =>
      tasks
        .flatMap((task) => task.activity.map((a) => ({ task, a })))
        .filter(({ a }) => a.unread)
        .slice(0, 4)
        .map(({ task, a }) => ({
          id: a.id,
          initials: personById(a.personId)?.initials ?? "??",
          text: `${a.text}`,
          time: `${task.id} · ${a.time}`,
          unread: a.unread,
        })),
    [tasks],
  );

  return (
    <div className="flex h-full flex-col gap-5 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl p-2 text-left transition-colors duration-300 ease-[var(--ease-fluid)] hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/14 text-accent">
            <AlcoveMark className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold tracking-tight">Alcove</span>
            <span className="block truncate text-xs text-ink-faint">{current.name}</span>
          </span>
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-faint" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={workspace} onValueChange={setWorkspace}>
            {WORKSPACES.map((w) => (
              <DropdownMenuRadioItem key={w.id} value={w.id}>
                <span className="flex-1">{w.name}</span>
                <span className="text-xs text-ink-faint">{w.plan}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Workspace settings</DropdownMenuItem>
          <DropdownMenuItem>Invite a teammate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <nav aria-label="Sections">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={onNavigate}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-300 ease-[var(--ease-fluid)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    item.active
                      ? "bg-card font-medium text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                  )}
                >
                  <Icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count && (
                    <span className="tnum rounded-full bg-accent/14 px-1.5 text-[0.6875rem] font-medium text-accent">
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {feed.length > 0 && <NotificationList title="Latest" items={feed} asPanel={false} />}

      <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-card p-2.5 shadow-sm">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-accent/14 text-[0.6875rem] font-semibold text-accent">
            {CURRENT_USER.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{CURRENT_USER.name}</p>
          <p className="truncate text-xs text-ink-faint">{CURRENT_USER.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    // No dividing rule between rail and board: the voice separates regions
    // by what floats on them, not by a line drawn between them.
    <aside className="hidden w-64 shrink-0 bg-background lg:block">
      <SidebarContent />
    </aside>
  );
}
