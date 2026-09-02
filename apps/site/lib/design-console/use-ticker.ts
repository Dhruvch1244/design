"use client";

import * as React from "react";
import { schedule } from "@/lib/design-console/ticker";

/**
 * Bind a component to the shared scheduler in lib/ticker.ts.
 *
 * `run` is held in a ref so a caller can pass an inline closure without
 * re-registering the task on every render — re-registering would reset the
 * task's phase each time, which for the live tail means rows arriving on a
 * jittery, render-driven cadence instead of a steady one.
 */
export function useTicker(id: string, intervalMs: number, active: boolean, run: () => void) {
  const runRef = React.useRef(run);

  // Assigned in an effect, not in the render body. Mutating a ref during
  // render is a real hazard under concurrent rendering — a render React
  // discards would still have written the ref — and it is what the
  // `react-hooks/refs` rule flags.
  React.useEffect(() => {
    runRef.current = run;
  });

  React.useEffect(() => {
    if (!active) return;
    const handle = schedule(id, intervalMs, () => runRef.current());
    return () => handle.cancel();
  }, [id, intervalMs, active]);
}
