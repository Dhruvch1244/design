"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/dsgn/badge";
import { Input } from "@/components/dsgn/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/dsgn/select";
import { CopyButton } from "@/components/copy-button";
import { useUrlParam } from "@/lib/use-url-param";

const VARIANTS = ["primary", "secondary", "accent", "outline", "destructive"] as const;
type Variant = (typeof VARIANTS)[number];

export function BadgePlayground() {
  const [variant, setVariant] = useState<Variant>("accent");
  const [label, setLabel] = useState("Badge");
  const skipFirstWrite = useRef(true);
  const [urlApplied, setUrlApplied] = useState(false);

  const urlVariant = useUrlParam("badge_variant");
  const urlLabel = useUrlParam("badge_label");

  if (!urlApplied && (urlVariant !== null || urlLabel !== null)) {
    setUrlApplied(true);
    if (urlVariant && (VARIANTS as readonly string[]).includes(urlVariant)) setVariant(urlVariant as Variant);
    if (urlLabel) setLabel(urlLabel.slice(0, 20));
  }

  useEffect(() => {
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("badge_variant", variant);
    params.set("badge_label", label || "Badge");
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }, [variant, label]);

  const code = `<Badge variant="${variant}">${label || "Badge"}</Badge>`;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-glass p-6 backdrop-blur-xl">
      <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border">
        <Badge variant={variant}>{label || "Badge"}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Variant
          </label>
          <Select value={variant} onValueChange={(v) => setVariant(v as Variant)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VARIANTS.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Label
          </label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={20} />
        </div>
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
