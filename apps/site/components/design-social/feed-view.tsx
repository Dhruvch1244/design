"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/dsgn/alert";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Card } from "@/components/dsgn/card";
import { Skeleton } from "@/components/dsgn/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dsgn/tabs";
import { PulseCard } from "@/components/design-social/pulse-card";
import { ComposeDialog } from "@/components/design-social/compose-dialog";
import { PenIcon, SparkIcon } from "@/components/design-social/icons";
import { networkStats, pulsesForStream, type FeedStream } from "@/lib/design-social/feed";
import { compactCount } from "@/lib/design-social/format";

const STREAMS: { id: FeedStream; label: string; empty: string }[] = [
  { id: "for-you", label: "For you", empty: "Nothing yet — join a room and it fills up fast." },
  { id: "following", label: "Following", empty: "The people you follow have been quiet." },
  { id: "rooms", label: "Your rooms", empty: "You haven't joined a room yet." },
];

/** How long the skeleton stands in for a stream that just changed. */
const SWITCH_MS = 280;

interface FeedViewProps {
  onOpenThread: (pulseId: string) => void;
  onOpenProfile: (handle: string) => void;
  onNavigate: (view: "explore") => void;
}

/**
 * The home feed.
 *
 * The stream switch is deliberately given a short skeleton pass rather than
 * swapping content instantly. Not decoration: the seed data is local, so an
 * instant swap would teach a reader of this showcase that a feed change is
 * free, and every real backing API makes it a fetch. The skeleton is the
 * honest shape of that, and it is what `Skeleton` is installed for.
 */
export function FeedView({ onOpenThread, onOpenProfile, onNavigate }: FeedViewProps) {
  const stats = networkStats();
  const [stream, setStream] = React.useState<FeedStream>("for-you");
  const [pending, setPending] = React.useState(false);

  // Entering the pending state is adjusted during render against a remembered
  // value, not fired from an effect. Two reasons, both real: an effect would
  // let one frame of the *old* stream paint under the new tab before the
  // skeleton replaced it, and `react-hooks/set-state-in-effect` correctly
  // rejects the effect form. It also means the first pass — the
  // server-rendered one — starts at `false` and ships real markup rather than
  // placeholders.
  const [lastStream, setLastStream] = React.useState(stream);
  if (stream !== lastStream) {
    setLastStream(stream);
    setPending(true);
  }

  // Leaving it is genuinely time-based, so it stays an effect — and the
  // setState is inside the timer callback, not the effect body.
  React.useEffect(() => {
    if (!pending) return;
    const id = window.setTimeout(() => setPending(false), SWITCH_MS);
    return () => window.clearTimeout(id);
  }, [pending]);

  return (
    <div>
      <header className="mb-7">
        <p className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint">
          <SparkIcon className="h-3.5 w-3.5 text-accent" />
          Live now
        </p>
        {/*
          The voice's mixed-weight headline device: a light word set against an
          extra-bold gradient one, on a face with a real weight axis. clamp()
          rather than responsive text-* steps so the size is continuous — a
          headline this large snapping between two fixed sizes is visible.
        */}
        <h1 className="mt-2 font-display text-[clamp(2.4rem,7vw,3.75rem)] font-extrabold leading-[0.92] tracking-[-0.045em]">
          <span className="font-light text-foreground/85">Everyone&rsquo;s</span>{" "}
          <span className="text-gradient">still up.</span>
        </h1>
        <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
          <strong className="tnum font-semibold text-foreground">
            {compactCount(stats.pulsesToday)}
          </strong>{" "}
          pulses across {stats.roomsLive} rooms in the last day. Post what you made instead of
          sleeping.
        </p>
      </header>

      {/*
        The demo disclosure lives in the right rail on wide screens. That rail
        is hidden below xl, so below xl it has to be said here instead —
        otherwise the phone layout is the one that never discloses that every
        account and number on the page is invented.
      */}
      <Alert className="mb-6 border-border/70 bg-card/60 xl:hidden">
        <AlertTitle className="flex items-center gap-2 text-sm">
          Thrum is a demo
          <Badge variant="outline" className="text-[0.6rem] text-ink-faint">
            fictional
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
          A fictional community app built to show what a fresh project gets from the dsgn registry.
          Every person, room, and count here is invented.
        </AlertDescription>
      </Alert>

      <Tabs value={stream} onValueChange={(v) => setStream(v as FeedStream)}>
        {/*
          The rail is sticky so the stream switch stays reachable deep into a
          long feed. `-mx-1 px-1` gives the focus ring room to draw outside the
          list without being clipped by the sticky backdrop's edge.
        */}
        {/*
          `top-13` (52px), not `top-14` (56px), on purpose: the mobile bar is
          56px plus a 1px border, and pinning the strip to exactly 56 leaves a
          hairline of scrolling content visible between the two translucent
          layers. Four pixels of deliberate overlap — the bar is z-30 and paints
          over it — removes that seam at every device pixel ratio.
        */}
        <div className="sticky top-13 z-20 -mx-1 bg-background/80 px-1 py-2 backdrop-blur-md lg:top-0">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            {STREAMS.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {STREAMS.map((s) => {
          const pulses = pulsesForStream(s.id);
          return (
            <TabsContent key={s.id} value={s.id} className="mt-3 space-y-3">
              {pending ? (
                <PulseSkeletons />
              ) : pulses.length === 0 ? (
                <Card className="p-10 text-center">
                  <p className="text-sm text-muted-foreground">{s.empty}</p>
                  <Button variant="soft" size="sm" className="mt-4" onClick={() => onNavigate("explore")}>
                    Find a room
                  </Button>
                </Card>
              ) : (
                <>
                  {pulses.map((pulse, i) => (
                    <PulseCard
                      key={pulse.id}
                      pulse={pulse}
                      // Capped at 6: past that the stagger stops reading as a
                      // cascade and starts reading as the page being slow.
                      index={Math.min(i, 6)}
                      onOpenThread={onOpenThread}
                      onOpenProfile={onOpenProfile}
                      onOpenRoom={() => onNavigate("explore")}
                    />
                  ))}
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="font-display text-lg font-bold tracking-tight">
                      That&rsquo;s the whole stream.
                    </p>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      You&rsquo;re caught up. The next one is yours.
                    </p>
                    <ComposeDialog>
                      <Button
                        variant="glow"
                        className="mt-1 gap-2"
                        leftIcon={<PenIcon className="h-[1.05rem] w-[1.05rem]" />}
                      >
                        Post a pulse
                      </Button>
                    </ComposeDialog>
                  </div>
                </>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

/** Placeholder cards matching the real card's box, so the switch doesn't jump. */
function PulseSkeletons() {
  return (
    <div aria-hidden="true" className="space-y-3">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-[92%]" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
