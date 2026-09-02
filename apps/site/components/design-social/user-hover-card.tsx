"use client";

import * as React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/dsgn/hover-card";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { personByHandle } from "@/lib/design-social/feed";
import { compactCount, initials } from "@/lib/design-social/format";
import { VerifiedIcon } from "@/components/design-social/icons";
import { cn } from "@/lib/utils";

interface UserHoverCardProps {
  handle: string;
  /** The trigger content — usually a name, sometimes just the `@handle`. */
  children: React.ReactNode;
  className?: string;
  onOpenProfile?: (handle: string) => void;
  onFollow?: (handle: string) => void;
}

/**
 * A handle that previews its owner on hover.
 *
 * The trigger is a real <button> that opens the profile on click, not a bare
 * span: HoverCard has no keyboard equivalent by default, so the preview is
 * strictly supplementary. Everything inside the card (follower counts, the
 * follow action) is reachable another way — that is the condition the dsgn
 * registry puts on using HoverCard at all.
 */
export function UserHoverCard({
  handle,
  children,
  className,
  onOpenProfile,
  onFollow,
}: UserHoverCardProps) {
  const person = personByHandle(handle);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onOpenProfile?.(handle)}
          className={cn(
            "rounded-sm text-left outline-none transition-colors hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          {children}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 shadow-[var(--elev-lg)]" align="start">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 ring-1 ring-border">
            <AvatarFallback className="bg-elevated font-display text-sm font-bold text-foreground">
              {initials(person.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 font-display text-[0.95rem] font-bold leading-tight">
              <span className="truncate">{person.name}</span>
              {person.verified && (
                <VerifiedIcon className="h-4 w-4 shrink-0 text-accent" aria-label="Verified maker" />
              )}
            </p>
            <p className="truncate font-mono text-xs text-ink-faint">@{person.handle}</p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{person.bio}</p>

        <div className="mt-3 flex items-center gap-4 text-xs">
          <span className="tnum">
            <strong className="font-semibold text-foreground">
              {compactCount(person.followers)}
            </strong>{" "}
            <span className="text-ink-faint">followers</span>
          </span>
          <span className="tnum">
            <strong className="font-semibold text-foreground">
              {compactCount(person.following)}
            </strong>{" "}
            <span className="text-ink-faint">following</span>
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button size="xs" variant="soft" onClick={() => onFollow?.(handle)}>
            {person.followsYou ? "Follow back" : "Follow"}
          </Button>
          {person.followsYou && (
            <Badge variant="outline" className="text-ink-faint">
              Follows you
            </Badge>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
