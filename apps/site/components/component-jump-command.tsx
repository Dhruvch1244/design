"use client";

import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/dsgn/command";

/**
 * The /components page itself has no "use client" directive (it's mostly
 * static content), so an inline onSelect handler in page.tsx would cross
 * the Server/Client Component boundary illegally — same reason every other
 * interactive section on that page (ButtonPlayground, SwitchPlayground,
 * ...) is its own small client component instead of inline JSX.
 */
export function ComponentJumpCommand({ sections }: { sections: { id: string; text: string }[] }) {
  return (
    <div className="max-w-sm overflow-hidden rounded-2xl border border-border bg-card">
      <Command loop>
        <CommandInput placeholder="Jump to a component..." />
        <CommandList>
          <CommandEmpty>No components found.</CommandEmpty>
          <CommandGroup heading="Components">
            {sections.map(({ id, text }) => (
              <CommandItem
                key={id}
                value={text}
                onSelect={() => {
                  window.location.hash = id;
                }}
              >
                {text}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
