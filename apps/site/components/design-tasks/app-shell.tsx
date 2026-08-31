"use client";

import { Tabs, TabsContent } from "@/components/dsgn/tabs";
import { TooltipProvider } from "@/components/dsgn/tooltip";
import { Sidebar } from "@/components/design-tasks/sidebar";
import { TopBar } from "@/components/design-tasks/top-bar";
import { BoardView } from "@/components/design-tasks/board-view";
import { ListView } from "@/components/design-tasks/list-view";
import { TimelineView } from "@/components/design-tasks/timeline-view";
import { TaskDetailSheet } from "@/components/design-tasks/task-detail-sheet";
import { CommandPalette } from "@/components/design-tasks/command-palette";
import { BoardProvider, useBoard, type ViewId } from "@/lib/design-tasks/store";

const PANEL = "mt-0 flex min-h-0 flex-1 flex-col focus-visible:outline-none";

function Shell() {
  const { view, setView } = useBoard();

  return (
    /*
     * The shell owns the viewport height and nothing outside it scrolls.
     * Every view scrolls inside its own region instead, which is what keeps
     * column headers pinned to their own cards and — deliberately — means
     * the document never gains a horizontal scrollbar at any width.
     */
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <Tabs
        value={view}
        onValueChange={(next) => setView(next as ViewId)}
        className="flex min-w-0 flex-1 flex-col"
      >
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col px-4 pb-4 md:px-6 md:pb-6">
          <TabsContent value="board" className={PANEL}>
            <BoardView />
          </TabsContent>
          <TabsContent value="list" className={PANEL}>
            <ListView />
          </TabsContent>
          <TabsContent value="timeline" className={PANEL}>
            <TimelineView />
          </TabsContent>
        </main>
      </Tabs>

      <TaskDetailSheet />
      <CommandPalette />
    </div>
  );
}

export function AppShell() {
  return (
    <BoardProvider>
      {/* One Tooltip provider at the root rather than one per trigger, so the
          whole app shares a single open/close delay and hovering from one
          icon button to the next does not re-run the open delay. */}
      <TooltipProvider delayDuration={280} skipDelayDuration={400}>
        <Shell />
      </TooltipProvider>
    </BoardProvider>
  );
}
