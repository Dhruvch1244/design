"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/dsgn/button";
import { Toaster } from "@/components/dsgn/toaster";
import { toast } from "@/components/dsgn/use-toast";

// Self-contained demo: its own <Toaster/> instance rather than relying on
// one mounted globally in layout.tsx — this site doesn't otherwise need
// toasts anywhere else, so there's nothing to share a global instance with.
// A consuming project would normally mount one <Toaster/> once, near the
// (untransformed) app root, not per-demo like this.
//
// Portaled to document.body specifically because *this* demo, unlike a
// real app root, is nested inside a Reveal wrapper — Reveal's own CSS
// applies `transform: translateY(...)` for its scroll-in animation, and
// any non-none transform on an ancestor creates a new containing block for
// position:fixed descendants (a real CSS behavior, not a bug), which broke
// ToastViewport's fixed-to-viewport positioning here specifically. Dialog/
// Sheet/AlertDialog don't hit this because Radix's own Portal already
// escapes to document.body internally; ToastViewport doesn't self-portal
// (matching the upstream convention that assumes root-level mounting), so
// this demo has to do it explicitly instead.
const noopSubscribe = () => () => {};

export function ToastDemo() {
  // Client/server snapshots differ on purpose — this is the standard way to
  // get a post-hydration-only render without calling setState in an effect
  // (the mounted-flag version trips this repo's set-state-in-effect lint
  // rule). Same primitive this repo already uses for theme-toggle/
  // palette-picker's DOM-attribute reads.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        onClick={() =>
          toast({ title: "Saved", description: "Your changes have been saved." })
        }
      >
        Show toast
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast({ variant: "destructive", title: "Something went wrong", description: "Could not save your changes." })
        }
      >
        Show destructive toast
      </Button>
      {mounted && createPortal(<Toaster />, document.body)}
    </div>
  );
}
