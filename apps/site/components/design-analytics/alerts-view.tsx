"use client";

import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dsgn/card";
import { EmptyState } from "@/components/dsgn/empty-state";
import { Separator } from "@/components/dsgn/separator";
import { Switch } from "@/components/dsgn/switch";
import { toast } from "@/components/dsgn/use-toast";
import { IconBell, IconSpark } from "@/components/design-analytics/icons";

const MONITORS = [
  {
    name: "Ingest volume drop",
    rule: "Sessions fall more than 30% below the 7-day median for 15 minutes",
    channel: "PagerDuty · platform-oncall",
    enabled: true,
  },
  {
    name: "Rejected events spike",
    rule: "Rejection rate above 2% of ingested events for 10 minutes",
    channel: "Slack · #halyard-ingest",
    enabled: true,
  },
  {
    name: "Export queue backlog",
    rule: "Any export pending longer than 20 minutes",
    channel: "Email · reporting@northbridge.dev",
    enabled: false,
  },
];

export function AlertsView() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Firing now</CardTitle>
          <CardDescription>Monitors currently above their threshold.</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <EmptyState
            icon={<IconBell className="h-6 w-6" />}
            title="Nothing is firing"
            description="Every monitor has been below its threshold for the last 6 hours. The last page was on Aug 19, for ingest volume."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({
                    title: "Test page sent",
                    description: "platform-oncall will get a synthetic alert within a minute.",
                  })
                }
              >
                Send a test page
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monitors</CardTitle>
          <CardDescription>Three configured for this workspace.</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          {MONITORS.map((monitor, i) => (
            <div key={monitor.name}>
              {i > 0 ? <Separator className="my-1" /> : null}
              <div className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{monitor.name}</p>
                    {monitor.enabled ? null : (
                      <Badge variant="outline" className="text-[11px] font-normal">
                        Paused
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {monitor.rule}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconSpark className="h-3.5 w-3.5" />
                    {monitor.channel}
                  </p>
                </div>
                <Switch
                  defaultChecked={monitor.enabled}
                  aria-label={`${monitor.enabled ? "Pause" : "Resume"} ${monitor.name}`}
                  className="mt-0.5 shrink-0"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
