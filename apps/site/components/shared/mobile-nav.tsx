"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/dsgn/sheet";

/**
 * The behaviour half of a mobile navigation drawer, shared by every showcase
 * that has one (Thrum, Halyard, Alcove). The *look* is not shared and must not
 * be: each passes its own `className`, its own trigger button and its own nav
 * contents, so the three drawers stay as visually different as their apps.
 *
 * What is shared is the part that was being re-derived — and half-remembered —
 * per showcase:
 *
 *  - the open/close state and the "close on navigate" callback, which is what
 *    stops a drawer from staying up over the view it just navigated to;
 *  - the sr-only `SheetTitle`, which Radix requires for the dialog's
 *    accessible name and warns about in the console when missing. A nav drawer
 *    never has a visible heading, so this is the kind of requirement that is
 *    quietly dropped in the third copy.
 */

export interface MobileNav {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Stable reference, safe to pass straight to a child's `onNavigate`. */
  close: () => void;
}

export function useMobileNav(): MobileNav {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  return { open, setOpen, close };
}

export interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name for the drawer. Rendered sr-only. */
  title: string;
  /** Optional sr-only description, for drawers whose purpose isn't obvious. */
  description?: string;
  /** Rendered inside the Sheet as `SheetTrigger asChild`, when there is one. */
  trigger?: React.ReactNode;
  side?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}

export function MobileNavSheet({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  side = "left",
  className,
  children,
}: MobileNavSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent side={side} className={className}>
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {description ? (
          <SheetDescription className="sr-only">{description}</SheetDescription>
        ) : null}
        {children}
      </SheetContent>
    </Sheet>
  );
}
