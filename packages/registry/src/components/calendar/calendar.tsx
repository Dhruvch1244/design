"use client";

import * as React from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { buttonVariants } from "../button/button";
import { cn } from "../../lib/utils";

export type CalendarProps = DayPickerProps;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "w-fit",
        months: "flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-3",
        month_caption: "flex items-center justify-center pt-1 relative",
        caption_label: "text-sm font-medium",
        nav: "flex items-center justify-between absolute inset-x-0 top-0",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-9 text-[0.8rem] font-normal",
        weeks: "flex flex-col gap-1 mt-2",
        week: "flex w-full",
        day: cn(
          "relative w-9 h-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([data-selected])]:bg-accent/12 [&:has([data-selected].range_start)]:rounded-l-md",
          "[&:has([data-selected].range_end)]:rounded-r-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 rounded-md p-0 font-normal aria-selected:opacity-100",
        ),
        range_start: "range_start rounded-l-md",
        range_end: "range_end rounded-r-md",
        range_middle: "!bg-accent/12 !text-foreground rounded-none",
        selected:
          "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:hover:bg-accent [&>button]:hover:text-accent-foreground",
        today: "[&>button]:bg-muted [&>button]:text-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const isLeft = orientation === "left";
          return (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={cn("h-4 w-4", chevronClassName)}
              {...chevronProps}
            >
              <path
                d={isLeft ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
