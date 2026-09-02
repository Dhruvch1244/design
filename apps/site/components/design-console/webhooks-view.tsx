"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/dsgn/accordion";
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
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import { EmptyState } from "@/components/dsgn/empty-state";
import { Progress } from "@/components/dsgn/progress";
import { Separator } from "@/components/dsgn/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { Switch } from "@/components/dsgn/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { toast } from "@/components/dsgn/use-toast";
import { CodeBlock, FieldLabel, Panel } from "@/components/design-console/panel";
import { CopyButton } from "@/components/design-console/copy-button";
import { EnvironmentChip, LiveDot, StatusCodeChip } from "@/components/design-console/status-chip";
import { IconInbox, IconMore, IconPlus, IconWebhook } from "@/components/design-console/icons";
import {
  SNAPSHOT_AT,
  WEBHOOK_DELIVERIES,
  WEBHOOK_ENDPOINTS,
  type DeliveryOutcome,
  type Environment,
  type WebhookDelivery,
  type WebhookEndpoint,
} from "@/lib/design-console/console";
import { absoluteTime, duration, groupedNumber, relativeTime } from "@/lib/design-console/format";
import { cn } from "@/lib/utils";

type OutcomeFilter = "all" | DeliveryOutcome;

/** Split a URL into origin and path for two-tone rendering. Falls back to
 *  showing the raw string rather than throwing, since a stored endpoint URL
 *  is user data and an unparseable one still has to render. */
function splitUrl(url: string): { origin: string; path: string } {
  try {
    const parsed = new URL(url);
    return { origin: parsed.origin, path: parsed.pathname + parsed.search };
  } catch {
    return { origin: "", path: url };
  }
}

