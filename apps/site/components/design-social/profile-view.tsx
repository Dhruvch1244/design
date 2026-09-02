"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Card } from "@/components/dsgn/card";
import { EmptyState } from "@/components/dsgn/empty-state";
import { Separator } from "@/components/dsgn/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dsgn/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { toast } from "@/components/dsgn/use-toast";
import { PulseCard } from "@/components/design-social/pulse-card";
import { SettingsIcon, SparkIcon, VerifiedIcon } from "@/components/design-social/icons";
import {
  personByHandle,
  pulsesByAuthor,
  repliesByAuthor,
  roomBySlug,
  sparkedPulses,
  VIEWER,
} from "@/lib/design-social/feed";
import { compactCount, initials, relativeTime } from "@/lib/design-social/format";

interface ProfileViewProps {
  handle: string;
  onOpenThread: (pulseId: string) => void;
  onOpenProfile: (handle: string) => void;
  onOpenSettings: () => void;
}

/**
 * One person's page.
 *
 * Renders the signed-in reader and anyone else through the same component —
 * the only branch is which actions and tabs apply, because a "Sparks" tab on
 * someone else's profile would be showing you a list you have no way to
 * verify, and an "Edit profile" button on it would be a lie.
 */
export function ProfileView({
  handle,
  onOpenThread,
  onOpenProfile,
  onOpenSettings,
}: ProfileViewProps) {
  const person = personByHandle(handle);
  const isViewer = person.handle === VIEWER.handle;
  const home = roomBySlug(person.homeRoom);

  const [following, setFollowing] = React.useState(false);

  const pulses = pulsesByAuthor(person.handle);
  const replies = repliesByAuthor(person.handle);
  const sparked = isViewer ? sparkedPulses() : [];

  return (
    <div>
      <Card data-reveal className="grad-ring relative overflow-hidden p-0">
        {/* The banner is the accent gradient itself rather than an image —
            there are no image assets in this showcase, and a gradient band is
            the voice's own material, not a stand-in for something missing. */}
        <div
          aria-hidden="true"
          className="h-24 w-full sm:h-32"
          style={{ backgroundImage: "var(--accent-grad)", opacity: 0.9 }}
        />
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="-mt-9 flex items-end justify-between gap-4 sm:-mt-11">
            <Avatar className="h-[4.5rem] w-[4.5rem] ring-4 ring-card sm:h-24 sm:w-24">
              <AvatarFallback className="bg-elevated font-display text-xl font-extrabold text-foreground">
                {initials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div className="mb-1 flex items-center gap-2">
              {isViewer ? (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<SettingsIcon className="h-4 w-4" />}
                  onClick={onOpenSettings}
                >
                  Edit profile
                </Button>
              ) : (
                <Button
                  variant={following ? "outline" : "glow"}
                  size="sm"
                  onClick={() => {
                    setFollowing((f) => !f);
                    toast({
                      title: following ? `Unfollowed @${person.handle}` : `Following @${person.handle}`,
                      description: following
                        ? "Their pulses leave your Following stream."
                        : "Their pulses now show in your Following stream.",
                    });
                  }}
                >
                  {following ? "Following" : person.followsYou ? "Follow back" : "Follow"}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="flex flex-wrap items-center gap-2 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] font-extrabold leading-tight tracking-[-0.04em]">
              {person.name}
              {person.verified && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default">
                      <VerifiedIcon className="h-5 w-5 text-accent" aria-label="Verified maker" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Thrum confirmed they make what they say they make</TooltipContent>
                </Tooltip>
              )}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-sm text-ink-faint">
              @{person.handle}
              {person.followsYou && (
                <Badge variant="outline" className="text-[0.6rem] text-ink-faint">
                  Follows you
                </Badge>
              )}
            </p>
            {person.bio && (
              <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
                {person.bio}
              </p>
            )}
          </div>

          <Separator className="my-5 opacity-60" />

          <dl className="flex flex-wrap items-baseline gap-x-7 gap-y-3">
            <Stat label="Followers" value={compactCount(person.followers)} />
            <Stat label="Following" value={compactCount(person.following)} />
            <Stat label="Pulses" value={String(pulses.length)} />
            {home && (
              <div>
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
                  Home room
                </dt>
                <dd className="mt-0.5 font-mono text-sm text-accent">~{home.slug}</dd>
              </div>
            )}
          </dl>
        </div>
      </Card>

      <Tabs defaultValue="pulses" className="mt-6">
        <TabsList className="max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="pulses">Pulses</TabsTrigger>
          <TabsTrigger value="replies">Replies</TabsTrigger>
          {isViewer && <TabsTrigger value="sparked">Sparked</TabsTrigger>}
        </TabsList>

        <TabsContent value="pulses" className="space-y-3">
          {pulses.length === 0 ? (
            <EmptyState
              className="bg-card/30"
              title="No pulses yet"
              description={
                isViewer
                  ? "Nothing posted from this account. The composer is one button away."
                  : `${person.name} hasn't posted in any room you can see.`
              }
            />
          ) : (
            pulses.map((pulse, i) => (
              <PulseCard
                key={pulse.id}
                pulse={pulse}
                index={Math.min(i, 6)}
                onOpenThread={onOpenThread}
                onOpenProfile={onOpenProfile}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="replies" className="space-y-3">
          {replies.length === 0 ? (
            <EmptyState
              className="bg-card/30"
              title="No replies yet"
              description="Replies to other people's pulses show up here."
            />
          ) : (
            replies.map(({ reply, parent }, i) => {
              const parentAuthor = personByHandle(parent.author);
              return (
                <Card
                  key={reply.id}
                  data-reveal
                  style={{ "--reveal-index": Math.min(i, 6) } as React.CSSProperties}
                  className="p-4 sm:p-5"
                >
                  <button
                    type="button"
                    onClick={() => onOpenThread(parent.id)}
                    className="w-full rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <p className="font-mono text-xs text-ink-faint">
                      Replying to @{parentAuthor.handle} in ~{parent.room}
                    </p>
                    <p className="mt-2 border-l-2 border-border pl-3 text-sm leading-relaxed text-ink-faint">
                      {parent.body}
                    </p>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/90">
                      {reply.body}
                    </p>
                    <p className="mt-3 flex items-center gap-3 font-mono text-[0.68rem] tabular-nums text-ink-faint">
                      <span className="inline-flex items-center gap-1.5">
                        <SparkIcon className="h-3.5 w-3.5" />
                        {compactCount(reply.sparks)}
                      </span>
                      <span>{relativeTime(reply.minutesAgo)}</span>
                    </p>
                  </button>
                </Card>
              );
            })
          )}
        </TabsContent>

        {isViewer && (
          <TabsContent value="sparked" className="space-y-3">
            {sparked.length === 0 ? (
              <EmptyState
                className="bg-card/30"
                icon={<SparkIcon className="h-6 w-6" />}
                title="Nothing sparked yet"
                description="Sparks are private to you until the author looks at their own numbers."
              />
            ) : (
              sparked.map((pulse, i) => (
                <PulseCard
                  key={pulse.id}
                  pulse={pulse}
                  index={Math.min(i, 6)}
                  onOpenThread={onOpenThread}
                  onOpenProfile={onOpenProfile}
                />
              ))
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </dt>
      <dd className="tnum mt-0.5 font-display text-xl font-bold">{value}</dd>
    </div>
  );
}
