"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/dsgn/button";
import { Input } from "@/components/dsgn/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/dsgn/select";
import { CopyButton } from "@/components/copy-button";
import { useUrlParam } from "@/lib/use-url-param";

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
 *
 * State also round-trips through the URL query string (button_variant,
 * button_size, button_label) so a configured instance is a shareable link,
 * not just a screenshot. Reads use useUrlParam (useSyncExternalStore) so
 * the hydration-matching render always sees the static-exported default —
 * the real value from the URL, if any, is applied via the guarded
 * render-phase setState below, never inside a useEffect body, matching
 * this codebase's existing theme/accent pattern (theme-toggle.tsx).
 */
export function ButtonPlayground() {
  const [variant, setVariant] = useState<Variant>("accent");
  const [size, setSize] = useState<Size>("md");
  const [label, setLabel] = useState("Button");
  const skipFirstWrite = useRef(true);
  const [urlApplied, setUrlApplied] = useState(false);

  const urlVariant = useUrlParam("button_variant");
  const urlSize = useUrlParam("button_size");
  const urlLabel = useUrlParam("button_label");

  if (!urlApplied && (urlVariant !== null || urlSize !== null || urlLabel !== null)) {
    setUrlApplied(true);
    if (urlVariant && (VARIANTS as readonly string[]).includes(urlVariant)) setVariant(urlVariant as Variant);
    if (urlSize && (SIZES as readonly string[]).includes(urlSize)) setSize(urlSize as Size);
    if (urlLabel) setLabel(urlLabel.slice(0, 24));
  }

  useEffect(() => {
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("button_variant", variant);
    params.set("button_size", size);
    params.set("button_label", label || "Button");
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }, [variant, size, label]);

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