export function WebhooksView({ environment }: { environment: Environment }) {
  const [endpoints, setEndpoints] = React.useState<WebhookEndpoint[]>(() =>
    WEBHOOK_ENDPOINTS.map((endpoint) => ({ ...endpoint })),
  );
  const [filter, setFilter] = React.useState<OutcomeFilter>("all");
  const [pendingDelete, setPendingDelete] = React.useState<WebhookEndpoint | null>(null);

  const visibleEndpoints = endpoints.filter((endpoint) => endpoint.environment === environment);
  const endpointIds = new Set(visibleEndpoints.map((endpoint) => endpoint.id));
  const deliveries = WEBHOOK_DELIVERIES.filter(
    (delivery) =>
      endpointIds.has(delivery.endpointId) && (filter === "all" || delivery.outcome === filter),
  );

  function setEnabled(endpoint: WebhookEndpoint, enabled: boolean) {
    setEndpoints((current) =>
      current.map((candidate) =>
        candidate.id === endpoint.id ? { ...candidate, enabled } : candidate,
      ),
    );
    toast({
      title: enabled ? "Endpoint enabled" : "Endpoint paused",
      description: enabled
        ? "Queued events begin delivering within a few seconds."
        : "Events keep queueing for 72 hours while this endpoint is paused.",
    });
  }

  return (
    <div className="space-y-4">
      <Panel
        kicker={`${visibleEndpoints.length} endpoint${visibleEndpoints.length === 1 ? "" : "s"} · ${environment}`}
        title="Endpoints"
        description="Each endpoint receives the event types it subscribes to, retried with exponential backoff up to five times."
        actions={
          <Button variant="glow" size="sm" leftIcon={<IconPlus className="h-4 w-4" />}>
            Add endpoint
          </Button>
        }
      >
        {visibleEndpoints.length === 0 ? (
          <EmptyState
            icon={<IconWebhook className="h-7 w-7" />}
            title="No webhooks configured for staging"
            description="Staging events are currently dropped. Add an endpoint to receive them, or switch to production to see the live configuration."
            action={
              <Button variant="soft" size="sm" leftIcon={<IconPlus className="h-4 w-4" />}>
                Add your first endpoint
              </Button>
            }
            className="border-border/70 bg-[var(--void)]/30"
          />
        ) : (
          <div className="space-y-3">
            {visibleEndpoints.map((endpoint) => (
              <EndpointRow
                key={endpoint.id}
                endpoint={endpoint}
                onToggle={(enabled) => setEnabled(endpoint, enabled)}
                onDelete={() => setPendingDelete(endpoint)}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel
        kicker="last 24 hours"
        title="Delivery log"
        description="Expand a delivery for the exact request body and the response we got back."
        padded={false}
        actions={
          <Select value={filter} onValueChange={(value) => setFilter(value as OutcomeFilter)}>
            <SelectTrigger
              aria-label="Filter deliveries by outcome"
              className="h-8 w-[136px] text-[12px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending retry</SelectItem>
            </SelectContent>
          </Select>
        }
        revealIndex={1}
      >
        {deliveries.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              icon={<IconInbox className="h-7 w-7" />}
              title="No deliveries match this filter"
              description={
                visibleEndpoints.length === 0
                  ? "There are no endpoints in this environment, so nothing has been attempted."
                  : "Every delivery in the last 24 hours had a different outcome. Clear the filter to see them."
              }
              action={
                filter !== "all" ? (
                  <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                    Clear filter
                  </Button>
                ) : undefined
              }
              className="border-border/70 bg-[var(--void)]/30"
            />
          </div>
        ) : (
          <Accordion type="single" collapsible className="divide-y divide-border/60">
            {deliveries.map((delivery) => (
              <DeliveryItem
                key={delivery.id}
                delivery={delivery}
                endpoint={endpoints.find((endpoint) => endpoint.id === delivery.endpointId)}
              />
            ))}
          </Accordion>
        )}
      </Panel>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="bezel">
          <AlertDialogHeader>
            <AlertDialogTitle className="display text-xl">Delete this endpoint?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-[13px]">
                <p>
                  Queued events for this endpoint are discarded immediately, including any waiting
                  on a retry. There is no way to replay them afterwards.
                </p>
                {pendingDelete && (
                  <p className="break-all rounded-md border border-border/70 bg-[var(--void)]/50 p-3 font-mono text-[11.5px] text-ink-soft">
                    {pendingDelete.url}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep endpoint</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDelete) return;
                setEndpoints((current) =>
                  current.filter((endpoint) => endpoint.id !== pendingDelete.id),
                );
                toast({
                  variant: "destructive",
                  title: "Endpoint deleted",
                  description: `${pendingDelete.events.length} subscribed event types will no longer be delivered.`,
                });
                setPendingDelete(null);
              }}
            >
              Delete endpoint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EndpointRow({
  endpoint,
  onToggle,
  onDelete,
}: {
  endpoint: WebhookEndpoint;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}) {
  const switchId = `endpoint-${endpoint.id}`;
  const degraded = endpoint.enabled && endpoint.successRate < 99;

  return (
    <div
      className={cn(
        "rounded-md border border-border/70 bg-[var(--void)]/40 p-3.5 transition-colors sm:p-4",
        !endpoint.enabled && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* A min-width basis so the enable/actions cluster wraps onto its own
            row at phone widths instead of squeezing the URL into a
            four-line column. Same reasoning as the overview alert. */}
        <div className="min-w-[15rem] flex-1">
          <div className="flex items-start gap-2">
            {/* Same type metrics as the code element beside it, so the dot
                centres on the URL's *first* line rather than on the middle of
                a two-line wrap. */}
            <span className="shrink-0 text-[12.5px] leading-snug">
              <LiveDot
                tone={!endpoint.enabled ? "warn" : degraded ? "bad" : "ok"}
                animate={endpoint.enabled && degraded}
              />
            </span>
            {/*
              Wrapped, not truncated. `truncate` cut every endpoint down to
              "https://hook…" at 390px, which rendered two different
              endpoints as the same string — the host is shared and the path
              is the only thing that tells them apart. The host is dimmed and
              the path kept at full contrast so the identifying half is what
              the eye lands on.
            */}
            <code className="min-w-0 break-all font-mono text-[12.5px] leading-snug">
              <span className="text-ink-faint">{splitUrl(endpoint.url).origin}</span>
              <span className="text-foreground">{splitUrl(endpoint.url).path}</span>
            </code>
            <CopyButton value={endpoint.url} label="endpoint URL" className="h-6 w-6 shrink-0" />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <EnvironmentChip environment={endpoint.environment} />
            {endpoint.events.map((event) => (
              <Badge
                key={event}
                variant="outline"
                className="rounded px-1.5 py-0 font-mono text-[10.5px] text-ink-soft"
              >
                {event}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/*
            The switch is labelled by a real <label htmlFor>, not by the row
            text. Radix renders a button, so without it the control announces
            as an unnamed toggle — the exact class of thing that is invisible
            in a screenshot review and obvious to a screen-reader user.
          */}
          <label htmlFor={switchId} className="cursor-pointer text-[11.5px] text-ink-faint">
            {endpoint.enabled ? "Enabled" : "Paused"}
          </label>
          <Switch id={switchId} checked={endpoint.enabled} onCheckedChange={onToggle} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${endpoint.url}`}
                className="text-ink-faint hover:text-foreground"
              >
                <IconMore className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem>Send test event</DropdownMenuItem>
              <DropdownMenuItem>Replay failed deliveries</DropdownMenuItem>
              <DropdownMenuItem>Edit subscription</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={onDelete}
                className="text-signal-bad focus:text-signal-bad"
              >
                Delete endpoint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator className="my-3 bg-border/60" />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px]">
        <div className="flex min-w-[160px] flex-1 items-center gap-2.5">
          <span className="text-ink-faint">Success</span>
          <Progress
            value={endpoint.successRate}
            aria-label={`${endpoint.successRate}% of deliveries succeeded`}
            className={cn("h-1 max-w-[140px] bg-muted", degraded && "[&>div]:bg-signal-warn")}
          />
          <span
            className={cn(
              "tnum font-mono",
              endpoint.successRate === 0
                ? "text-ink-faint"
                : degraded
                  ? "text-signal-warn"
                  : "text-signal-ok",
            )}
          >
            {endpoint.successRate.toFixed(1)}%
          </span>
        </div>
        <span className="tnum font-mono text-ink-soft">
          {groupedNumber(endpoint.deliveries24h)}{" "}
          <span className="font-sans text-ink-faint">deliveries / 24h</span>
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default font-mono text-ink-faint">
              added {relativeTime(endpoint.createdAt, SNAPSHOT_AT)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{absoluteTime(endpoint.createdAt)}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function DeliveryItem({
  delivery,
  endpoint,
}: {
  delivery: WebhookDelivery;
  endpoint?: WebhookEndpoint;
}) {
  const exhausted = delivery.outcome === "failed" && delivery.attempt >= delivery.maxAttempts;

  return (
    <AccordionItem value={delivery.id} className="border-b-0">
      <AccordionTrigger className="gap-3 px-4 py-3 hover:no-underline sm:px-5">
        {/*
          Everything in the closed row is either mono or a chip, and it is
          laid out so the two things a user scans for — the status code and
          the event name — are leftmost and never wrap away on a phone. The
          endpoint path and attempt counter are what drop below 640px.
        */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-left">
          <StatusCodeChip code={delivery.statusCode} />
          <span className="font-mono text-[12.5px] text-foreground">{delivery.event}</span>
          <span className="hidden min-w-0 truncate font-mono text-[11.5px] text-ink-faint sm:inline">
            {endpoint ? splitUrl(endpoint.url).path : "—"}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-3 font-mono text-[11.5px] text-ink-faint">
            {delivery.outcome !== "delivered" && (
              <span className={cn(exhausted ? "text-signal-bad" : "text-signal-warn")}>
                attempt {delivery.attempt}/{delivery.maxAttempts}
              </span>
            )}
            <span className="hidden sm:inline">{duration(delivery.durationMs)}</span>
            <span>{relativeTime(delivery.at, SNAPSHOT_AT)}</span>
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 sm:px-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <FieldLabel>Request body</FieldLabel>
              <CopyButton value={delivery.requestBody} label="request body" />
            </div>
            <CodeBlock>{delivery.requestBody}</CodeBlock>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <FieldLabel>Response</FieldLabel>
              <span className="font-mono text-[11px] text-ink-faint">
                {delivery.statusCode === null
                  ? "awaiting retry"
                  : `${delivery.statusCode} · ${duration(delivery.durationMs)}`}
              </span>
            </div>
            {delivery.responseBody ? (
              <CodeBlock
                className={cn(
                  delivery.outcome === "failed" && "border-signal-bad/30 text-ink-soft",
                )}
              >
                {delivery.responseBody}
              </CodeBlock>
            ) : (
              <p className="rounded-md border border-dashed border-border/70 p-3 text-[12px] text-ink-faint">
                No response yet — next attempt in 4 minutes.
              </p>
            )}

            {delivery.responseHeaders.length > 0 && (
              <dl className="mt-3 space-y-1">
                {delivery.responseHeaders.map(([name, value]) => (
                  <div key={name} className="flex gap-3 font-mono text-[11px]">
                    <dt className="w-28 shrink-0 text-ink-faint">{name}</dt>
                    <dd className="min-w-0 break-all text-ink-soft">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          <span className="font-mono text-[11px] text-ink-faint">{delivery.id}</span>
          <span className="font-mono text-[11px] text-ink-faint">
            · {absoluteTime(delivery.at)}
          </span>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="xs">
              Replay delivery
            </Button>
            {exhausted && (
              <Button variant="soft" size="xs">
                Open incident
              </Button>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
