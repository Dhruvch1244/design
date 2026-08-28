"use client";

import { useEffect, useRef, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/dsgn/select";
import { CopyButton } from "@/components/copy-button";
import { useUrlParam } from "@/lib/use-url-param";

const OPTIONS = [
  { value: "lyric-viewer", label: "lyric-viewer" },
  { value: "file-viewer", label: "file-viewer" },
  { value: "review-grader", label: "review-grader" },
] as const;

export function SelectPlayground() {
  const [value, setValue] = useState<string>("lyric-viewer");
  const skipFirstWrite = useRef(true);
  const [urlApplied, setUrlApplied] = useState(false);

  const urlValue = useUrlParam("select_value");

  if (!urlApplied && urlValue !== null) {
    setUrlApplied(true);
    if (OPTIONS.some((o) => o.value === urlValue)) setValue(urlValue);
  }

  useEffect(() => {
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("select_value", value);
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }, [value]);

  const code = `<Select defaultValue="${value}">
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    ${OPTIONS.map((o) => `<SelectItem value="${o.value}">${o.label}</SelectItem>`).join("\n    ")}
  </SelectContent>
</Select>`;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-glass p-6 backdrop-blur-xl">
      <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Choose an app" />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        Selected value: <span className="text-accent">{value}</span>
      </p>

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
