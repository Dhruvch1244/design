"use client";

import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/dsgn/switch";
import { CopyButton } from "@/components/copy-button";
import { useUrlParam } from "@/lib/use-url-param";

export function SwitchPlayground() {
  const [checked, setChecked] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const skipFirstWrite = useRef(true);
  const [urlApplied, setUrlApplied] = useState(false);

  const urlChecked = useUrlParam("switch_checked");
  const urlDisabled = useUrlParam("switch_disabled");

  if (!urlApplied && (urlChecked !== null || urlDisabled !== null)) {
    setUrlApplied(true);
    if (urlChecked === "0" || urlChecked === "1") setChecked(urlChecked === "1");
    if (urlDisabled === "0" || urlDisabled === "1") setDisabled(urlDisabled === "1");
  }

  useEffect(() => {
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("switch_checked", checked ? "1" : "0");
    params.set("switch_disabled", disabled ? "1" : "0");
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }, [checked, disabled]);

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
        <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-20 font-mono text-xs text-accent">
          <code>{code}</code>
        </pre>
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <CopyButton
            text={typeof window !== "undefined" ? window.location.href : ""}
            icon="link"
            label="Copy link to this configuration"
          />
          <CopyButton text={code} label="Copy code" />
        </div>
      </div>
    </div>
  );
}
