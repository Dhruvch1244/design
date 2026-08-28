"use client";

import { useState } from "react";
import { Button } from "@/components/dsgn/button";
import { Input } from "@/components/dsgn/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/dsgn/select";
import { CopyButton } from "@/components/copy-button";

const VARIANTS = [
  "primary",
  "secondary",
  "accent",
  "glow",
  "soft",
  "outline",
  "ghost",
  "link",
  "destructive",
] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

type Variant = (typeof VARIANTS)[number];
type Size = (typeof SIZES)[number];

/**
 * A real interactive playground, not another static example — change props
 * via the controls, the button re-renders live, and the JSX snippet below
 * updates and stays copy-pasteable. This is what turns a component gallery
 * into an actual reference tool: you can compose the exact instance you
 * need instead of eyeballing a fixed demo and hand-writing the props.
 */
export function ButtonPlayground() {
  const [variant, setVariant] = useState<Variant>("accent");
  const [size, setSize] = useState<Size>("md");
  const [label, setLabel] = useState("Button");

  const code = `<Button variant="${variant}" size="${size}">${label || "Button"}</Button>`;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-glass p-6 backdrop-blur-xl">
      <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border">
        <Button variant={variant} size={size}>
          {label || "Button"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            Size
          </label>
          <Select value={size} onValueChange={(v) => setSize(v as Size)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Label
          </label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={24} />
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
