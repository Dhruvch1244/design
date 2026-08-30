"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Separator } from "@/components/dsgn/separator";
import {
  HalyardMark,
  IconBell,
  IconFunnel,
  IconOverview,
  IconPulse,
  IconSettings,
  IconUsers,
} from "@/components/design-analytics/icons";
import { PRODUCT_NAME, VIEWS, WORKSPACE_NAME, type ViewId } from "@/lib/design-analytics/views";
import { cn } from "@/lib/utils";

const VIEW_ICONS: Record<ViewId, (props: { className?: string }) => ReactNode> = {
  overview: IconOverview,
  events: IconPulse,
  retention: IconFunnel,
  team: IconUsers,
  alerts: IconBell,
};

/** Per-item trailing count. Kept alongside the nav rather than in the view
 *  registry because it is presentation, not routing — the registry stays
 *  free of anything the palette or breadcrumb would have to ignore. */
const VIEW_BADGES: Partial<Record<ViewId, string>> = {
  events: "8",
  alerts: "0",
};

export interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  onOpenSettings: () => void;
}

export function Sidebar({ activeView, onNavigate, onOpenSettings }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <HalyardMark className="h-7 w-7 shrink-0 text-accent" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight tracking-tight">
            {PRODUCT_NAME}
          </p>
          <p className="truncate text-[11px] leading-tight text-muted-foreground">
            {WORKSPACE_NAME}
          </p>
        </div>
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Analyze
        </p>
        <ul className="flex flex-col gap-0.5">
          {VIEWS.map((view) => {
            const ViewIcon = VIEW_ICONS[view.id];
            const active = view.id === activeView;
            const badge = VIEW_BADGES[view.id];
            return (
              <li key={view.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(view.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 ease-fluid",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  {/* The accent's one job in the sidebar: mark the current
                      view. Everything else stays neutral grayscale. */}
                  <ViewIcon className={cn("h-4 w-4 shrink-0", active && "text-accent")} />
                  <span className="flex-1 text-left">{view.label}</span>
                  {badge ? (
                    <span className="tnum text-[11px] text-ink-faint">{badge}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        <Separator className="my-4" />

        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Ingest
        </p>
        <div className="rounded-md border border-border px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">Collector</span>
            <Badge variant="outline" className="gap-1.5 text-[11px] font-normal">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-accent"
              />
              Live
            </Badge>
          </div>
          <p className="tnum mt-2 text-[11px] leading-relaxed text-muted-foreground">
            1,284 events/min
            <br />
            Region eu-west-1
          </p>
        </div>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 px-2 font-normal text-muted-foreground hover:text-foreground"
          onClick={onOpenSettings}
          leftIcon={<IconSettings className="h-4 w-4" />}
        >
          Workspace settings
        </Button>
      </div>
    </div>
  );
}
