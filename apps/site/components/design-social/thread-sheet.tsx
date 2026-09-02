"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/dsgn/sheet";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Textarea } from "@/components/dsgn/textarea";
import { ScrollArea } from "@/components/dsgn/scroll-area";
import { Separator } from "@/components/dsgn/separator";
import { toast } from "@/components/dsgn/use-toast";
import { SparkIcon, VerifiedIcon } from "@/components/design-social/icons";
import { personByHandle, pulseById, VIEWER } from "@/lib/design-social/feed";
import { compactCount, initials, relativeTime } from "@/lib/design-social/format";

interface ThreadSheetProps {
  /** Id of the pulse to show, or null when closed. Controlled by the shell. */
  pulseId: string | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * The full thread for one pulse, in a right-anchored sheet.
 *
 * A sheet rather than a route: this showcase is a single page, and a thread
 * is supplementary to the feed behind it — dismissing it should return you to
 * the same scroll position, which a route change would not guarantee.
 */
export function ThreadSheet({ pulseId, onOpenChange }: ThreadSheetProps) {
  const pulse = pulseId ? pulseById(pulseId) : undefined;
  const [draft, setDraft] = React.useState("");

  // Clearing the draft when the sheet switches to a *different* pulse, rather
  // than on every close, keeps a half-written reply if the sheet is reopened
  // on the same thread.
  //
  // Adjusted during render against a remembered prop rather than in an effect.
  // React's `react-hooks/set-state-in-effect` rule rejects the effect form for
  // a real reason: an effect runs *after* the browser has already been handed
  // a frame containing the previous thread's draft, so the stale text is
  // visibly painted into the new thread's box for one frame before being
  // cleared. Re-rendering during the same pass never shows that frame.
  const [lastPulseId, setLastPulseId] = React.useState(pulseId);
  if (pulseId !== lastPulseId) {
    setLastPulseId(pulseId);
    setDraft("");
  }

  const author = pulse ? personByHandle(pulse.author) : null;

  return (
    <Sheet open={pulse != null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        aria-describedby={undefined}
      >
        {pulse && author && (
          <>
            <SheetHeader className="border-b border-border p-5 pr-14">
              <SheetTitle className="font-display text-lg font-extrabold tracking-tight">
                Thread
              </SheetTitle>
              <SheetDescription className="font-mono text-xs">
                ~{pulse.room} · {pulse.replies.length}{" "}
                {pulse.replies.length === 1 ? "reply" : "replies"}
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="min-h-0 flex-1">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 ring-1 ring-border">
                    <AvatarFallback className="bg-elevated font-display text-xs font-bold text-foreground">
                      {initials(author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5">
                      <span className="truncate font-display text-base font-bold tracking-tight">
                        {author.name}
                      </span>
                      {author.verified && (
                        <VerifiedIcon className="h-4 w-4 shrink-0 text-accent" aria-label="Verified maker" />
                      )}
                    </p>
                    <p className="font-mono text-xs text-ink-faint">
                      @{author.handle} · {relativeTime(pulse.minutesAgo)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 font-mono text-[0.68rem] text-muted-foreground">
                    ~{pulse.room}
                  </Badge>
                </div>

                <p className="mt-4 text-base leading-relaxed">{pulse.body}</p>

                <div className="mt-4 flex items-center gap-4 font-mono text-xs text-ink-faint">
                  <span className="tnum inline-flex items-center gap-1.5">
                    <SparkIcon className="h-4 w-4" />
                    {compactCount(pulse.sparks)}
                  </span>
                  <span className="tnum">{compactCount(pulse.echoes)} echoes</span>
                </div>

                <Separator className="my-5" />

                {pulse.replies.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink-faint">
                    No replies yet. Yours would be the first.
                  </p>
                ) : (
                  <ul className="space-y-5">
                    {pulse.replies.map((reply) => {
                      const person = personByHandle(reply.author);
                      const isViewer = person.handle === VIEWER.handle;
                      return (
                        <li key={reply.id} className="flex gap-3">
                          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                            <AvatarFallback className="bg-elevated text-[0.65rem] font-bold">
                              {initials(person.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
                              <span className="font-semibold">{person.name}</span>
                              <span className="font-mono text-xs text-ink-faint">
                                @{person.handle}
                              </span>
                              <span className="font-mono text-xs tabular-nums text-ink-faint">
                                {relativeTime(reply.minutesAgo)}
                              </span>
                              {isViewer && (
                                <Badge variant="accent" className="text-[0.6rem]">
                                  You
                                </Badge>
                              )}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {reply.body}
                            </p>
                            <p className="mt-1.5 font-mono text-[0.68rem] tabular-nums text-ink-faint">
                              {compactCount(reply.sparks)} sparks
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border bg-card p-4">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder={`Reply to @${author.handle}`}
                aria-label={`Reply to @${author.handle}`}
                className="resize-none border-border/70 bg-transparent text-sm"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="accent"
                  disabled={draft.trim().length === 0}
                  onClick={() => {
                    setDraft("");
                    toast({ title: "Reply posted", description: `In ~${pulse.room}.` });
                  }}
                >
                  Reply
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
