"use client";

import { useApplyStoredAccent } from "@/lib/design-social/accent";

// Renders nothing — just runs the on-mount localStorage → DOM sync this
// route uses in place of the standalone build's pre-paint <head> script
// (which can't run here; see lib/design-social/accent.ts).
export function AccentBootstrap() {
  useApplyStoredAccent();
  return null;
}
