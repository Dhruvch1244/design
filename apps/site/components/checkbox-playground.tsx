"use client";

import { useState } from "react";
import { Checkbox } from "@/components/dsgn/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/dsgn/select";
import { CopyButton } from "@/components/copy-button";

const STATES = ["unchecked", "checked", "indeterminate"] as const;
type State = (typeof STATES)[number];

const CHECKED_PROP: Record<State, boolean | "indeterminate"> = {
  unchecked: false,
  checked: true,
  indeterminate: "indeterminate",
};

export function CheckboxPlayground() {
  const [state, setState] = useState<State>("checked");
  const [disabled, setDisabled] = useState(false);

  const checkedAttr = state === "unchecked" ? "" : state === "checked" ? " defaultChecked" : ' checked="indeterminate"';
  const code = `<Checkbox${checkedAttr}${disabled ? " disabled" : ""} />`;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-glass p-6 backdrop-blur-xl">
      <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border">
        <Checkbox checked={CHECKED_PROP[state]} disabled={disabled} aria-label="Playground checkbox" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            State
          </label>
          <Select value={state} onValueChange={(v) => setState(v as State)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={disabled} onCheckedChange={(v) => setDisabled(v === true)} />
            Disabled
          </label>
        </div>
      </div>

      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
          <code>{code}</code>
        </pre>
        <CopyButton text={code} className="absolute right-3 top-3" />
      </div>
    </div>
  );
}
