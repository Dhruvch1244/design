"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/dsgn/command";
import { TRACKED_EVENTS } from "@/lib/design-analytics/analytics";
import { VIEWS, type ViewId } from "@/lib/design-analytics/views";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (view: ViewId) => void;
  onOpenSettings: () => void;
  onSelectEvent: (eventId: string) => void;
  onToggleTheme: () => void;
}

/**
 * CommandDialog rather than an inline Command, on purpose: an inline cmdk
 * list auto-selects and scrolls its first item into view on mount, which
 * yanks the page when the widget sits below the fold. As a modal it only
 * mounts on open, so that can't happen.
 */
export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onOpenSettings,
  onSelectEvent,
  onToggleTheme,
}: CommandPaletteProps) {
  function run(action: () => void) {
    onOpenChange(false);
    action();
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search views, events, and actions…" autoFocus />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>

        <CommandGroup heading="Go to">
          {VIEWS.map((view) => (
            <CommandItem
              key={view.id}
              value={`${view.label} ${view.title} ${view.keywords}`}
              onSelect={() => run(() => onNavigate(view.id))}
            >
              <span className="shrink-0">{view.label}</span>
              {/* The view's description, not its title — for most views the
                  title and the nav label are the same word, and echoing it
                  back reads like a rendering bug. */}
              <span className="ml-2 truncate text-xs text-muted-foreground">
                {view.description}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Events">
          {TRACKED_EVENTS.slice(0, 5).map((event) => (
            <CommandItem
              key={event.id}
              value={`${event.name} ${event.key}`}
              onSelect={() => run(() => onSelectEvent(event.id))}
            >
              {event.name}
              <span className="ml-2 truncate font-mono text-xs text-muted-foreground">
                {event.key}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem value="workspace settings preferences" onSelect={() => run(onOpenSettings)}>
            Open workspace settings
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem value="toggle theme dark light appearance" onSelect={() => run(onToggleTheme)}>
            Toggle theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
