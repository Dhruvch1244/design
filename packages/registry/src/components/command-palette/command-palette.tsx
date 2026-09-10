"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "../command/command";

export interface CommandPaletteItem {
  id: string;
  label: string;
  onSelect: () => void;
  /** Items with the same `group` render under one `CommandGroup` heading. Ungrouped items render under no heading. */
  group?: string;
  shortcut?: string;
  icon?: React.ReactNode;
}

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null);

/**
 * Reads (or toggles) the palette's open state from anywhere inside a
 * `<CommandPaletteProvider>` -- e.g. a nav "Search" button that opens the
 * same palette the global ⌘K shortcut opens, without duplicating that logic.
 */
export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext);
  if (!context) throw new Error("useCommandPalette must be used inside <CommandPaletteProvider>.");
  return context;
}

export interface CommandPaletteProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps an app (or a section of one) and wires a global ⌘K / Ctrl+K
 * shortcut to open/close a command palette, exposing the state via
 * `useCommandPalette()`. Renders no palette UI itself -- pair it with
 * `<CommandPalette items={...} />` placed anywhere inside it (or a fully
 * custom consumer of `useCommandPalette()`).
 *
 * The keydown listener below is registered inside a useEffect, and the
 * effect's own callback is the only place `setOpen` is called -- an
 * event-driven update, not a synchronous setState call in the effect body,
 * so this doesn't trip `react-hooks/set-state-in-effect`.
 */
export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = React.useMemo(() => ({ open, setOpen }), [open]);

  return <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>;
}

export interface CommandPaletteProps {
  items: CommandPaletteItem[];
  placeholder?: string;
  emptyText?: string;
  label?: string;
}

/**
 * The actual palette dialog. Reads open/close state from
 * `useCommandPalette()`, so it must be rendered inside a
 * `<CommandPaletteProvider>`. Reuses Command's own `CommandDialog` chrome
 * (Escape-to-close, backdrop-click-to-close) instead of a second dialog
 * primitive.
 */
export function CommandPalette({
  items,
  placeholder = "Type a command or search...",
  emptyText = "No results found.",
  label = "Command palette",
}: CommandPaletteProps) {
  const { open, setOpen } = useCommandPalette();

  const groups = React.useMemo(() => {
    const byGroup = new Map<string, CommandPaletteItem[]>();
    for (const item of items) {
      const key = item.group ?? "";
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key)!.push(item);
    }
    return byGroup;
  }, [items]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} label={label}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>{emptyText}</CommandEmpty>
        {Array.from(groups.entries()).map(([group, groupItems]) => (
          <CommandGroup key={group || "default"} heading={group || undefined}>
            {groupItems.map((item) => (
              <CommandItem
                key={item.id}
                value={item.label}
                onSelect={() => {
                  item.onSelect();
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
                {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
