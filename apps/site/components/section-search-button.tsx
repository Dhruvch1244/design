"use client";

import { useState } from "react";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/dsgn/command";
import { SEARCH_GEOMETRY } from "@/components/icons/site";

/**
 * A compact trigger button that opens a modal Command palette scoped to
 * this page's own sections — same visual language as the site-wide ⌘K
 * button in Nav, not a permanently-expanded inline list. Modal, not inline,
 * also sidesteps the off-screen-Command scroll bug LazyMount works around
 * elsewhere on these pages: a dialog is always centered/visible the moment
 * it mounts, so cmdk's auto-select-first-item-on-mount has nothing to
 * scroll the page toward.
 */
export function SectionSearchButton({
  sections,
  heading,
  placeholder,
  label,
}: {
  sections: { id: string; text: string }[];
  heading: string;
  placeholder: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors duration-300 ease-fluid hover:border-accent hover:text-accent"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          {SEARCH_GEOMETRY}
        </svg>
        {label}
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading={heading}>
            {sections.map(({ id, text }) => (
              <CommandItem
                key={id}
                value={text}
                onSelect={() => {
                  setOpen(false);
                  window.location.hash = id;
                }}
              >
                {text}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
