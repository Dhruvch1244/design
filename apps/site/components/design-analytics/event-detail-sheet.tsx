"use client";

import { Button } from "@/components/dsgn/button";
import { ScrollArea } from "@/components/dsgn/scroll-area";
import { Separator } from "@/components/dsgn/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/dsgn/sheet";
import { toast } from "@/components/dsgn/use-toast";
import { HealthPill } from "@/components/design-analytics/health-pill";
import { formatCount, formatPercent, type TrackedEvent } from "@/lib/design-analytics/analytics";

export interface EventDetailSheetProps {
  event: TrackedEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** A sample payload, derived from the event key so it never contradicts the
 *  row the sheet was opened from. */
function samplePayload(event: TrackedEvent): string {
  return JSON.stringify(
    {
      event: event.key,
      version: event.health === "no-data" ? null : "2024-11-01",
      properties: {
        workspace_id: "ws_7Kq2nR",
        surface: event.surface,
        owner_team: event.owner,
        duration_ms: event.p95Ms,
      },
      context: { library: "halyard-js", version: "4.1.2" },
    },
    null,
    2,
  );
}

const FIELD_CLASS = "flex items-baseline justify-between gap-4 py-2 text-sm";

export function EventDetailSheet({ event, open, onOpenChange }: EventDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        {event ? (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-3 pr-6">
                <SheetTitle className="text-base">{event.name}</SheetTitle>
                <HealthPill health={event.health} className="shrink-0" />
              </div>
              <SheetDescription className="font-mono text-xs">{event.key}</SheetDescription>
            </SheetHeader>

            {/* min-h-0 is load-bearing: a flex child defaults to
                min-height:auto, so without it this grows to its content
                height and the sheet scrolls instead of the panel. */}
            <ScrollArea className="-mx-6 mt-4 min-h-0 flex-1 px-6">
              <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>

              <Separator className="my-5" />

              <dl>
                <div className={FIELD_CLASS}>
                  <dt className="text-muted-foreground">Owning team</dt>
                  <dd>{event.owner}</dd>
                </div>
                <div className={FIELD_CLASS}>
                  <dt className="text-muted-foreground">Surface</dt>
                  <dd>{event.surface}</dd>
                </div>
                <div className={FIELD_CLASS}>
                  <dt className="text-muted-foreground">Volume, 30 days</dt>
                  <dd className="tnum">
                    {event.volume === 0 ? "No events" : formatCount(event.volume)}
                  </dd>
                </div>
                <div className={FIELD_CLASS}>
                  <dt className="text-muted-foreground">Conversion</dt>
                  <dd className="tnum">
                    {event.volume === 0 ? "—" : formatPercent(event.conversion)}
                  </dd>
                </div>
                <div className={FIELD_CLASS}>
                  <dt className="text-muted-foreground">Delivery p95</dt>
                  <dd className="tnum">
                    {event.p95Ms === 0 ? "—" : `${formatCount(event.p95Ms)} ms`}
                  </dd>
                </div>
                <div className={FIELD_CLASS}>
                  <dt className="text-muted-foreground">Last seen</dt>
                  <dd>{event.lastSeen}</dd>
                </div>
              </dl>

              <Separator className="my-5" />

              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Most recent payload
              </p>
              <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-muted/60 p-3 font-mono text-[11px] leading-relaxed">
                {samplePayload(event)}
              </pre>
              <div className="h-6" />
            </ScrollArea>

            <SheetFooter className="mt-auto gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  toast({
                    title: "Alert created",
                    description: `You'll be paged if ${event.key} stops arriving for 15 minutes.`,
                  });
                  onOpenChange(false);
                }}
              >
                Alert on this event
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
