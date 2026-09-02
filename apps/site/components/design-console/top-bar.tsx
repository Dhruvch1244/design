"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Button } from "@/components/dsgn/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/dsgn/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { IconBolt, IconChevronDown, IconCheck, IconExternal } from "@/components/design-console/icons";
import { LiveDot } from "@/components/design-console/status-chip";
import { ORGANIZATION, PROJECTS, type Environment, type Project } from "@/lib/design-console/console";
import { toast } from "@/components/dsgn/use-toast";

interface TopBarProps {
  project: Project;
  onProjectChange: (project: Project) => void;
  environment: Environment;
  onEnvironmentChange: (environment: Environment) => void;
}

export function TopBar({
  project,
  onProjectChange,
  environment,
  onEnvironmentChange,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-[rgba(10,12,22,0.82)] backdrop-blur-xl">
      {/*
        Scanline sweep. Its own absolutely-positioned sibling layer inside the
        header, 1px tall and clipped by overflow-hidden, so it can never
        travel across the text beside it. transform only.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <div
          data-scan
          className="h-px w-1/3 bg-gradient-to-r from-transparent via-cyan to-transparent opacity-70"
        />
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6">
        {/* Wordmark. The one glowing text element in the whole app — the
            voice allows a single glow headline per view, and spending it on
            persistent chrome means no view-level heading ever competes. */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-cyan/12 text-cyan shadow-[0_0_18px_-4px_var(--cyan)]">
            <IconBolt className="h-4 w-4" />
          </span>
          <span className="display wordmark-glow text-[22px] leading-none text-foreground">
            Voltgate
          </span>
        </div>

        <span aria-hidden="true" className="hidden h-5 w-px bg-border sm:block" />

        <Breadcrumb className="hidden min-w-0 md:block">
          <BreadcrumbList className="text-[12px]">
            <BreadcrumbItem>
              <span className="text-ink-faint">{ORGANIZATION}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <ProjectMenu project={project} onProjectChange={onProjectChange} />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[12px]">console</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* On phones the breadcrumb collapses to the project switcher alone —
            the org name is constant across the whole session and is the first
            thing worth dropping. */}
        <div className="md:hidden">
          <ProjectMenu project={project} onProjectChange={onProjectChange} />
        </div>

        {/*
          Below sm the header wraps to two rows. Without w-full this group
          right-aligns on its own row and leaves a dead gap on the left; with
          it, the environment selector and the avatar sit at opposite ends of
          the second row and the wrap reads as a deliberate two-row layout.
        */}
        <div className="flex w-full items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="hidden items-center gap-2 rounded-md border border-border/70 bg-muted/40 px-2.5 py-1.5 lg:inline-flex">
                <LiveDot tone="ok" />
                <span className="font-mono text-[11px] text-ink-soft">edge nominal</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>All 5 edge regions reporting. Last check 12s ago.</TooltipContent>
          </Tooltip>

          <EnvironmentSelect value={environment} onValueChange={onEnvironmentChange} />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open API reference"
                className="hidden text-ink-faint hover:text-cyan sm:inline-flex"
                onClick={() =>
                  toast({
                    title: "Docs are stubbed",
                    description: "This is a showcase build — there is no API reference behind it.",
                  })
                }
              >
                <IconExternal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>API reference</TooltipContent>
          </Tooltip>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function ProjectMenu({
  project,
  onProjectChange,
}: {
  project: Project;
  onProjectChange: (project: Project) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          className="-ml-1 gap-1.5 font-mono text-[12px] text-foreground hover:text-cyan"
        >
          {project.name}
          <IconChevronDown className="h-3.5 w-3.5 text-ink-faint" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Projects
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PROJECTS.map((candidate) => (
          <DropdownMenuItem
            key={candidate.id}
            onSelect={() => onProjectChange(candidate)}
            className="justify-between gap-3"
          >
            <span className="font-mono text-[12px]">{candidate.name}</span>
            <span className="flex items-center gap-2">
              <span className="text-[10px] text-ink-faint">{candidate.region}</span>
              {candidate.id === project.id && <IconCheck className="h-3.5 w-3.5 text-cyan" />}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EnvironmentSelect({
  value,
  onValueChange,
}: {
  value: Environment;
  onValueChange: (value: Environment) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as Environment)}>
      {/*
        Production is tinted magenta, staging is neutral. In a console where
        the same destructive action exists in both, the environment indicator
        is the highest-stakes piece of state on screen — it gets colour that
        nothing else in the chrome competes with.
      */}
      <SelectTrigger
        aria-label="Environment"
        className={
          "h-8 w-[124px] gap-1.5 font-mono text-[11px] uppercase tracking-wider sm:w-[136px] " +
          (value === "production"
            ? "border-magenta/45 bg-magenta/10 text-magenta"
            : "border-border bg-muted/40 text-ink-soft")
        }
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="production" className="font-mono text-[12px]">
          Production
        </SelectItem>
        <SelectItem value="staging" className="font-mono text-[12px]">
          Staging
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu for Marguerite Okonkwo"
          className="rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="h-8 w-8 border border-cyan/30 shadow-[0_0_16px_-6px_var(--cyan)]">
            <AvatarFallback className="bg-surface-lift font-mono text-[11px] text-cyan">
              MO
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="leading-tight">
          <span className="block text-[13px]">Marguerite Okonkwo</span>
          <span className="block font-mono text-[11px] font-normal text-ink-faint">
            m.okonkwo@redshift.dev
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Account settings</DropdownMenuItem>
        <DropdownMenuItem>Audit log</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-signal-bad focus:text-signal-bad">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
