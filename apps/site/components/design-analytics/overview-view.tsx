"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dsgn/card";
import { Combobox } from "@/components/dsgn/combobox";
import { Progress } from "@/components/dsgn/progress";
import { Separator } from "@/components/dsgn/separator";
import { Skeleton } from "@/components/dsgn/skeleton";
import { Switch } from "@/components/dsgn/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dsgn/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/dsgn/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { toast } from "@/components/dsgn/use-toast";
import { StatCard } from "@/components/design-analytics/stat-card";
import { TrafficChart } from "@/components/design-analytics/traffic-chart";
import { IconDownload, IconInspect } from "@/components/design-analytics/icons";
import {
  PROPERTIES,
  SOURCES,
  buildMetrics,
  buildSeries,
  formatCompact,
  type Interval,
} from "@/lib/design-analytics/analytics";

const INTERVAL_LABEL: Record<Interval, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export function OverviewView() {
  const [interval, setInterval] = useState<Interval>("30d");
  const [property, setProperty] = useState<string>("web-app");
  const [series, setSeries] = useState<"sessions" | "activations">("sessions");
  const [compare, setCompare] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const points = useMemo(() => buildSeries(interval), [interval]);
  const metrics = useMemo(() => buildMetrics(interval), [interval]);

  /*
   * A short pending state on window change, so the Skeleton has a real job
   * rather than being decoration.
   *
   * `refreshing` is raised in the event handler that caused it, not in an
   * effect keyed on [interval, property]. Setting state synchronously in an
   * effect body schedules a second render pass for something the click
   * already knew — React 19's lint rule flags it, and the "user changed the
   * window" fact belongs to the interaction, not to a derived observation of
   * it. The effect below only handles the timer, whose setState runs in a
   * callback rather than during the effect body.
   */
  useEffect(() => {
    if (!refreshing) return;
    const timer = window.setTimeout(() => setRefreshing(false), 320);
    return () => window.clearTimeout(timer);
  }, [refreshing]);

  function changeInterval(next: Interval) {
    setInterval(next);
    setRefreshing(true);
  }

  function changeProperty(next: string) {
    setProperty(next);
    setRefreshing(true);
  }

  const propertyLabel =
    PROPERTIES.find((p) => p.value === property)?.label ?? "All properties";

  return (
    <div className="flex flex-col gap-6">
      {/* Controls. Wraps rather than scrolls: a horizontally scrolling filter
          bar hides its own contents at exactly the width where there are the
          most of them. */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Combobox
            options={PROPERTIES}
            value={property}
            onValueChange={changeProperty}
            placeholder="All properties"
            searchPlaceholder="Filter properties…"
            emptyText="No property matches."
            className="w-full sm:w-[19rem]"
          />
          <ToggleGroup
            type="single"
            size="sm"
            value={interval}
            onValueChange={(value) => value && changeInterval(value as Interval)}
            aria-label="Reporting window"
          >
            {(Object.keys(INTERVAL_LABEL) as Interval[]).map((key) => (
              <ToggleGroupItem key={key} value={key} aria-label={INTERVAL_LABEL[key]}>
                {key}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={compare} onCheckedChange={setCompare} />
            Compare
          </label>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<IconDownload className="h-4 w-4" />}
            onClick={() =>
              toast({
                title: "Export queued",
                description: `${INTERVAL_LABEL[interval]} of ${propertyLabel.split(" — ")[0]} — you'll get an email when the file is ready.`,
              })
            }
          >
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, i) => (
          <StatCard key={metric.id} metric={metric} index={i} loading={refreshing} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* One Tabs root spanning header and content — a second root for the
            panels would break Radix's aria-controls/id pairing between the
            trigger and the panel it actually reveals. */}
        <Tabs
          value={series}
          onValueChange={(value) => setSeries(value as "sessions" | "activations")}
          className="xl:col-span-2"
          asChild
        >
          <Card>
            <CardHeader className="gap-4 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Volume over time</CardTitle>
                  <CardDescription>
                    {propertyLabel} · last {INTERVAL_LABEL[interval]}
                    {compare ? " · dashed line is the prior window" : ""}
                  </CardDescription>
                </div>
                <TabsList>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="activations">Activations</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <TabsContent value="sessions" className="mt-0">
                {refreshing ? (
                  <Skeleton className="h-[272px] w-full" />
                ) : (
                  <TrafficChart points={points} series="sessions" compare={compare} />
                )}
              </TabsContent>
              <TabsContent value="activations" className="mt-0">
                {refreshing ? (
                  <Skeleton className="h-[272px] w-full" />
                ) : (
                  <TrafficChart points={points} series="activations" compare={compare} />
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Where sessions start</CardTitle>
            <CardDescription>Share of tracked sessions by first touch.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 pb-5">
            {SOURCES.map((source) => (
              <div key={source.name} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm">{source.name}</span>
                  <span className="tnum shrink-0 text-sm text-muted-foreground">
                    {formatCompact(source.sessions)}
                    <span className="ml-2 text-foreground">{source.share}%</span>
                  </span>
                </div>
                {/* No `max` prop, even though Radix's Root accepts one and
                    the wrapper's types therefore expose it: the Indicator's
                    transform is hardcoded to a 0–100 scale, so passing max
                    changes the announced value but not the drawn bar. */}
                <Progress
                  value={source.share}
                  aria-label={`${source.name}: ${source.share} percent of sessions`}
                />
              </div>
            ))}

            <Separator className="mt-auto" />

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Unattributed</p>
                <p className="text-xs text-muted-foreground">
                  Sessions with no referrer and no campaign tag.
                </p>
              </div>
              <Badge variant="secondary" className="tnum shrink-0">
                4.1%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <IconInspect className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Two events are missing a schema version</p>
            <p className="text-sm text-muted-foreground">
              Unversioned events skip contract checks, so a payload change ships silently.
            </p>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0 self-start sm:self-auto">
              Review schema
            </Button>
          </TooltipTrigger>
          <TooltipContent>Opens the schema registry for this property</TooltipContent>
        </Tooltip>
      </Card>
    </div>
  );
}
