"use client";

import { useState } from "react";
import { Badge } from "@/components/dsgn/badge";
import { Input } from "@/components/dsgn/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/dsgn/select";
import { CopyButton } from "@/components/copy-button";

const VARIANTS = ["primary", "secondary", "accent", "outline", "destructive"] as const;
type Variant = (typeof VARIANTS)[number];

export function BadgePlayground() {
  const [variant, setVariant] = useState<Variant>("accent");
  const [label, setLabel] = useState("Badge");

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
        <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
          <code>{code}</code>
        </pre>
        <CopyButton text={code} className="absolute right-3 top-3" />
      </div>
    </div>
  );
}
