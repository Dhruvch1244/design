"use client";

import * as React from "react";
import { Badge } from "@/components/dsgn/badge";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/dsgn/hover-card";
import { Progress } from "@/components/dsgn/progress";
import { Separator } from "@/components/dsgn/separator";
import { ClockIcon } from "@/components/design-tasks/icons";
import {
  dueState,
  labelName,
  personById,
  subtaskTotals,
  type LabelId,
  type Priority,
  type Task,
} from "@/lib/design-tasks/board";
import { cn } from "@/lib/utils";

/**
 * Label hues resolve to CSS variables, not hex literals, so the whole set
 * re-tones with the theme (and would re-tone with a rebrand) from
 * app/globals.css alone. The chip fill is a 12% mix of the same variable
 * rather than a second token: one value per label, not two that can drift.
 */
const LABEL_VAR: Record<LabelId, string> = {
  design: "var(--hue-design)",
  ios: "var(--hue-ios)",
  api: "var(--hue-api)",
  research: "var(--hue-research)",
  a11y: "var(--hue-a11y)",
  infra: "var(--hue-infra)",
  copy: "var(--hue-copy)",
};

export function LabelChip({ id, className }: { id: LabelId; className?: string }) {
  const hue = LABEL_VAR[id];
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent px-2 py-0.5 text-[0.6875rem] font-medium", className)}
      style={{ color: hue, background: `color-mix(in srgb, ${hue} 13%, transparent)` }}
    >
      {labelName(id)}
    </Badge>
  );
}

export function LabelSwatch({ id }: { id: LabelId }) {
  return (
    <span
      aria-hidden="true"
      className="h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ background: LABEL_VAR[id] }}
    />
  );
}

const PRIORITY_COPY: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/**
 * Priority is never signalled by colour alone — the ring count and the word
 * both carry it, so it survives a monochrome screenshot and a person who
 * cannot separate the two warm hues.
 */
export function PriorityChip({ value, className }: { value: Priority; className?: string }) {
  const strong = value === "urgent" || value === "high";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium",
        strong ? "text-destructive" : "text-muted-foreground",
        className,
      )}
      style={
        strong
          ? { background: "color-mix(in srgb, var(--destructive) 12%, transparent)" }
          : { background: "color-mix(in srgb, var(--muted-foreground) 10%, transparent)" }
      }
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          value === "urgent" && "bg-destructive",
          value === "high" && "bg-destructive/55",
          value === "medium" && "bg-muted-foreground/60",
          value === "low" && "bg-muted-foreground/35",
        )}
      />
      {PRIORITY_COPY[value]}
    </span>
  );
}

export function DueChip({ task, className }: { task: Task; className?: string }) {
  const due = dueState(task);
  return (
    <span
      className={cn(
        "tnum inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs",
        due.tone === "overdue" && "font-medium text-destructive",
        due.tone === "soon" && "text-foreground",
        due.tone === "normal" && "text-ink-faint",
        due.tone === "done" && "text-ink-faint",
        className,
      )}
    >
      <ClockIcon className="h-3.5 w-3.5" />
      {due.label}
    </span>
  );
}

function PersonPreview({ personId }: { personId: string }) {
  const person = personById(personId);
  if (!person) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarFallback className="bg-accent/14 text-sm font-semibold text-accent">
            {person.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{person.name}</p>
          <p className="truncate text-xs text-muted-foreground">{person.role}</p>
        </div>
      </div>
      <Separator />
      <dl className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-faint">Based in</dt>
          <dd className="text-right text-muted-foreground">{person.location}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-faint">This cycle</dt>
          <dd className="text-right text-muted-foreground">{person.focus}</dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * A stack of assignee avatars. The HoverCard is supplementary only — the
 * name is already available in the task panel and in the list view, because
 * a hover-only trigger has no keyboard or touch equivalent and must never
 * be the sole route to information (the registry's own note on HoverCard).
 */
export function AssigneeStack({
  ids,
  size = "sm",
}: {
  ids: string[];
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-6 w-6 text-[0.625rem]" : "h-8 w-8 text-xs";
  return (
    <div className="flex items-center -space-x-1.5">
      {ids.map((id) => {
        const person = personById(id);
        if (!person) return null;
        return (
          <HoverCard key={id}>
            <HoverCardTrigger asChild>
              {/* inline-flex, not the default inline: an inline wrapper gives
                  the avatar inside it no box of its own, and a two-person
                  stack collapsed into one lozenge of run-together initials. */}
              <span
                tabIndex={-1}
                className="inline-flex shrink-0 rounded-full ring-2 ring-card transition-transform duration-300 ease-[var(--ease-fluid)] hover:-translate-y-0.5"
              >
                <Avatar className={box}>
                  {/* Stronger than the accent/14 fill used elsewhere: at 24px,
                      overlapped by 6px and separated by a white ring, two
                      near-white discs read as a single blob. */}
                  <AvatarFallback className="bg-accent/20 font-semibold text-accent">
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">{person.name}</span>
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-64" align="start">
              <PersonPreview personId={id} />
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
}

export function SubtaskMeter({ task, className }: { task: Task; className?: string }) {
  const { done, total, percent } = subtaskTotals(task);
  if (total === 0) return null;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress
        value={percent}
        aria-label={`Subtasks complete on ${task.id}`}
        className="h-1.5 w-16 bg-muted"
      />
      <span className="tnum text-[0.6875rem] text-ink-faint">
        {done}/{total}
      </span>
    </div>
  );
}
