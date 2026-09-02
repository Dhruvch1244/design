"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Card } from "@/components/dsgn/card";
import { EmptyState } from "@/components/dsgn/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dsgn/tabs";
import { toast } from "@/components/dsgn/use-toast";
import { NotificationList } from "@/components/design-social/notification-list";
import { UserHoverCard } from "@/components/design-social/user-hover-card";
import {
  BellIcon,
  EchoIcon,
  InboxIcon,
  ReplyIcon,
  SparkIcon,
  UserIcon,
} from "@/components/design-social/icons";
import {
  allNotifications,
  notificationsOfKind,
  personByHandle,
  weeklyDigest,
  type Notification,
  type NotificationKind,
} from "@/lib/design-social/feed";
import { initials, relativeTime } from "@/lib/design-social/format";
import { cn } from "@/lib/utils";

/** Which glyph stands for each notification kind. */
const KIND_ICON: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  spark: SparkIcon,
  reply: ReplyIcon,
  echo: EchoIcon,
  follow: UserIcon,
  mention: InboxIcon,
};

const FILTERS: { id: string; label: string; kinds?: NotificationKind[]; empty: string }[] = [
  { id: "all", label: "All", empty: "Nothing has happened yet." },
  {
    id: "replies",
    label: "Replies",
    kinds: ["reply", "mention"],
    empty: "No replies or mentions. Post something arguable.",
  },
  { id: "sparks", label: "Sparks", kinds: ["spark", "echo"], empty: "No sparks yet." },
  { id: "follows", label: "Follows", kinds: ["follow"], empty: "No new followers." },
];

interface NotificationsViewProps {
  onOpenProfile: (handle: string) => void;
  onOpenSettings: () => void;
}

/**
 * The activity inbox.
 *
 * Read state is a single local flag rather than a per-item mutation: the seed
 * data is the source of truth for what *happened*, and whether the reader has
 * seen it is view state layered on top. Same boundary the rest of the app
 * keeps — lib/feed.ts describes the world, components describe the session.
 */
export function NotificationsView({ onOpenProfile, onOpenSettings }: NotificationsViewProps) {
  const [readAll, setReadAll] = React.useState(false);
  const all = allNotifications();
  const unread = readAll ? 0 : all.filter((n) => n.unread).length;
  const digest = weeklyDigest();

  return (
    <div>
      <header className="mb-7">
        <p className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint">
          <BellIcon className="h-3.5 w-3.5 text-accent" />
          {unread > 0 ? `${unread} unread` : "All caught up"}
        </p>
        <h1 className="mt-2 font-display text-[clamp(2.4rem,7vw,3.75rem)] font-extrabold leading-[0.92] tracking-[-0.045em]">
          <span className="font-light text-foreground/85">Who</span>{" "}
          <span className="text-gradient">noticed.</span>
        </h1>
        <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
          Sparks, echoes, replies, and follows. Quiet hours and per-kind alerts live in{" "}
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-sm text-accent underline underline-offset-2 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            preferences
          </button>
          .
        </p>
      </header>

      {/*
        The `notification-list` recipe, installed with
        `dsgn add recipe:notification-list` and given an `items` prop (see the
        LOCAL EDIT note in the recipe file). It shows the rolled-up week, not
        the itemised list below it — a second copy of the same rows would be
        chrome, not information.
      */}
      <NotificationList
        title="This week"
        className="mb-6 bg-card/60"
        items={digest.map((d) => ({
          initials: d.tag,
          text: d.text,
          time: d.span,
          unread: d.fresh && !readAll,
        }))}
      />

      <Tabs defaultValue="all">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="max-w-full justify-start overflow-x-auto">
            {FILTERS.map((f) => (
              <TabsTrigger key={f.id} value={f.id}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            disabled={unread === 0}
            onClick={() => {
              setReadAll(true);
              toast({ title: "Marked all as read", description: `${unread} cleared.` });
            }}
          >
            Mark all read
          </Button>
        </div>

        {FILTERS.map((f) => {
          const items = f.kinds ? notificationsOfKind(f.kinds) : all;
          return (
            <TabsContent key={f.id} value={f.id}>
              {items.length === 0 ? (
                <EmptyState
                  className="bg-card/30"
                  icon={<BellIcon className="h-6 w-6" />}
                  title="Nothing here"
                  description={f.empty}
                />
              ) : (
                <Card className="divide-y divide-border overflow-hidden p-0">
                  <ul>
                    {items.map((n, i) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        index={Math.min(i, 6)}
                        read={readAll}
                        onOpenProfile={onOpenProfile}
                      />
                    ))}
                  </ul>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function NotificationRow({
  notification,
  index,
  read,
  onOpenProfile,
}: {
  notification: Notification;
  index: number;
  read: boolean;
  onOpenProfile: (handle: string) => void;
}) {
  const actor = personByHandle(notification.actor);
  const Icon = KIND_ICON[notification.kind];
  const isUnread = notification.unread && !read;

  return (
    <li
      data-reveal
      style={{ "--reveal-index": index } as React.CSSProperties}
      className={cn(
        "flex items-start gap-3 border-b border-border px-4 py-4 transition-colors last:border-b-0",
        "hover:bg-muted/40",
        isUnread && "bg-accent/[0.06]",
      )}
    >
      <span className="relative shrink-0">
        <Avatar className="h-10 w-10 ring-1 ring-border">
          <AvatarFallback className="bg-elevated font-display text-xs font-bold text-foreground">
            {initials(actor.name)}
          </AvatarFallback>
        </Avatar>
        {/* The kind badge overlaps the avatar rather than sitting in its own
            column — it qualifies the actor, so it belongs on them. */}
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border border-border bg-elevated text-accent">
          <Icon className="h-3 w-3" />
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <UserHoverCard
            handle={actor.handle}
            onOpenProfile={onOpenProfile}
            className="font-semibold"
          >
            {actor.name}
          </UserHoverCard>{" "}
          <span className="text-muted-foreground">{notification.text}</span>{" "}
          <time className="font-mono text-xs tabular-nums text-ink-faint">
            {relativeTime(notification.minutesAgo)}
          </time>
        </p>
        {notification.excerpt && (
          <p className="mt-1.5 border-l-2 border-border pl-3 text-sm leading-relaxed text-muted-foreground">
            {notification.excerpt}
          </p>
        )}
      </div>

      {isUnread ? (
        <Badge variant="accent" className="mt-0.5 shrink-0 text-[0.6rem]">
          New
        </Badge>
      ) : null}
    </li>
  );
}
