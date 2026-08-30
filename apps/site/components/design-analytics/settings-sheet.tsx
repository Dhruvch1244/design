"use client";

import { useState } from "react";
import { Button } from "@/components/dsgn/button";
import { Input } from "@/components/dsgn/input";
import { ScrollArea } from "@/components/dsgn/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dsgn/select";
import { Separator } from "@/components/dsgn/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/dsgn/sheet";
import { Slider } from "@/components/dsgn/slider";
import { Switch } from "@/components/dsgn/switch";
import { toast } from "@/components/dsgn/use-toast";

interface Settings {
  workspaceName: string;
  region: string;
  retentionMonths: number;
  autoSchema: boolean;
  sampleHighVolume: boolean;
  weeklyDigest: boolean;
}

const INITIAL: Settings = {
  workspaceName: "Northbridge Labs",
  region: "eu-west-1",
  retentionMonths: 24,
  autoSchema: true,
  sampleHighVolume: false,
  weeklyDigest: true,
};

export interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{hint}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5 shrink-0" />
    </label>
  );
}

/**
 * The form is a separate component, mounted only while the sheet is open.
 *
 * That is what resets the draft: closing unmounts it, reopening runs the
 * useState initialiser against the current committed values. The obvious
 * alternative — an effect that copies `committed` into `draft` whenever
 * `open` flips — sets state during an effect body (which React 19's lint
 * rule flags) and adds a render pass where the form is briefly showing the
 * previous session's edits.
 */
function SettingsForm({
  committed,
  onCommit,
  onClose,
}: {
  committed: Settings;
  onCommit: (next: Settings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Settings>(committed);
  const dirty = (Object.keys(committed) as (keyof Settings)[]).some(
    (key) => draft[key] !== committed[key],
  );

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-base">Workspace settings</SheetTitle>
        <SheetDescription>
          Applies to every property and every member of this workspace.
        </SheetDescription>
      </SheetHeader>

      {/* min-h-0 is load-bearing: a flex child defaults to min-height:auto,
          so without it this grows to its content height and the whole sheet
          scrolls instead of just the panel. */}
      <ScrollArea className="-mx-6 mt-4 min-h-0 flex-1 px-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="workspace-name" className="text-sm font-medium">
            Workspace name
          </label>
          <Input
            id="workspace-name"
            value={draft.workspaceName}
            onChange={(e) => set("workspaceName", e.target.value)}
          />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <span id="region-label" className="text-sm font-medium">
            Ingest region
          </span>
          <Select value={draft.region} onValueChange={(value) => set("region", value)}>
            <SelectTrigger aria-labelledby="region-label">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eu-west-1">eu-west-1 · Ireland</SelectItem>
              <SelectItem value="us-east-2">us-east-2 · Ohio</SelectItem>
              <SelectItem value="ap-southeast-2">ap-southeast-2 · Sydney</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Changing region starts a new collector; the old one drains for 24 hours.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <span id="retention-label" className="text-sm font-medium">
              Raw event retention
            </span>
            <span className="tnum text-sm text-muted-foreground">
              {draft.retentionMonths} months
            </span>
          </div>
          <Slider
            value={[draft.retentionMonths]}
            onValueChange={([next]) => set("retentionMonths", next)}
            min={3}
            max={36}
            step={3}
            aria-labelledby="retention-label"
          />
          <p className="text-xs text-muted-foreground">
            Aggregates are kept indefinitely. This only bounds the raw event log.
          </p>
        </div>

        <Separator className="my-5" />

        <div className="divide-y divide-border">
          <ToggleRow
            label="Auto-register new events"
            hint="Accept events that aren't in the schema registry yet and add them automatically."
            checked={draft.autoSchema}
            onCheckedChange={(next) => set("autoSchema", next)}
          />
          <ToggleRow
            label="Sample high-volume events"
            hint="Above 10,000 events per minute, keep one in ten and scale the counts."
            checked={draft.sampleHighVolume}
            onCheckedChange={(next) => set("sampleHighVolume", next)}
          />
          <ToggleRow
            label="Weekly digest"
            hint="A Monday summary of traffic, activation, and anything that regressed."
            checked={draft.weeklyDigest}
            onCheckedChange={(next) => set("weeklyDigest", next)}
          />
        </div>
        <div className="h-6" />
      </ScrollArea>

      <SheetFooter className="mt-auto items-center gap-2 border-t border-border pt-4 sm:justify-between">
        <span className="text-xs text-muted-foreground sm:mr-auto">
          {dirty ? "Unsaved changes" : "Everything is saved"}
        </span>
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="accent" size="sm" disabled={!dirty} onClick={() => onCommit(draft)}>
          Save changes
        </Button>
      </SheetFooter>
    </>
  );
}

/**
 * Edits are staged in a draft and only committed on Save — the philosophy's
 * non-destructive pillar applied to a settings panel. Cancelling is then
 * structurally "discard the draft", not an undo stack that has to
 * reconstruct the previous values from inverse operations.
 */
export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [committed, setCommitted] = useState<Settings>(INITIAL);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        {open ? (
          <SettingsForm
            committed={committed}
            onClose={() => onOpenChange(false)}
            onCommit={(next) => {
              setCommitted(next);
              onOpenChange(false);
              toast({
                title: "Settings saved",
                description: `Raw event retention is now ${next.retentionMonths} months.`,
              });
            }}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
