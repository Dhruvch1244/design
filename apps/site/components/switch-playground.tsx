"use client";

import { useState } from "react";
import { Switch } from "@/components/dsgn/switch";
import { CopyButton } from "@/components/copy-button";

export function SwitchPlayground() {
  const [checked, setChecked] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const code = `<Switch${checked ? " defaultChecked" : ""}${disabled ? " disabled" : ""} />`;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-glass p-6 backdrop-blur-xl">
      <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border">
        <Switch
          checked={checked}
          onCheckedChange={setChecked}
          disabled={disabled}
          aria-label="Playground switch"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={checked} onCheckedChange={setChecked} aria-label="Toggle checked state" />
          Checked
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={disabled} onCheckedChange={setDisabled} aria-label="Toggle disabled state" />
          Disabled
        </label>
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
