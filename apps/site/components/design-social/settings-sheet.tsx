"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/dsgn/sheet";
import { Button } from "@/components/dsgn/button";
import { Switch } from "@/components/dsgn/switch";
import { Checkbox } from "@/components/dsgn/checkbox";
import { Separator } from "@/components/dsgn/separator";
import { ScrollArea } from "@/components/dsgn/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { toast } from "@/components/dsgn/use-toast";
import { ACCENTS, setAccent, useAccent, type AccentId } from "@/lib/design-social/accent";
import { cn } from "@/lib/utils";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUIET_HOURS = [
  { value: "off", label: "Never" },
  { value: "night", label: "23:00 – 07:00" },
  { value: "work", label: "09:00 – 17:00" },
  { value: "always", label: "Always" },
];

const DIGEST_TOPICS = [
  { id: "builds", label: "Finished builds" },
  { id: "threads", label: "Threads you replied in" },
  { id: "rooms", label: "New rooms matching your interests" },
];

/**
 * Account preferences.
 *
 * Every control here stages its change locally and only commits on Save —
 * closing the sheet abandons the draft rather than silently persisting half
 * of it. The one exception is the accent palette, which is deliberately
 * immediate: it is a preview control, and a palette you can't see until you
 * press Save isn't a palette picker.
 */
export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const accent = useAccent();

  const [sparkAlerts, setSparkAlerts] = React.useState(true);
  const [echoAlerts, setEchoAlerts] = React.useState(true);
  const [newFollowers, setNewFollowers] = React.useState(false);
  const [quiet, setQuiet] = React.useState("night");
  const [topics, setTopics] = React.useState<string[]>(["builds", "threads"]);

  function toggleTopic(id: string) {
    setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5 pr-14">
          <SheetTitle className="font-display text-lg font-extrabold tracking-tight">
            Preferences
          </SheetTitle>
          <SheetDescription>What Thrum is allowed to interrupt you for.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-5">
            <section>
              <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
                Appearance
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAccent(a.id as AccentId)}
                    aria-pressed={accent === a.id}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring",
                      accent === a.id
                        ? "border-accent/70 bg-accent/10"
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <span
                      className="block h-6 w-full rounded-md"
                      style={{
                        backgroundImage: `linear-gradient(100deg, ${a.from}, ${a.to})`,
                      }}
                    />
                    <span className="mt-2 block text-xs font-medium">{a.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
                Push
              </h3>
              <SettingRow
                id="pref-sparks"
                label="Sparks"
                hint="When someone sparks your pulse."
                checked={sparkAlerts}
                onCheckedChange={setSparkAlerts}
              />
              <SettingRow
                id="pref-echoes"
                label="Echoes"
                hint="When someone echoes you to their followers."
                checked={echoAlerts}
                onCheckedChange={setEchoAlerts}
              />
              <SettingRow
                id="pref-follows"
                label="New followers"
                hint="Off by default. It gets loud."
                checked={newFollowers}
                onCheckedChange={setNewFollowers}
              />
            </section>

            <Separator />

            <section>
              <label
                htmlFor="pref-quiet"
                className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint"
              >
                Quiet hours
              </label>
              <Select value={quiet} onValueChange={setQuiet}>
                <SelectTrigger id="pref-quiet" className="mt-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUIET_HOURS.map((q) => (
                    <SelectItem key={q.value} value={q.value}>
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-ink-faint">
                Notifications still arrive; Thrum just stops making noise about them.
              </p>
            </section>

            <Separator />

            <fieldset>
              <legend className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
                Weekly digest
              </legend>
              <div className="mt-3 space-y-3">
                {DIGEST_TOPICS.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`digest-${t.id}`}
                      checked={topics.includes(t.id)}
                      onCheckedChange={() => toggleTopic(t.id)}
                    />
                    <label htmlFor={`digest-${t.id}`} className="cursor-pointer text-sm">
                      {t.label}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        </ScrollArea>

        <SheetFooter className="border-t border-border p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={() => {
              onOpenChange(false);
              toast({
                title: "Preferences saved",
                description: `${topics.length} digest topics, quiet hours ${
                  QUIET_HOURS.find((q) => q.value === quiet)?.label.toLowerCase() ?? "off"
                }.`,
              });
            }}
          >
            Save preferences
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SettingRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </label>
        <p className="mt-0.5 text-xs leading-snug text-ink-faint">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
    </div>
  );
}
