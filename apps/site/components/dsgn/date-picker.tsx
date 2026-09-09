"use client";

import * as React from "react";
import { Button } from "@/components/dsgn/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/dsgn/popover";
import { Calendar } from "@/components/dsgn/calendar";
import { cn } from "@/lib/utils";

const formatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" });

export interface DatePickerProps {
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = "Pick a date",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-[240px] justify-start font-normal", !value && "text-muted-foreground", className)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
          </svg>
          {value ? formatter.format(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
