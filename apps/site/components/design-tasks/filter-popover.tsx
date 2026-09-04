"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dsgn/popover";
import { Checkbox } from "@/components/dsgn/checkbox";
import { Button } from "@/components/dsgn/button";
import { Separator } from "@/components/dsgn/separator";
import { Badge } from "@/components/dsgn/badge";
import { FilterIcon } from "@/components/design-tasks/icons";
import { LabelSwatch } from "@/components/design-tasks/task-bits";
import { LABELS, PEOPLE, type LabelId } from "@/lib/design-tasks/board";
import { useBoard } from "@/lib/design-tasks/store";

export function FilterPopover() {
  const { filters, setFilters, filtersActive, clearFilters } = useBoard();
  const count = filters.labels.length + filters.people.length;
  // The popover's own accessible name. Pointed at the heading that is already
  // on screen rather than an aria-label, so the name a screen reader hears and
  // the name a sighted person reads are the same string.
  const headingId = React.useId();

  function toggleLabel(id: LabelId, on: boolean) {
    setFilters((prev) => ({
      ...prev,
      labels: on ? [...prev.labels, id] : prev.labels.filter((l) => l !== id),
    }));
  }

  function togglePerson(id: string, on: boolean) {
    setFilters((prev) => ({
      ...prev,
      people: on ? [...prev.people, id] : prev.people.filter((p) => p !== id),
    }));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={filtersActive ? "soft" : "ghost"}
          size="sm"
          leftIcon={<FilterIcon className="h-4 w-4" />}
        >
          Filter
          {count > 0 && (
            <Badge
              variant="secondary"
              className="tnum ml-0.5 border-transparent bg-accent/18 px-1.5 text-[0.625rem] text-accent"
            >
              {count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-labelledby={headingId} className="w-72 p-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 id={headingId} className="text-sm font-semibold">
            Filter cycle 14
          </h3>
          {filtersActive && (
            <Button variant="link" size="sm" onClick={clearFilters}>
              Reset
            </Button>
          )}
        </div>

        <div className="px-4 pb-2 pt-3">
          <p className="pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
            Labels
          </p>
          <div className="space-y-0.5">
            {LABELS.map((label) => (
              <label
                key={label.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm transition-colors duration-300 ease-[var(--ease-fluid)] hover:bg-muted/70"
              >
                <Checkbox
                  checked={filters.labels.includes(label.id)}
                  onCheckedChange={(next) => toggleLabel(label.id, next === true)}
                />
                <LabelSwatch id={label.id} />
                {label.name}
              </label>
            ))}
          </div>
        </div>

        <Separator />

        <div className="px-4 pb-4 pt-3">
          <p className="pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
            People
          </p>
          <div className="space-y-0.5">
            {PEOPLE.map((person) => (
              <label
                key={person.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm transition-colors duration-300 ease-[var(--ease-fluid)] hover:bg-muted/70"
              >
                <Checkbox
                  checked={filters.people.includes(person.id)}
                  onCheckedChange={(next) => togglePerson(person.id, next === true)}
                />
                <span className="truncate">{person.name}</span>
              </label>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
