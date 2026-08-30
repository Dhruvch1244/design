"use client";

import type * as React from "react";
import { Card } from "@/components/dsgn/card";
import { Skeleton } from "@/components/dsgn/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { IconArrowDown, IconArrowUp } from "@/components/design-analytics/icons";
import { formatDelta, type Metric } from "@/lib/design-analytics/analytics";
import { cn } from "@/lib/utils";

/** Normalised 0..1 samples -> a 1px polyline. No axes, no labels: the number
 *  above it carries the value, this only carries the shape. */
function Sparkline({ values, muted }: { values: number[]; muted: boolean }) {
  const width = 96;
  const height = 28;
  const step = width / Math.max(1, values.length - 1);
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${((1 - v) * height).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke={muted ? "var(--ink-faint)" : "var(--accent)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export interface StatCardProps {
  metric: Metric;
  index: number;
  loading?: boolean;
}

export function StatCard({ metric, index, loading = false }: StatCardProps) {
  const rising = metric.delta > 0;
  /* "Good" is not "up". A falling p95 latency is the improvement, so the
     direction the arrow points and the colour it takes are two decisions,
     not one. */
  const good = rising === metric.positiveIsUp;
  const DeltaIcon = rising ? IconArrowUp : IconArrowDown;

  return (
    <Card
      data-reveal
      style={{ "--reveal-index": index } as React.CSSProperties}
      className="flex flex-col justify-between gap-5 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              className={cn(
                "tnum inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card",
                good
                  ? "bg-accent/10 text-accent"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <DeltaIcon className="h-3 w-3" />
              {formatDelta(metric.delta)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {good ? "Improved" : "Regressed"} against the previous window
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <p className="tnum text-3xl font-semibold leading-none tracking-tight">
              {metric.value}
            </p>
          )}
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {metric.caption}
          </p>
        </div>
        <div className="hidden shrink-0 pb-1 sm:block">
          <Sparkline values={metric.spark} muted={!good} />
        </div>
      </div>
    </Card>
  );
}
