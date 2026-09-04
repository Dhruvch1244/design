"use client";

import * as React from "react";

/**
 * One implementation of the ⌘/Ctrl-key shortcut every command palette on this
 * site binds.
 *
 * Three surfaces used to hand-roll this (the site-wide palette, Halyard's
 * shell, Alcove's board store) and they had already drifted apart: only one of
 * them guarded against firing while a Radix modal owned the page. That guard
 * is not a nicety — a palette opened from inside an open Sheet renders outside
 * that Sheet's focus trap and underneath its `aria-hidden`, so it is visible
 * but neither focusable nor announced. Consolidating means that fix exists
 * once instead of needing to be remembered three times.
 *
 * The DOM is the source of truth for "is a modal open": the surfaces that can
 * be open live in different components (and in Alcove's case a different
 * provider), so asking React would mean lifting state that has no other reason
 * to move.
 */

export interface CommandShortcutBinding {
  /** Single character, matched case-insensitively, with ⌘ or Ctrl held. */
  key: string;
  onTrigger: () => void;
  /**
   * Set when this binding's own surface is the modal currently open, so the
   * shortcut can still *close* it. Without this the modal guard below would
   * make ⌘K a one-way door.
   */
  ownsOpenModal?: boolean;
}

function aModalIsOpen(): boolean {
  return (
    document.querySelector(
      '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
    ) !== null
  );
}

export function useCommandShortcut(bindings: CommandShortcutBinding[]): void {
  // Held in a ref so a new inline array on every render doesn't tear down and
  // re-attach the listener — the handler always reads the latest bindings.
  // Written in an effect rather than during render: a ref write during render
  // is not safe under concurrent rendering, and the only reader is a keydown
  // handler, which can never run before the commit that set it.
  const latest = React.useRef(bindings);
  React.useEffect(() => {
    latest.current = bindings;
  });

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.metaKey && !event.ctrlKey) return;

      const pressed = event.key.toLowerCase();
      const binding = latest.current.find((b) => b.key.toLowerCase() === pressed);
      if (!binding) return;
      if (aModalIsOpen() && !binding.ownsOpenModal) return;

      event.preventDefault();
      binding.onTrigger();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
