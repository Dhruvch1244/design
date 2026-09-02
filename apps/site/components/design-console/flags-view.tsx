"use client";

import * as React from "react";
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/dsgn/hover-card";
import { Separator } from "@/components/dsgn/separator";
import { Switch } from "@/components/dsgn/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { toast } from "@/components/dsgn/use-toast";
import { CodeBlock, Panel } from "@/components/design-console/panel";
import { EnvironmentChip } from "@/components/design-console/status-chip";
import { SettingsPanel } from "@/components/design-console/settings-panel";
import { IconInfo, IconUndo, IconWarning } from "@/components/design-console/icons";
import { FEATURE_FLAGS, SNAPSHOT_AT, type Environment, type FeatureFlag } from "@/lib/design-console/console";
import {
  EMPTY_OVERLAY,
  describeChange,
  effectiveValue,
  publish,
  stageToggle,
  undoLast,
  type FlagOverlay,
} from "@/lib/design-console/flag-overlay";
import { relativeTime } from "@/lib/design-console/format";
import { cn } from "@/lib/utils";

export function FlagsView({ environment }: { environment: Environment }) {
  const [flags, setFlags] = React.useState<FeatureFlag[]>(FEATURE_FLAGS);
  const [overlay, setOverlay] = React.useState<FlagOverlay>(EMPTY_OVERLAY);
  const [confirming, setConfirming] = React.useState(false);

  const groups = React.useMemo(() => {
    const byGroup = new Map<string, FeatureFlag[]>();
    for (const flag of flags) {
      const bucket = byGroup.get(flag.group) ?? [];
      bucket.push(flag);
      byGroup.set(flag.group, bucket);
    }
    return [...byGroup.entries()];
  }, [flags]);

  function onToggle(flag: FeatureFlag, next: boolean) {
    setOverlay((current) => stageToggle(flag, environment, next, current));
  }

  function applyOverlay() {
    setFlags((current) => publish(current, overlay));
    toast({
      title: `Published ${overlay.length} change${overlay.length === 1 ? "" : "s"}`,
      description: `Edge nodes pick up the new values within 10 seconds in ${environment}.`,
    });
    setOverlay(EMPTY_OVERLAY);
    setConfirming(false);
  }

  return (
    <div className="space-y-4">
      <Panel
        kicker={`${flags.length} flags · ${environment}`}
        title="Runtime toggles"
        description="Toggles are staged locally and applied only when you publish. Nothing here writes to the edge as you click."
        padded={false}
        actions={
          overlay.length > 0 ? (
            <Badge
              variant="outline"
              className="rounded border-signal-warn/40 bg-signal-warn/10 font-mono text-[10.5px] uppercase tracking-wider text-signal-warn"
            >
              {overlay.length} staged
            </Badge>
          ) : undefined
        }
      >
        <div className="divide-y divide-border/60">
          {groups.map(([group, groupFlags]) => (
            <section key={group}>
              <h3 className="bg-surface-lift/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint sm:px-5">
                {group}
              </h3>
              <div className="divide-y divide-border/50">
                {groupFlags.map((flag) => (
                  <FlagRow
                    key={flag.key}
                    flag={flag}
                    environment={environment}
                    value={effectiveValue(flag, environment, overlay)}
                    dirty={overlay.some(
                      (change) => change.key === flag.key && change.environment === environment,
                    )}
                    onToggle={(next) => onToggle(flag, next)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Panel>

      {/*
        The staged-changes bar. Sticky to the bottom of the viewport rather
        than parked at the end of the list, because the whole point of an
        overlay is that the user can see what is pending while they keep
        working. It only exists when there is something to publish.
      */}
      {overlay.length > 0 && (
        <div
          data-reveal
          className="bezel sticky bottom-4 z-30 flex flex-wrap items-center gap-3 rounded-lg border border-cyan/30 bg-[rgba(10,12,22,0.9)] px-4 py-3 shadow-[0_0_44px_-16px_var(--cyan)] backdrop-blur-xl"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-foreground">
              {overlay.length} unpublished change{overlay.length === 1 ? "" : "s"}
            </p>
            <p className="truncate font-mono text-[11px] text-ink-faint">
              {overlay.map((change) => change.key.split(".").pop()).join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Undo last staged change"
                  onClick={() => setOverlay((current) => undoLast(current))}
                  className="text-ink-faint hover:text-foreground"
                >
                  <IconUndo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo last change</TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm" onClick={() => setOverlay(EMPTY_OVERLAY)}>
              Discard
            </Button>
            <Button variant="glow" size="sm" onClick={() => setConfirming(true)}>
              Publish
            </Button>
          </div>
        </div>
      )}

      <Separator className="bg-border/60" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel
          kicker="how this works"
          title="Non-destructive by default"
          description="This view is the philosophy's overlay model, not a mock of it."
          revealIndex={1}
        >
          <div className="space-y-3 text-[13px] leading-relaxed text-muted-foreground">
            <p>
              The seed flags are never mutated. Every toggle appends{" "}
              <code className="font-mono text-[12px] text-cyan">
                {"{ key, environment, previous, next }"}
              </code>{" "}
              to an ordered overlay, and the rows render{" "}
              <span className="text-foreground">original + overlay</span>.
            </p>
            <p>
              Undo is dropping the last entry — not computing an inverse — so there is no edit that
              can fail to reverse. Discard drops the whole overlay. Publish is the single named
              moment it is applied.
            </p>
            <CodeBlock>
              {overlay.length > 0
                ? overlay.map(describeChange).join("\n")
                : "// no staged changes — toggle a flag above"}
            </CodeBlock>
          </div>
        </Panel>

        {/*
          The `settings-panel` recipe, installed via
          `dsgn add recipe:settings-panel`. Its own copy already says
          "Changes apply on Save, not as you toggle them", which is the same
          rule the flag overlay above implements — so it earns its place here
          rather than being dropped in to pad the component count.
        */}
        <div data-reveal style={{ "--reveal-index": 2 } as React.CSSProperties}>
          <SettingsPanel />
        </div>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent className="bezel">
          <AlertDialogHeader>
            <AlertDialogTitle className="display text-xl">
              Publish to {environment}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-[13px]">
                <p>
                  {environment === "production"
                    ? "These values take effect at the edge within 10 seconds, on live traffic."
                    : "These values take effect in staging within 10 seconds."}
                </p>
                <ul className="space-y-1.5 rounded-md border border-border/70 bg-[var(--void)]/50 p-3">
                  {overlay.map((change) => (
                    <li
                      key={`${change.key}-${change.environment}`}
                      className="flex flex-wrap items-center gap-2 font-mono text-[11.5px]"
                    >
                      <span className="text-ink-soft">{change.key}</span>
                      <span className="text-ink-faint">
                        {change.previous ? "on" : "off"} →{" "}
                        <span className={change.next ? "text-signal-ok" : "text-signal-bad"}>
                          {change.next ? "on" : "off"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep staged</AlertDialogCancel>
            <AlertDialogAction onClick={applyOverlay}>
              Publish {overlay.length} change{overlay.length === 1 ? "" : "s"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FlagRow({
  flag,
  environment,
  value,
  dirty,
  onToggle,
}: {
  flag: FeatureFlag;
  environment: Environment;
  value: boolean;
  dirty: boolean;
  onToggle: (next: boolean) => void;
}) {
  const switchId = `flag-${flag.key.replace(/\W/g, "-")}`;
  const risky = environment === "production" && flag.consumers >= 5;

  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-x-4 gap-y-3 px-4 py-3.5 transition-colors sm:px-5",
        dirty && "bg-signal-warn/[0.05]",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              {/*
                max-w-full + break-all is load-bearing at 390px. A flag key is
                a single unbroken token wide enough to overflow its flex item,
                and without this it printed straight through the environment
                chip sitting to its right. Truncation is not an option here —
                the whole key is the thing you have to be able to read before
                you flip a production toggle.
              */}
              <code className="max-w-full cursor-default break-all font-mono text-[12.5px] text-foreground underline decoration-border decoration-dotted underline-offset-4">
                {flag.key}
              </code>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" align="start">
              <p className="text-[13px] font-medium text-foreground">{flag.name}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{flag.description}</p>
              <CodeBlock className="mt-3 max-h-none">
                {`const on = await voltgate.flags.evaluate(\n  "${flag.key}",\n  { player_id: playerId }\n);`}
              </CodeBlock>
            </HoverCardContent>
          </HoverCard>

          {dirty && (
            <Badge
              variant="outline"
              className="rounded border-signal-warn/40 bg-signal-warn/10 px-1.5 py-0 font-mono text-[10px] uppercase tracking-wider text-signal-warn"
            >
              staged
            </Badge>
          )}
          {value && flag.rollout < 100 && (
            <Badge
              variant="outline"
              className="rounded border-cyan/35 bg-cyan/10 px-1.5 py-0 font-mono text-[10px] text-cyan"
            >
              {flag.rollout}% rollout
            </Badge>
          )}
        </div>

        <p className="mt-1 max-w-prose text-[12.5px] leading-snug text-muted-foreground">
          {flag.description}
        </p>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-ink-faint">
          <span>
            updated {relativeTime(flag.updatedAt, SNAPSHOT_AT)} by {flag.updatedBy}
          </span>
          <span className="inline-flex items-center gap-1">
            {flag.consumers} consumer{flag.consumers === 1 ? "" : "s"}
            {risky && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex text-signal-warn" tabIndex={0}>
                    <IconWarning className="h-3 w-3" />
                    <span className="sr-only">High blast radius</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-56">
                  {flag.consumers} services read this flag in production. Changing it affects all of
                  them at once.
                </TooltipContent>
              </Tooltip>
            )}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* Redundant on a phone — the environment is already in the page
            kicker and the header selector, and dropping it is what buys the
            flag key enough room to sit on one line. */}
        <EnvironmentChip environment={environment} className="hidden sm:inline-flex" />
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-flex text-ink-faint">
              <IconInfo className="h-3.5 w-3.5" />
              <span className="sr-only">Staging behaviour</span>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            Staged locally. Nothing is written until you publish.
          </TooltipContent>
        </Tooltip>
        {/* Visually-hidden <label>, not aria-label: the flag key is already
            on screen and the switch needs to be announced with it. */}
        <label htmlFor={switchId} className="sr-only">
          {flag.name} in {environment}
        </label>
        <Switch id={switchId} checked={value} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}
