"use client";

import { useSyncExternalStore } from "react";

// Shared by every /design-* showcase route. [data-showcase="x"][data-theme="y"]
// in globals.css is a compound selector — both attributes have to be on the
// same element to match, so this mirrors the site's own data-theme (set on
// <html> by the pre-paint script and every theme toggle, including each
// route's own reused <ThemeToggle/>) onto the scoped wrapper. Same
// MutationObserver pattern as @/components/theme-toggle, so any toggle
// anywhere on the page updates this wrapper too, not just the button that
// fired it.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme") ?? "dark";
}

function getServerSnapshot() {
  return "dark";
}

export function ShowcaseThemeScope({
  showcase,
  className,
  children,
}: {
  showcase: string;
  className?: string;
  children: React.ReactNode;
}) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div data-showcase={showcase} data-theme={theme} className={className}>
      {children}
    </div>
  );
}
