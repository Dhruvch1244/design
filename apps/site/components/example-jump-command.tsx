"use client";

import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/dsgn/command";

/**
 * Same pattern as components/component-jump-command.tsx — its own small
 * client component because /examples/page.tsx has no "use client" directive.
 * Gives the page a real, always-reachable search instead of only the
 * desktop-only (lg:block) static TableOfContents sidebar.
 */
export function ExampleJumpCommand({ sections }: { sections: { id: string; text: string }[] }) {
  return (
    <div className="max-w-sm overflow-hidden rounded-2xl border border-border bg-card">
      <Command loop>
        <CommandInput placeholder="Jump to an example..." />
        <CommandList>
          <CommandEmpty>No examples found.</CommandEmpty>
          <CommandGroup heading="Examples">
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
