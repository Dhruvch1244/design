"use client";

import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { ScrollArea } from "@/components/dsgn/scroll-area";
import { Separator } from "@/components/dsgn/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import { toast } from "@/components/dsgn/use-toast";
import { AccentSwitcher } from "@/components/design-social/accent-switcher";
import { ComposeDialog } from "@/components/design-social/compose-dialog";
import { Wordmark } from "@/components/design-social/wordmark";
import { MoreIcon, PenIcon, RoomIcon, SettingsIcon, VIEW_ICONS } from "@/components/design-social/icons";
import { joinedRooms, unreadCount, VIEWER } from "@/lib/design-social/feed";
import { compactCount, initials } from "@/lib/design-social/format";
import { VIEWS, type ViewId } from "@/lib/design-social/views";
import { cn } from "@/lib/utils";

interface LeftNavProps {
  view: ViewId;
  onNavigate: (view: ViewId) => void;
  onOpenSettings: () => void;
  /** Rendered inside the mobile Sheet, which supplies its own chrome. */
  variant?: "rail" | "sheet";
  onAfterNavigate?: () => void;
}

/**
 * The primary navigation, rendered twice from one definition: as the sticky
 * desktop rail and as the body of the mobile Sheet. Both read `VIEWS` from
 * lib/views.ts, so an added view appears in both without a second edit.
 */
export function LeftNav({
  view,
  onNavigate,
  onOpenSettings,
  variant = "rail",
  onAfterNavigate,
}: LeftNavProps) {
  const rooms = joinedRooms();
  const unread = unreadCount();

  function go(next: ViewId) {
    onNavigate(next);
    onAfterNavigate?.();
  }

  return (
    <div className="flex h-full flex-col gap-5">
      {variant === "rail" && (
        // The accent picker sits with the wordmark rather than in a top bar:
        // it is a brand-level control, and the desktop layout has no top bar
        // to put it in. The mobile bar renders its own copy of the same
        // component — one definition, two placements.
        <div className="flex items-center justify-between gap-2 px-3 pt-1">
          <Wordmark />
          <AccentSwitcher />
        </div>
      )}

      <nav aria-label="Primary">
        <ul className="space-y-1">
          {VIEWS.map((v) => {
            const Icon = VIEW_ICONS[v.icon];
            const active = v.id === view;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => go(v.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group/nav flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-left outline-none",
                    "transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-accent/12 text-accent"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-transform duration-300 ease-[var(--ease-spring)]",
                      "group-hover/nav:scale-110",
                    )}
                  />
                  <span className="flex-1 text-[0.95rem] font-medium">{v.label}</span>
                  {v.id === "notifications" && unread > 0 && (
                    <Badge variant="accent" className="tnum h-5 px-2 text-[0.68rem]">
                      {unread}
                    </Badge>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <ComposeDialog>
        <Button variant="glow" size="lg" className="w-full gap-2 font-semibold" leftIcon={<PenIcon className="h-[1.05rem] w-[1.05rem]" />}>
          New pulse
        </Button>
      </ComposeDialog>

      <Separator />

      <div className="min-h-0 flex-1">
        <p className="flex items-center gap-2 px-3 pb-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
          <RoomIcon className="h-3.5 w-3.5" />
          Your rooms
        </p>
        <ScrollArea className={cn(variant === "rail" ? "h-40" : "h-48", "pr-2")}>
          <ul className="space-y-0.5">
            {rooms.map((room) => (
              <li key={room.slug}>
                <button
                  type="button"
                  onClick={() => go("explore")}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-2 rounded-md px-3 py-1.5 text-left outline-none",
                    "transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    ~{room.slug}
                  </span>
                  <span className="tnum shrink-0 font-mono text-[0.65rem] text-ink-faint">
                    {compactCount(room.members)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-full border border-border bg-card/60 p-2 pr-3 text-left",
              "outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <Avatar className="h-9 w-9 ring-1 ring-border">
              <AvatarFallback className="bg-elevated font-display text-xs font-bold text-foreground">
                {initials(VIEWER.name)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{VIEWER.name}</span>
              <span className="block truncate font-mono text-[0.68rem] text-ink-faint">
                @{VIEWER.handle}
              </span>
            </span>
            <MoreIcon className="h-4 w-4 shrink-0 text-ink-faint" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuLabel>@{VIEWER.handle}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => go("profile")}>Your profile</DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenSettings}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() =>
              toast({
                title: "Still signed in",
                description: "This is a demo — there is no session to end.",
              })
            }
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
