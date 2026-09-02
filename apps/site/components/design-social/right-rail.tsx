"use client";

import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Card } from "@/components/dsgn/card";
import { Separator } from "@/components/dsgn/separator";
import { toast } from "@/components/dsgn/use-toast";
import { UserHoverCard } from "@/components/design-social/user-hover-card";
import { VerifiedIcon } from "@/components/design-social/icons";
import { allRooms, networkStats, personByHandle, suggestedPeople } from "@/lib/design-social/feed";
import { compactCount, initials } from "@/lib/design-social/format";
import type { ViewId } from "@/lib/design-social/views";
import { cn } from "@/lib/utils";

interface RightRailProps {
  onNavigate: (view: ViewId) => void;
  onOpenProfile: (handle: string) => void;
}

/** The desktop-only context column: live numbers, hot rooms, people to follow. */
export function RightRail({ onNavigate, onOpenProfile }: RightRailProps) {
  const stats = networkStats();
  const hot = allRooms().slice(0, 4);
  const suggestions = suggestedPeople(3);

  return (
    <div className="space-y-4">
      <Card
        data-reveal
        className="grad-ring relative overflow-hidden bg-card/70 p-5"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ backgroundImage: "var(--accent-grad-soft)" }}
        />
        <div className="relative">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
            Live on Thrum
          </p>
          <p className="text-gradient mt-2 font-display text-[2.75rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
            {compactCount(stats.pulsesToday)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">pulses in the last 24 hours</p>
          <Separator className="my-4 opacity-60" />
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
                Rooms
              </dt>
              <dd className="tnum mt-0.5 font-display text-xl font-bold">{stats.roomsLive}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
                Makers
              </dt>
              <dd className="tnum mt-0.5 font-display text-xl font-bold">
                {compactCount(stats.makers)}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card data-reveal style={{ "--reveal-index": 1 } as React.CSSProperties} className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold tracking-tight">Rooms heating up</h2>
          <Button variant="link" size="sm" onClick={() => onNavigate("explore")}>
            All rooms
          </Button>
        </div>
        <ul className="mt-3 space-y-3">
          {hot.map((room, i) => (
            <li key={room.slug}>
              <button
                type="button"
                onClick={() => onNavigate("explore")}
                className={cn(
                  "-mx-2 flex w-[calc(100%+1rem)] items-baseline gap-3 rounded-md px-2 py-1 text-left",
                  "outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <span className="tnum w-4 shrink-0 font-mono text-xs text-ink-faint">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{room.name}</span>
                  <span className="tnum block font-mono text-[0.68rem] text-ink-faint">
                    {compactCount(room.velocity)} pulses today
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card data-reveal style={{ "--reveal-index": 2 } as React.CSSProperties} className="p-5">
        <h2 className="font-display text-base font-bold tracking-tight">Makers to follow</h2>
        <ul className="mt-3 space-y-3.5">
          {suggestions.map((p) => {
            const person = personByHandle(p.handle);
            return (
              <li key={p.handle} className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                  <AvatarFallback className="bg-elevated text-[0.65rem] font-bold">
                    {initials(person.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1">
                    <UserHoverCard
                      handle={p.handle}
                      onOpenProfile={onOpenProfile}
                      className="truncate text-sm font-semibold"
                    >
                      {person.name}
                    </UserHoverCard>
                    {person.verified && (
                      <VerifiedIcon
                        className="h-3.5 w-3.5 shrink-0 text-accent"
                        aria-label="Verified maker"
                      />
                    )}
                  </p>
                  <p className="tnum truncate font-mono text-[0.68rem] text-ink-faint">
                    {compactCount(person.followers)} followers
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="soft"
                  className="shrink-0"
                  onClick={() =>
                    toast({
                      title: `Following @${p.handle}`,
                      description: `Their pulses now show in your Following stream.`,
                    })
                  }
                >
                  Follow
                </Button>
              </li>
            );
          })}
        </ul>
      </Card>

      <p className="px-2 text-xs leading-relaxed text-ink-faint">
        Thrum is a fictional product built to demo{" "}
        <a
          href="https://design.dhruvchoudhary.com"
          className="rounded-sm text-muted-foreground underline underline-offset-2 outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          dsgn
        </a>
        . Every account, room and number here is invented.{" "}
        <Badge variant="outline" className="ml-0.5 align-middle text-[0.6rem] text-ink-faint">
          demo
        </Badge>
      </p>
    </div>
  );
}
