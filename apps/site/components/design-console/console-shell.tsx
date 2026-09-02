"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dsgn/tabs";
import { TooltipProvider } from "@/components/dsgn/tooltip";
import { Backdrop } from "@/components/design-console/backdrop";
import { TopBar } from "@/components/design-console/top-bar";
import { OverviewView } from "@/components/design-console/overview-view";
import { KeysView } from "@/components/design-console/keys-view";
import { WebhooksView } from "@/components/design-console/webhooks-view";
import { LogsView } from "@/components/design-console/logs-view";
import { FlagsView } from "@/components/design-console/flags-view";
import {
  IconFlag,
  IconGauge,
  IconKey,
  IconTerminal,
  IconWebhook,
} from "@/components/design-console/icons";
import { PROJECTS, type Environment, type Project } from "@/lib/design-console/console";

const VIEWS = [
  { id: "overview", label: "Overview", icon: IconGauge },
  { id: "keys", label: "Keys", icon: IconKey },
  { id: "webhooks", label: "Webhooks", icon: IconWebhook },
  { id: "logs", label: "Logs", icon: IconTerminal },
  { id: "flags", label: "Flags", icon: IconFlag },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

const VIEW_COPY: Record<ViewId, { title: string; description: string }> = {
  overview: {
    title: "Overview",
    description: "Traffic, latency and quota for this project across every edge region.",
  },
  keys: {
    title: "API keys",
    description: "Issue, rotate and revoke the credentials that sign requests into the gateway.",
  },
  webhooks: {
    title: "Webhooks",
    description: "Outbound event delivery, with the full request and response for every attempt.",
  },
  logs: {
    title: "Request logs",
    description: "Every request through the edge in the last 7 days, filterable and streamable.",
  },
  flags: {
    title: "Feature flags",
    description: "Runtime configuration, staged locally and published as one atomic change.",
  },
};

export function ConsoleShell() {
  const [view, setView] = React.useState<ViewId>("overview");
  const [project, setProject] = React.useState<Project>(PROJECTS[0]);
  const [environment, setEnvironment] = React.useState<Environment>("production");

  return (
    /*
     * One TooltipProvider at the root of the console, not one per tooltip.
     * Radix's provider owns the shared open/close delay state — a provider
     * per trigger means every tooltip restarts the 700ms delay from scratch
     * instead of the skip-delay behaviour a dense UI needs when the pointer
     * moves between adjacent icon buttons.
     */
    <TooltipProvider delayDuration={220} skipDelayDuration={400}>
      <Backdrop />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <TopBar
          project={project}
          onProjectChange={setProject}
          environment={environment}
          onEnvironmentChange={setEnvironment}
        />

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6 sm:py-7">
          <Tabs value={view} onValueChange={(next) => setView(next as ViewId)}>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  {project.name} / {environment}
                </p>
                <h1 className="display mt-1.5 text-[38px] leading-none text-foreground sm:text-[46px]">
                  {VIEW_COPY[view].title}
                </h1>
                <p className="mt-2 max-w-2xl text-[13.5px] leading-snug text-muted-foreground">
                  {VIEW_COPY[view].description}
                </p>
              </div>

              {/*
                The tab strip is a pill row that cannot fit five items at
                390px. It scrolls horizontally inside a negative-margin
                bleed so the first and last pill still line up with the page
                gutter, and the scrollbar itself is hidden. A trailing
                mask-fade (scroll-fade-x, scoped to below `lg` in
                globals.css) replaces the hidden scrollbar as the actual
                affordance — the last pill sitting a few px past the
                viewport edge isn't reliably visible on its own (it measured
                ~10px visible at exactly 390px, a standard test width), so
                it read as a complete row rather than a hint that Flags was
                there to swipe to.
              */}
              <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] scroll-fade-x sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
                <TabsList className="h-auto gap-1 border border-border/70 bg-card/60 p-1 backdrop-blur-md">
                  {VIEWS.map((entry) => (
                    <TabsTrigger
                      key={entry.id}
                      value={entry.id}
                      className="gap-1.5 px-3 py-1.5 text-[12.5px] text-ink-soft data-[state=active]:bg-cyan/12 data-[state=active]:text-cyan data-[state=active]:shadow-[0_0_20px_-8px_var(--cyan)]"
                    >
                      <entry.icon className="h-3.5 w-3.5" />
                      {entry.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <TabsContent value="overview" className="mt-0">
              <OverviewView onJumpToWebhooks={() => setView("webhooks")} />
            </TabsContent>
            <TabsContent value="keys" className="mt-0">
              <KeysView environment={environment} />
            </TabsContent>
            <TabsContent value="webhooks" className="mt-0">
              <WebhooksView environment={environment} />
            </TabsContent>
            <TabsContent value="logs" className="mt-0">
              <LogsView />
            </TabsContent>
            <TabsContent value="flags" className="mt-0">
              <FlagsView environment={environment} />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="mt-6 border-t border-border/70 px-4 py-5 sm:px-6">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 text-[11.5px] text-ink-faint">
            <p>
              VOLTGATE is a fictional product. Every key, endpoint, log line and flag on this page
              is invented for a component-library demo.
            </p>
            <p className="font-mono">
              built with{" "}
              <a
                href="https://design.dhruvchoudhary.com"
                target="_blank"
                rel="noreferrer"
                className="text-cyan underline-offset-4 hover:underline"
              >
                dsgn
              </a>{" "}
              · voice: neon-cyberpunk
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
