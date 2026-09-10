"use client";

import * as React from "react";
import { Button } from "@/components/dsgn/button";
import { Badge } from "@/components/dsgn/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/dsgn/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/dsgn/command";
import { cn } from "@/lib/utils";

// Composed the same way Combobox is: Popover + Command + Button, plus Badge
// for the selected-tag chips. No new primitive-library dependency — cmdk
// and @radix-ui/react-popover are already registry dependencies via Command
// and Popover, which this item installs alongside.
export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.filter((option) => value.includes(option.value));

  function toggle(optionValue: string) {
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onValueChange?.(next);
  }

  function remove(optionValue: string, event: React.MouseEvent) {
    event.stopPropagation();
    onValueChange?.(value.filter((v) => v !== optionValue));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-auto min-h-10 w-full justify-between font-normal", className)}
        >
          <span className="flex flex-1 flex-wrap items-center gap-1.5 py-0.5">
            {selected.length ? (
              selected.map((option) => (
                <Badge key={option.value} variant="secondary" className="gap-1 pr-1">
                  {option.label}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${option.label}`}
                    onClick={(event) => remove(option.value, event)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") remove(option.value, event as unknown as React.MouseEvent);
                    }}
                    className="rounded-full p-0.5 hover:bg-foreground/10"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0 opacity-50">
            <path d="m7 9 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={cn("mr-2 h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")}
                    >
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
