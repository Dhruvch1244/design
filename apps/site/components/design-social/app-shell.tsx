"use client";

import * as React from "react";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/dsgn/sheet";
import { AccentSwitcher } from "@/components/design-social/accent-switcher";
import { ComposeDialog } from "@/components/design-social/compose-dialog";
import { ExploreView } from "@/components/design-social/explore-view";
import { FeedView } from "@/components/design-social/feed-view";
import { LeftNav } from "@/components/design-social/left-nav";
import { NotificationsView } from "@/components/design-social/notifications-view";
import { ProfileView } from "@/components/design-social/profile-view";
import { RightRail } from "@/components/design-social/right-rail";
import { SettingsSheet } from "@/components/design-social/settings-sheet";
import { ThreadSheet } from "@/components/design-social/thread-sheet";
import { Wordmark } from "@/components/design-social/wordmark";
import { MenuIcon, PenIcon, VIEW_ICONS } from "@/components/design-social/icons";
import { unreadCount, VIEWER } from "@/lib/design-social/feed";
import { VIEWS, type ViewId } from "@/lib/design-social/views";
import { cn } from "@/lib/utils";

/**
 * Thrum's application shell.
 *
 * All cross-view state lives here and nowhere else — which view is showing,
 * whose profile, which thread is open, whether the settings sheet is up. The
 * four views below are pure functions of props: none of them can navigate on
 * their own or reach for a router, so the whole navigation model of the app is
 * readable in the ~30 lines at the top of this file.
 *
 * A single client component rather than four routes because this showcase is
 * one page by design: a thread or a profile opened from the feed should return
 * you to the same scroll offset, which a route change does not guarantee.
 */
export function AppShell() {
  const [view, setView] = React.useState<ViewId>("feed");
  const [profileHandle, setProfileHandle] = React.useState<string>(VIEWER.handle);
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);

  const unread = unreadCount();

  /** Switches view and returns the reader to the top, as a route change would. */
  const navigate = React.useCallback((next: ViewId) => {
    setView((current) => {
      if (current !== next) window.scrollTo({ top: 0 });
      return next;
    });
    if (next === "profile") setProfileHandle(VIEWER.handle);
  }, []);

  const openProfile = React.useCallback((handle: string) => {
    // Closing the thread sheet is deliberate: leaving it open over a profile
    // the reader just asked for would bury the thing they navigated to.
    setThreadId(null);
    setProfileHandle(handle);
    setView("profile");
    window.scrollTo({ top: 0 });
  }, []);

  const openSettings = React.useCallback(() => {
    setNavOpen(false);
    setSettingsOpen(true);
  }, []);

  return (
    <div className="relative">
      {/* --- mobile top bar --- */}
      <header
        className={cn(
          "sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/70 px-4 lg:hidden",
          "bg-background/85 backdrop-blur-md",
        )}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open menu"
          onClick={() => setNavOpen(true)}
          className="-ml-1 rounded-full"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        <Wordmark className="text-xl" />
        <span className="flex-1" />
        <AccentSwitcher />
      </header>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        {/*
          A flex column, not a plain block: LeftNav's root is `h-full`, so
          without this the wordmark above it would push the nav's own footer
          (the account menu) past the bottom of the sheet and clip it. The
          `min-h-0` wrapper is what lets the nav's internal ScrollArea shrink
          instead of overflowing.
        */}
        <SheetContent side="left" className="flex w-[19rem] flex-col gap-5 p-5 pt-14">
          {/* Radix requires a Title for the dialog's accessible name; the
              visible chrome here is the nav itself, so it is screen-reader
              only rather than a heading nobody needed. */}
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Wordmark />
          <div className="min-h-0 flex-1">
            <LeftNav
              variant="sheet"
              view={view}
              onNavigate={navigate}
              onOpenSettings={openSettings}
              onAfterNavigate={() => setNavOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-4 sm:px-6 lg:gap-8 lg:px-8">
        {/* --- desktop rail --- */}
        <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 py-6 lg:block xl:w-64">
          <LeftNav view={view} onNavigate={navigate} onOpenSettings={openSettings} />
        </aside>

        {/* No aria-live here on purpose: the whole view is swapped on
            navigation, and a live region wrapping it would read the entire
            page aloud on every tap. Navigation is announced by the pressed
            control and `aria-current` on it instead. */}
        <main id="main" className="min-w-0 flex-1 py-6 pb-28 lg:py-10 lg:pb-16">
          {view === "feed" && (
            <FeedView
              onOpenThread={setThreadId}
              onOpenProfile={openProfile}
              onNavigate={navigate}
            />
          )}
          {view === "explore" && <ExploreView />}
          {view === "notifications" && (
            <NotificationsView onOpenProfile={openProfile} onOpenSettings={openSettings} />
          )}
          {view === "profile" && (
            <ProfileView
              // Keyed on the handle so switching between two people remounts
              // the tabs and per-profile local state instead of carrying one
              // person's "Following" toggle onto the next.
              key={profileHandle}
              handle={profileHandle}
              onOpenThread={setThreadId}
              onOpenProfile={openProfile}
              onOpenSettings={openSettings}
            />
          )}
        </main>

        {/* --- desktop context column --- */}
        <aside className="sticky top-0 hidden h-[100dvh] w-80 shrink-0 overflow-y-auto py-6 xl:block">
          <RightRail onNavigate={navigate} onOpenProfile={openProfile} />
        </aside>
      </div>

      {/* --- mobile bottom bar --- */}
      <nav
        aria-label="Primary"
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-border/70 lg:hidden",
          "bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md",
        )}
      >
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {VIEWS.map((v) => {
            const Icon = VIEW_ICONS[v.icon];
            const active = v.id === view;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => navigate(v.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex w-full flex-col items-center gap-1 py-2.5 outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    active ? "text-accent" : "text-ink-faint",
                  )}
                >
                  <span className="relative">
                    <Icon className="h-[1.35rem] w-[1.35rem]" />
                    {v.id === "notifications" && unread > 0 && (
                      <Badge
                        variant="accent"
                        className="tnum absolute -right-2.5 -top-1.5 h-4 min-w-4 justify-center px-1 text-[0.6rem] leading-none"
                      >
                        {unread}
                      </Badge>
                    )}
                  </span>
                  <span className="text-[0.65rem] font-medium">{v.shortLabel}</span>
                  {/* The active marker is a gradient underline rather than a
                      filled pill: at this size a fill would swallow the icon. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-5 top-0 h-0.5 rounded-full transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-0",
                    )}
                    style={{ backgroundImage: "var(--accent-grad)" }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Floating composer, mobile only — the desktop rail already carries a
          full-width "New pulse" button, so this would be a second primary CTA
          on the same screen if it were visible there. */}
      <div className="fixed bottom-[4.75rem] right-4 z-30 lg:hidden">
        <ComposeDialog>
          <Button
            variant="glow"
            size="icon-lg"
            aria-label="New pulse"
            className="rounded-full shadow-[var(--glow-accent)]"
          >
            <PenIcon className="h-5 w-5" />
          </Button>
        </ComposeDialog>
      </div>

      <ThreadSheet pulseId={threadId} onOpenChange={(open) => !open && setThreadId(null)} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
