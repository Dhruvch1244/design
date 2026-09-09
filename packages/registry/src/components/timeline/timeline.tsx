import * as React from "react";
import { cn } from "../../lib/utils";

export interface TimelineItem {
  title: React.ReactNode;
  timestamp?: React.ReactNode;
  description?: React.ReactNode;
  /** Defaults to a plain dot when omitted. */
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent bg-card text-accent">
                {item.icon ?? <span className="h-2 w-2 rounded-full bg-accent" />}
              </span>
              {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className={cn("pb-8", isLast && "pb-0")}>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.timestamp && <span className="text-xs text-muted-foreground">{item.timestamp}</span>}
              </div>
              {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
