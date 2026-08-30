"use client";

import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/dsgn/alert-dialog";
import { Button } from "@/components/dsgn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dsgn/card";
import { Checkbox } from "@/components/dsgn/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import { EmptyState } from "@/components/dsgn/empty-state";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/dsgn/hover-card";
import { Input } from "@/components/dsgn/input";
import { Slider } from "@/components/dsgn/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dsgn/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/dsgn/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { toast } from "@/components/dsgn/use-toast";
import { EventDetailSheet } from "@/components/design-analytics/event-detail-sheet";
import { HealthPill } from "@/components/design-analytics/health-pill";
import { IconCopy, IconInspect, IconMore, IconPulse, IconTrash } from "@/components/design-analytics/icons";
import {
  EVENT_OWNERS,
  TRACKED_EVENTS,
  filterEvents,
  formatCount,
  formatPercent,
  type TrackedEvent,
} from "@/lib/design-analytics/analytics";
import { cn } from "@/lib/utils";

export interface EventsViewProps {
  /** Set by the command palette when a specific event is picked. */
  focusedEventId: string | null;
  onFocusHandled: () => void;
}

export function EventsView({ focusedEventId, onFocusHandled }: EventsViewProps) {
  const [query, setQuery] = useState("");
  const [owners, setOwners] = useState<string[]>([]);
  const [minVolume, setMinVolume] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<TrackedEvent | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TrackedEvent | null>(null);

  const rows = useMemo(
    () => filterEvents(TRACKED_EVENTS, { surfaces: owners, minVolume, query }),
    [owners, minVolume, query],
  );

  /* Deriving the open sheet from the incoming id rather than mirroring it in
     an effect: one source of truth, and no frame where the sheet is open
     against a stale event. */
  const focused = focusedEventId
    ? (TRACKED_EVENTS.find((e) => e.id === focusedEventId) ?? null)
    : null;
  const openEvent = detail ?? focused;

  const allVisibleSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const someVisibleSelected = rows.some((r) => selected.includes(r.id));

  function toggleAll(checked: boolean) {
    setSelected(checked ? rows.map((r) => r.id) : []);
  }

  function toggleRow(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  function closeDetail() {
    setDetail(null);
    if (focusedEventId) onFocusHandled();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-4 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-base">Schema registry</CardTitle>
              <CardDescription>
                {rows.length === TRACKED_EVENTS.length
                  ? `${TRACKED_EVENTS.length} events declared for this workspace.`
                  : `${rows.length} of ${TRACKED_EVENTS.length} events match the current filters.`}
              </CardDescription>
            </div>
            {selected.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="tnum text-sm text-muted-foreground">
                  {selected.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: `${selected.length} events paused`,
                      description: "Ingest keeps accepting them; they stop counting toward reports.",
                    });
                    setSelected([]);
                  }}
                >
                  Pause ingest
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name or key…"
              aria-label="Filter events"
              className="lg:max-w-xs"
            />
            <ToggleGroup
              type="multiple"
              size="sm"
              value={owners}
              onValueChange={setOwners}
              aria-label="Owning team"
              className="flex-wrap"
            >
              {EVENT_OWNERS.map((owner) => (
                <ToggleGroupItem key={owner} value={owner}>
                  {owner}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="flex items-center gap-3 lg:ml-auto lg:w-64 lg:shrink-0">
              {/* A span with aria-labelledby, not a <label htmlFor>: the
                  element that carries role="slider" is Radix's thumb, which
                  is a div — a <label> can't point at it. */}
              <span
                id="min-volume-label"
                className="whitespace-nowrap text-sm text-muted-foreground"
              >
                Min volume
              </span>
              <Slider
                value={[minVolume]}
                onValueChange={([next]) => setMinVolume(next)}
                min={0}
                max={5000}
                step={250}
                aria-labelledby="min-volume-label"
                className="flex-1"
              />
              <span className="tnum w-12 shrink-0 text-right text-sm">
                {formatCount(minVolume)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<IconPulse className="h-6 w-6" />}
                title="No events match those filters"
                description="Lower the minimum volume or clear the team filter to see the rest of the registry."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setOwners([]);
                      setMinVolume(0);
                    }}
                  >
                    Reset filters
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Bulk selection is a desktop affordance, like the row
                      menu below. At 390px the checkbox column is 56px that
                      the Status pill needs more, and a phone user selecting
                      eight rows to bulk-pause them is not a real flow. */}
                  <TableHead className="hidden w-10 sm:table-cell sm:pl-6">
                    <Checkbox
                      checked={
                        allVisibleSelected
                          ? true
                          : someVisibleSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={() => toggleAll(!allVisibleSelected)}
                      aria-label={
                        someVisibleSelected ? "Clear selection" : "Select all visible events"
                      }
                    />
                  </TableHead>
                  <TableHead className="sm:min-w-[15rem]">Event</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Conversion</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">p95</TableHead>
                  <TableHead>Status</TableHead>
                  {/* The row menu is desktop-only. Its three items are all
                      reachable from the detail sheet, which the row itself
                      opens — keeping the column at 390px would push Status
                      off the edge and force a sideways scroll to reach the
                      one thing a phone user actually scans for. */}
                  <TableHead className="hidden w-12 pr-4 text-right sm:table-cell sm:pr-6">
                    <span className="sr-only">Row actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((event) => (
                  <TableRow key={event.id} className={cn(event.health === "no-data" && "opacity-70")}>
                    <TableCell className="hidden sm:table-cell sm:pl-6">
                      <Checkbox
                        checked={selected.includes(event.id)}
                        onCheckedChange={(checked) => toggleRow(event.id, checked === true)}
                        aria-label={`Select ${event.name}`}
                      />
                    </TableCell>
                    <TableCell className="pl-4 sm:pl-0">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          {/* A button, not a bare span: HoverCard alone is
                              mouse-only, so the same target has to be
                              focusable and clickable to reach the detail. */}
                          <button
                            type="button"
                            onClick={() => setDetail(event)}
                            /* The explicit mobile width is what keeps the
                               column narrow. `min-w` on the <th> only sets a
                               floor — an auto-layout table still grows the
                               column to its longest cell, which pushed Status
                               past the card edge at 390px. A fixed width on
                               the cell's own content caps it instead. */
                            className="block w-[8.5rem] rounded-sm text-left transition-colors duration-150 ease-fluid hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:w-auto"
                          >
                            <span className="block font-medium break-words">{event.name}</span>
                            {/* break-all, not truncate: a table column sizes to
                                its content, so an unbreakable 30-character key
                                would widen the column past the viewport. */}
                            <span className="block font-mono text-xs break-words text-muted-foreground [overflow-wrap:anywhere]">
                              {event.key}
                            </span>
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent align="start" className="w-80">
                          <p className="font-mono text-xs text-muted-foreground">{event.key}</p>
                          <p className="mt-2 text-sm leading-relaxed">{event.description}</p>
                          <p className="mt-3 text-xs text-muted-foreground">
                            Last seen {event.lastSeen.toLowerCase()} · {event.surface}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{event.owner}</span>
                    </TableCell>
                    <TableCell className="tnum text-right">
                      {event.volume === 0 ? "—" : formatCount(event.volume)}
                    </TableCell>
                    <TableCell className="tnum hidden text-right text-muted-foreground sm:table-cell">
                      {event.volume === 0 ? "—" : formatPercent(event.conversion)}
                    </TableCell>
                    <TableCell className="tnum hidden text-right text-muted-foreground lg:table-cell">
                      {event.p95Ms === 0 ? "—" : `${formatCount(event.p95Ms)} ms`}
                    </TableCell>
                    <TableCell>
                      <HealthPill health={event.health} />
                    </TableCell>
                    <TableCell className="hidden pr-4 text-right sm:table-cell sm:pr-6">
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${event.name}`}
                              >
                                <IconMore className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Row actions</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onSelect={() => setDetail(event)}>
                            <IconInspect className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              toast({
                                title: "Event key copied",
                                description: event.key,
                              })
                            }
                          >
                            <IconCopy className="mr-2 h-4 w-4" />
                            Copy event key
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setPendingDelete(event)}
                          >
                            <IconTrash className="mr-2 h-4 w-4" />
                            Remove from registry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EventDetailSheet
        event={openEvent}
        open={openEvent !== null}
        onOpenChange={(next) => {
          if (!next) closeDetail();
        }}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The event stays in historical reports. New payloads matching{" "}
              <span className="font-mono text-xs">{pendingDelete?.key}</span> will be rejected at
              ingest within about a minute.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast({
                  variant: "destructive",
                  title: "Event removed",
                  description: `${pendingDelete?.key} will stop being accepted at ingest.`,
                });
                setPendingDelete(null);
              }}
            >
              Remove event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
