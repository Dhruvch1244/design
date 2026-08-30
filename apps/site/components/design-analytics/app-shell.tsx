"use client";

import { useCallback, useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/dsgn/sheet";
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

// Matches @/components/theme-toggle's own toggle exactly (same data-theme
// attribute, same localStorage key) rather than Halyard's original
// lib/theme.ts, which wrote a separate "halyard-theme" key and a custom
// event — pointless once this shares the site's single data-theme attribute
// on <html>, and would have left the command palette's "Toggle theme" out of
// sync with the site's own theme toggle in the top bar.
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

export function AppShell() {
  const [view, setView] = useState<ViewId>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);

  /* One keydown listener for the whole app rather than one per surface —
     the same reason the philosophy asks for a single scheduler: every
     shortcut resolves in one place, so two of them can't disagree about
     what an open modal should suppress. */
  useEffect(() => {
    /*
     * A window-level shortcut fires even while a Radix modal owns the page,
     * which is a real bug rather than a nicety: opening the palette from
     * inside an open Sheet renders it outside that Sheet's focus trap and
     * underneath its `aria-hidden`, so it is visible but not focusable and
     * not announced. The DOM is the only reliable source of truth for "is a
     * modal open" here — the event sheet's state lives inside EventsView, so
     * this component cannot ask React for it without lifting state that has
     * no other reason to move up.
     */
    function aModalIsOpen() {
      return document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      ) !== null;
    }

    function onKeyDown(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      const key = event.key.toLowerCase();
      if (key !== "k" && key !== ",") return;
      // Closing the palette must keep working even though the palette itself
      // is a dialog, so the guard only blocks *opening* on top of a modal.
      if (aModalIsOpen() && !(key === "k" && searchOpen)) return;

      event.preventDefault();
      if (key === "k") setSearchOpen((prev) => !prev);
      else setSettingsOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  const navigate = useCallback((next: ViewId) => {
    setView(next);
    setNavOpen(false);
    setFocusedEventId(null);
  }, []);

  const selectEvent = useCallback((eventId: string) => {
    setView("events");
    setNavOpen(false);
    setFocusedEventId(eventId);
  }, []);


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

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-xs">
          {/* Radix logs a console warning for a Dialog without a Title or
              Description; the nav has neither visually, so both are sr-only
              rather than omitted. */}
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Switch between views in this workspace.
          </SheetDescription>
          <Sidebar
            activeView={view}
            onNavigate={navigate}
            onOpenSettings={() => {
              setNavOpen(false);
              setSettingsOpen(true);
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-60">
        <TopBar
          activeView={view}
          onOpenNav={() => setNavOpen(true)}
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
        onToggleTheme={() => toggleTheme()}
      />

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
