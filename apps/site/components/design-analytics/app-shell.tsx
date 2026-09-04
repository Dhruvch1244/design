"use client";

import { useCallback, useState } from "react";
import { MobileNavSheet, useMobileNav } from "@/components/shared/mobile-nav";
import { useCommandShortcut } from "@/components/shared/use-command-shortcut";
import { toggleSiteTheme } from "@/components/shared/theme";
import { AlertsView } from "@/components/design-analytics/alerts-view";
import { CommandPalette } from "@/components/design-analytics/command-palette";
import { EventsView } from "@/components/design-analytics/events-view";
import { OverviewView } from "@/components/design-analytics/overview-view";
import { RetentionView } from "@/components/design-analytics/retention-view";
import { SettingsSheet } from "@/components/design-analytics/settings-sheet";
import { Sidebar } from "@/components/design-analytics/sidebar";
import { TeamView } from "@/components/design-analytics/team-view";
import { TopBar } from "@/components/design-analytics/top-bar";
import { VIEW_BY_ID, type ViewId } from "@/lib/design-analytics/views";

export function AppShell() {
  const [view, setView] = useState<ViewId>("overview");
  const nav = useMobileNav();
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);

  /* One shortcut owner for the whole app rather than one per surface — the
     same reason the philosophy asks for a single scheduler: every shortcut
     resolves in one place, so two of them can't disagree about what an open
     modal should suppress. The listener, and the modal guard that keeps the
     palette from opening underneath a Sheet's focus trap, now live in
     components/shared/use-command-shortcut.ts. */
  useCommandShortcut([
    { key: "k", onTrigger: () => setSearchOpen((prev) => !prev), ownsOpenModal: searchOpen },
    { key: ",", onTrigger: () => setSettingsOpen(true) },
  ]);

  const closeNav = nav.close;

  const navigate = useCallback(
    (next: ViewId) => {
      setView(next);
      closeNav();
      setFocusedEventId(null);
    },
    [closeNav],
  );

  const selectEvent = useCallback(
    (eventId: string) => {
      setView("events");
      closeNav();
      setFocusedEventId(eventId);
    },
    [closeNav],
  );


  const meta = VIEW_BY_ID[view];

  return (
    <div className="min-h-dvh">
      {/* Desktop rail. Fixed rather than sticky so the main column's scroll
          never drags it, and hidden below lg where the Sheet takes over. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-card lg:block">
        <Sidebar
          activeView={view}
          onNavigate={navigate}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </aside>

      {/* The sr-only title/description Radix requires for a drawer with no
          visible heading are supplied by MobileNavSheet, so they can't be
          forgotten here or in the two other showcases that have a drawer. */}
      <MobileNavSheet
        open={nav.open}
        onOpenChange={nav.setOpen}
        title="Navigation"
        description="Switch between views in this workspace."
        className="w-72 p-0 sm:max-w-xs"
      >
        <Sidebar
          activeView={view}
          onNavigate={navigate}
          onOpenSettings={() => {
            nav.close();
            setSettingsOpen(true);
          }}
        />
      </MobileNavSheet>

      <div className="lg:pl-60">
        <TopBar
          activeView={view}
          onOpenNav={() => nav.setOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <main className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{meta.title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {meta.description}
            </p>
          </div>

          {view === "overview" ? <OverviewView /> : null}
          {view === "events" ? (
            <EventsView
              focusedEventId={focusedEventId}
              onFocusHandled={() => setFocusedEventId(null)}
            />
          ) : null}
          {view === "retention" ? <RetentionView /> : null}
          {view === "team" ? <TeamView /> : null}
          {view === "alerts" ? <AlertsView /> : null}
        </main>
      </div>

      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={navigate}
        onOpenSettings={() => setSettingsOpen(true)}
        onSelectEvent={selectEvent}
        onToggleTheme={toggleSiteTheme}
      />

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
