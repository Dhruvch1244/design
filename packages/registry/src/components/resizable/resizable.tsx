"use client";

import * as React from "react";
import { Group, Panel, Separator, type GroupProps, type PanelProps, type SeparatorProps } from "react-resizable-panels";
import { cn } from "../../lib/utils";

// react-resizable-panels 4.x renamed its whole public API from the
// PanelGroup/Panel/PanelResizeHandle shape most docs (and this repo's own
// training data) still reference: PanelGroup -> Group, PanelResizeHandle ->
// Separator, and the `direction` prop -> `orientation`. Writing `direction=`
// or importing `PanelGroup` against this installed version fails as a
// TS2305 "has no exported member" error, not a silent behavior change.
// These wrapper names (ResizablePanelGroup/ResizablePanel/ResizableHandle)
// keep the familiar public API; only the internal wiring targets v4.
//
// Neither Group nor Separator emit a `data-orientation` attribute at
// runtime (Group applies orientation only as an inline flexDirection style,
// which already lays out its children correctly on its own; Separator
// exposes orientation solely via `aria-orientation`) -- so the handle's
// vertical styling below keys off `aria-orientation`, the one signal the
// library does emit.
export const ResizablePanelGroup = React.forwardRef<HTMLDivElement, GroupProps>(
  ({ className, ...props }, ref) => (
    <Group elementRef={ref} className={cn("flex h-full w-full", className)} {...props} />
  ),
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

export const ResizablePanel = React.forwardRef<HTMLDivElement, PanelProps>(({ className, ...props }, ref) => (
  <Panel elementRef={ref} className={className} {...props} />
));
ResizablePanel.displayName = "ResizablePanel";

export interface ResizableHandleProps extends SeparatorProps {
  withHandle?: boolean;
}

export const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ withHandle, className, ...props }, ref) => (
    <Separator
      elementRef={ref}
      className={cn(
        "relative flex w-px items-center justify-center bg-border",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-4 after:-translate-x-1/2",
        "aria-[orientation=vertical]:h-px aria-[orientation=vertical]:w-full",
        "aria-[orientation=vertical]:after:inset-x-0 aria-[orientation=vertical]:after:h-4",
        "aria-[orientation=vertical]:after:w-auto aria-[orientation=vertical]:after:translate-x-0",
        "aria-[orientation=vertical]:after:-translate-y-1/2 aria-[orientation=vertical]:after:left-0",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border bg-border">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5">
            <circle cx="9" cy="6" r="1" />
            <circle cx="15" cy="6" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="9" cy="18" r="1" />
            <circle cx="15" cy="18" r="1" />
          </svg>
        </div>
      )}
    </Separator>
  ),
);
ResizableHandle.displayName = "ResizableHandle";
