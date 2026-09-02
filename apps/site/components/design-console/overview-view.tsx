"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/dsgn/alert";
import { Button } from "@/components/dsgn/button";
import { Card } from "@/components/dsgn/card";
import { Progress } from "@/components/dsgn/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dsgn/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { Panel } from "@/components/design-console/panel";
import { Sparkline, TrafficChart } from "@/components/design-console/traffic-chart";
import { LiveDot } from "@/components/design-console/status-chip";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconInfo,
  IconWarning,
} from "@/components/design-console/icons";
import { METRICS, QUOTA, REGION_ROWS, SNAPSHOT_AT, type Metric } from "@/lib/design-console/console";
import { groupedNumber, relativeTime, signedPercent } from "@/lib/design-console/format";
import { cn } from "@/lib/utils";

export function OverviewView({ onJumpToWebhooks }: { onJumpToWebhooks: () => void }) {
  const quotaPercent = (QUOTA.used / QUOTA.included) * 100;

  return (
    <div className="space-y-4">
      {/*
        A real error state, not a decorative banner. It names the endpoint,
        the code and the count, and its action goes to the exact view that
        can resolve it — an alert a user can't act on is noise they learn to
        scroll past.
      */}
      <Alert
        variant="destructive"
        data-reveal
        className="bezel flex flex-wrap items-start gap-3 border-signal-bad/40 bg-signal-bad/[0.07] text-foreground"
      >
        <IconWarning className="mt-0.5 h-4 w-4 shrink-0 text-signal-bad" />
        {/*
          A min-width basis, not just min-w-0. At 390px the flex row otherwise
          leaves this column narrow enough that the title breaks across two
          lines *while* the action button still sits beside it, which reads as
          broken. Forcing the button onto its own full-width line below is the
          deliberate degradation.
        */}
        <div className="min-w-[15rem] flex-1">
          <AlertTitle className="text-[13px] text-signal-bad">
            Webhook endpoint failing — commerce
          </AlertTitle>
          <AlertDescription className="text-[12.5px] text-muted-foreground">
            {/* overflow-wrap:anywhere, not break-all: break-all splits at the
                first overflowing character regardless of context, which cut
                this URL as "…/voltgat / e/commerce". `anywhere` takes the
                existing break opportunities (the slashes) first. */}
            <span className="font-mono [overflow-wrap:anywhere]">
              hooks.redshift-interactive.dev/voltgate/commerce
            </span>{" "}
            has returned 502 on 3 of the last 5 attempts. 41 events are queued for retry.
          </AlertDescription>
        </div>
        <Button
          variant="soft"
          size="xs"
          onClick={onJumpToWebhooks}
          className="w-full shrink-0 sm:w-auto"
        >
          Inspect deliveries
        </Button>
      </Alert>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} revealIndex={index + 1} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          kicker="last 24 hours"
          title="Edge traffic"
          description="Requests per hour across all regions, with the non-2xx rate overlaid."
          actions={<LiveDot tone="ok" label="streaming" />}
          revealIndex={2}
        >
          <TrafficChart />
        </Panel>

        <Panel
          kicker="billing cycle"
          title="Included volume"
          description={`Cycle ends ${relativeTime(QUOTA.cycleEndsAt, SNAPSHOT_AT).replace(" ago", "")} from now.`}
          revealIndex={3}
        >
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="tnum font-mono text-2xl text-foreground">
                  {groupedNumber(QUOTA.used)}
                </span>
                <span className="tnum font-mono text-[12px] text-ink-faint">
                  / {groupedNumber(QUOTA.included)}
                </span>
              </div>
              <Progress
                value={quotaPercent}
                aria-label={`${quotaPercent.toFixed(0)} percent of included requests used`}
                className="h-1.5 bg-muted"
              />
              <p className="mt-2 text-[12px] text-muted-foreground">
                <span className="tnum font-mono text-cyan">{quotaPercent.toFixed(1)}%</span> of
                included requests used. Overage bills at {QUOTA.overageRate}.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-[12px]">
              <div>
                <dt className="text-ink-faint">Projected</dt>
                <dd className="tnum mt-0.5 font-mono text-foreground">58.9M</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Overage risk</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-signal-warn">
                  <LiveDot tone="warn" animate={false} />
                  low
                </dd>
              </div>
            </dl>
          </div>
        </Panel>
      </div>

      <Panel
        kicker="by region"
        title="Edge distribution"
        description="Share of traffic and tail latency per point of presence."
        padded={false}
        revealIndex={4}
      >
        {/*
          The one place a table degrades by dropping columns rather than
          scrolling: five short rows with two columns that are genuinely
          secondary (p50, share bar). Everything a phone user needs to spot a
          bad region — the name, p99 and the error rate — survives.
        */}
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 sm:pl-5">Region</TableHead>
              <TableHead className="hidden sm:table-cell">Share</TableHead>
              <TableHead className="hidden text-right md:table-cell">p50</TableHead>
              <TableHead className="text-right">p99</TableHead>
              <TableHead className="pr-4 text-right sm:pr-5">Errors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REGION_ROWS.map((row) => {
              const degraded = row.p99 > 250;
              return (
                <TableRow key={row.region} className="border-border/60">
                  <TableCell className="py-2.5 pl-4 font-mono text-[12.5px] sm:pl-5">
                    <span className="inline-flex items-center gap-2">
                      <LiveDot tone={degraded ? "warn" : "ok"} animate={false} />
                      {row.region}
                    </span>
                  </TableCell>
                  <TableCell className="hidden py-2.5 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-cyan/70"
                          style={{ width: `${row.share}%` }}
                        />
                      </div>
                      <span className="tnum font-mono text-[11.5px] text-ink-soft">
                        {row.share.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="tnum hidden py-2.5 text-right font-mono text-[12.5px] text-ink-soft md:table-cell">
                    {row.p50}ms
                  </TableCell>
                  <TableCell
                    className={cn(
                      "tnum py-2.5 text-right font-mono text-[12.5px]",
                      degraded ? "text-signal-warn" : "text-ink-soft",
                    )}
                  >
                    {row.p99}ms
                  </TableCell>
                  <TableCell className="tnum py-2.5 pr-4 text-right font-mono text-[12.5px] text-ink-soft sm:pr-5">
                    {row.errorRate.toFixed(2)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

function MetricCard({ metric, revealIndex }: { metric: Metric; revealIndex: number }) {
  /*
   * "Good" is not "up". A rising p99 and a rising request count are both
   * positive deltas and mean opposite things, so the tone comes from
   * higherIsBetter rather than from the sign — getting this backwards is the
   * single most common bug in a metric tile.
   */
  const improving =
    metric.delta === 0 ? null : metric.delta > 0 === metric.higherIsBetter;
  const tone = improving === null ? "flat" : improving ? "up" : "down";

  return (
    <Card
      data-reveal
      style={{ "--reveal-index": revealIndex } as React.CSSProperties}
      className="bezel relative overflow-hidden border-border/80 bg-card/70 p-4 backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          {metric.label}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`About ${metric.label}`}
              className="rounded text-ink-faint outline-none transition-colors hover:text-cyan focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconInfo className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-56">{metric.note}</TooltipContent>
        </Tooltip>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="display tnum text-[34px] leading-none text-foreground">
          {metric.value}
          {metric.unit && <span className="ml-0.5 text-[18px] text-ink-soft">{metric.unit}</span>}
        </p>
        <span
          className={cn(
            "tnum inline-flex items-center gap-0.5 font-mono text-[11.5px]",
            tone === "up" && "text-signal-ok",
            tone === "down" && "text-signal-bad",
            tone === "flat" && "text-ink-faint",
          )}
        >
          {tone === "flat" ? null : metric.delta > 0 ? (
            <IconArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <IconArrowDownRight className="h-3.5 w-3.5" />
          )}
          {signedPercent(metric.delta)}
        </span>
      </div>

      <div className="mt-3 -mb-1 opacity-80">
        <Sparkline points={metric.spark} tone={tone} />
      </div>
    </Card>
  );
}
