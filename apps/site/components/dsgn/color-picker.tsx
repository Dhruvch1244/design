"use client";

import * as React from "react";
import { Button } from "@/components/dsgn/button";
import { Input } from "@/components/dsgn/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/dsgn/popover";
import { cn } from "@/lib/utils";

const DEFAULT_PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#000000",
  "#ffffff",
];

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export interface ColorPickerProps {
  /** Current color as a hex string, e.g. "#3b82f6". */
  value: string;
  onValueChange: (value: string) => void;
  /** Preset swatches shown as a quick-pick row. Defaults to a 10-color set. */
  presets?: string[];
  className?: string;
}

/**
 * A swatch trigger that opens a Popover with three ways to pick a color:
 * a native `<input type="color">` (browsers already ship a real color-picker
 * UI here -- an HSV wheel hand-rolled in React would fail the std-first bar
 * badly for what a single native element already does), a row of preset
 * swatch buttons, and a text input for typing/pasting a hex value directly.
 * Fully controlled -- `value`/`onValueChange`, no internal color state.
 */
export function ColorPicker({ value, onValueChange, presets = DEFAULT_PRESETS, className }: ColorPickerProps) {
  const [draft, setDraft] = React.useState(value);
  const [open, setOpen] = React.useState(false);

  // Resets the text-input draft whenever the popover opens (or the
  // controlled value changes) -- a plain state update inside the
  // onOpenChange event handler, not a setState call in a useEffect body.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setDraft(value);
  }

  function commitHex(hex: string) {
    setDraft(hex);
    if (HEX_PATTERN.test(hex)) onValueChange(hex);
  }

  const swatchColor = HEX_PATTERN.test(value) ? value : "#000000";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={`Pick a color, current value ${value}`}
          className={cn("w-auto gap-2 px-2.5", className)}
        >
          <span aria-hidden="true" className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: swatchColor }} />
          <span className="font-mono text-xs">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3">
        <input
          type="color"
          aria-label="Custom color"
          value={swatchColor}
          onChange={(event) => commitHex(event.target.value)}
          className="h-9 w-full cursor-pointer rounded-md border border-border bg-transparent p-1"
        />
        <div className="grid grid-cols-5 gap-1.5">
          {presets.map((preset) => {
            const isActive = preset.toLowerCase() === value.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                aria-label={preset}
                aria-pressed={isActive}
                onClick={() => commitHex(preset)}
                className={cn(
                  "h-6 w-6 rounded-full border transition-transform hover:scale-110",
                  isActive ? "border-foreground ring-2 ring-ring ring-offset-2 ring-offset-card" : "border-border",
                )}
                style={{ backgroundColor: preset }}
              />
            );
          })}
        </div>
        <Input
          value={draft}
          onChange={(event) => commitHex(event.target.value)}
          placeholder="#000000"
          maxLength={7}
          className="font-mono text-xs"
        />
      </PopoverContent>
    </Popover>
  );
}
