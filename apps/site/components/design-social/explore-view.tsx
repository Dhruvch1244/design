"use client";

import * as React from "react";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Card } from "@/components/dsgn/card";
import { EmptyState } from "@/components/dsgn/empty-state";
import { Input } from "@/components/dsgn/input";
import { Progress } from "@/components/dsgn/progress";
import { Separator } from "@/components/dsgn/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { toast } from "@/components/dsgn/use-toast";
import { CheckIcon, PlusIcon, SearchIcon } from "@/components/design-social/icons";
import { allRooms, searchRooms } from "@/lib/design-social/feed";
import { compactCount } from "@/lib/design-social/format";
import { cn } from "@/lib/utils";

/**
 * Room discovery.
 *
 * Membership is held here as a Set of slugs layered over the seed data's own
 * `joined` flag rather than as a mutation of it — same additive shape the
 * pulse card uses for sparks, so "leave" is dropping an entry rather than an
 * inverse write that has to reconstruct the original value.
 */
export function ExploreView() {
  const [query, setQuery] = React.useState("");
  const [changed, setChanged] = React.useState<Set<string>>(new Set());

  const results = searchRooms(query);
  // The busiest room defines 100% on every activity meter. Derived from the
  // full set, not from `results` — otherwise filtering the list would silently
  // rescale every bar and make two searches incomparable.
  const peak = Math.max(...allRooms().map((r) => r.velocity), 1);

  function toggleMembership(slug: string, wasJoined: boolean) {
    setChanged((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    const nowJoined = !isJoined(slug, wasJoined);
    toast({
      title: nowJoined ? `Joined ~${slug}` : `Left ~${slug}`,
      description: nowJoined
        ? "Its pulses now show in Your rooms."
        : "You can rejoin any time; nothing is deleted.",
    });
  }

  function isJoined(slug: string, seed: boolean): boolean {
    return changed.has(slug) ? !seed : seed;
  }

  return (
    <div>
      <header className="mb-7">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint">
          {allRooms().length} rooms
        </p>
        <h1 className="mt-2 font-display text-[clamp(2.4rem,7vw,3.75rem)] font-extrabold leading-[0.92] tracking-[-0.045em]">
          <span className="font-light text-foreground/85">Find your</span>{" "}
          <span className="text-gradient">people.</span>
        </h1>
        <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
          Every room is a standing conversation about one specific thing. Join the ones you would
          read at 2am.
        </p>
      </header>

      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-4 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-ink-faint"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Search rooms — try 'film', 'brew', 'synth'"
          aria-label="Search rooms"
          className="h-12 rounded-full border-border/70 bg-card/60 pl-11 pr-4 text-[0.95rem]"
        />
      </div>

      <p aria-live="polite" className="mt-3 px-1 font-mono text-xs text-ink-faint">
        {results.length} {results.length === 1 ? "room" : "rooms"}
        {query.trim() ? ` matching “${query.trim()}”` : ""}
      </p>

      {results.length === 0 ? (
        <EmptyState
          className="mt-4 bg-card/30"
          title="No rooms match that"
          description="Rooms are created by members, not by Thrum. If it doesn't exist yet, it's because nobody has started it."
          action={
            <Button variant="soft" size="sm" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {results.map((room, i) => {
            const joined = isJoined(room.slug, room.joined);
            const share = Math.round((room.velocity / peak) * 100);
            return (
              <li key={room.slug}>
                <Card
                  data-reveal
                  style={{ "--reveal-index": Math.min(i, 6) } as React.CSSProperties}
                  className={cn(
                    "flex h-full flex-col p-5 transition-[transform,border-color] duration-300 ease-[var(--ease-fluid)]",
                    "hover:-translate-y-0.5 hover:border-accent/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-lg font-bold tracking-tight">
                        {room.name}
                      </h2>
                      <p className="truncate font-mono text-xs text-ink-faint">~{room.slug}</p>
                    </div>
                    {joined && (
                      <Badge variant="outline" className="shrink-0 gap-1 border-accent/50 text-accent">
                        <CheckIcon className="h-3 w-3" />
                        Joined
                      </Badge>
                    )}
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {room.blurb}
                  </p>

                  <Separator className="my-4 opacity-60" />

                  <div>
                    <div className="flex items-baseline justify-between gap-3 font-mono text-[0.68rem] text-ink-faint">
                      <span className="tnum">{compactCount(room.members)} members</span>
                      <span className="tnum">{compactCount(room.velocity)} today</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          data-meter
                          className="mt-2 cursor-default"
                          style={{ "--reveal-index": i } as React.CSSProperties}
                        >
                          <Progress
                            value={share}
                            className="h-1"
                            aria-label={`${room.name} activity, ${share}% of the busiest room`}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{share}% of the busiest room today</TooltipContent>
                    </Tooltip>
                  </div>

                  <Button
                    variant={joined ? "outline" : "glow"}
                    size="sm"
                    className="mt-4 w-full"
                    leftIcon={
                      joined ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )
                    }
                    onClick={() => toggleMembership(room.slug, room.joined)}
                  >
                    {joined ? "Joined" : "Join room"}
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
