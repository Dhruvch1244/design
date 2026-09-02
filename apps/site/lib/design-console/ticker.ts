/**
 * The console's single scheduler for repeating background work.
 *
 * The philosophy's second pillar: the moment an app has more than one kind of
 * background work, decide *once* how it is queued, deduplicated and
 * cancelled, instead of letting each feature reach for its own setInterval.
 * This app has two such consumers already (the log live-tail, and the "41s
 * ago" relative timestamps that go stale if nothing re-renders), which is
 * exactly the point at which the second setInterval would have started
 * diverging from the first.
 *
 * Properties this buys, none of which are free with ad-hoc intervals:
 *   - one timer for the whole app regardless of subscriber count
 *   - the timer does not exist at all while nothing is subscribed, so an
 *     idle tab does no work
 *   - registering the same id twice replaces the first rather than running
 *     both, so a double-mount under StrictMode cannot double-tick
 *   - a paused task keeps its registration and its phase; it just does not
 *     fire, so pausing is not "unsubscribe and hope you resubscribe the same"
 *
 * No React import: this is a plain store, bound to React in hooks/use-ticker.ts.
 */

/** Base resolution. Every task's interval is quantised to a multiple of this. */
const RESOLUTION_MS = 250;

interface Task {
  intervalMs: number;
  run: () => void;
  nextDueAt: number;
  paused: boolean;
}

const tasks = new Map<string, Task>();
let timer: ReturnType<typeof setInterval> | null = null;

function pump() {
  const now = Date.now();
  for (const task of tasks.values()) {
    if (task.paused || now < task.nextDueAt) continue;
    // Re-anchor from `now`, not from nextDueAt: a backgrounded tab that
    // throttles timers would otherwise come back and fire a burst of catch-up
    // ticks, which for the live tail means dozens of rows arriving at once.
    task.nextDueAt = now + task.intervalMs;
    task.run();
  }
}

function ensureTimer() {
  const hasWork = [...tasks.values()].some((t) => !t.paused);
  if (hasWork && timer === null) {
    timer = setInterval(pump, RESOLUTION_MS);
  } else if (!hasWork && timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

export interface TickerHandle {
  /** Stop firing without losing the registration. */
  pause(): void;
  /** Resume, re-anchored to now rather than replaying missed ticks. */
  resume(): void;
  /** Remove the task entirely; the shared timer stops if it was the last one. */
  cancel(): void;
}

/**
 * Register a repeating task. Re-registering an existing `id` replaces it.
 *
 * @param id       Stable identity for the task — the dedup key.
 * @param intervalMs How often to run, rounded up to the scheduler resolution.
 * @param run      The work. Must be cheap; it runs on the main thread.
 * @param options  `startPaused` registers without firing until resume().
 */
export function schedule(
  id: string,
  intervalMs: number,
  run: () => void,
  options: { startPaused?: boolean } = {},
): TickerHandle {
  const quantised = Math.max(RESOLUTION_MS, Math.ceil(intervalMs / RESOLUTION_MS) * RESOLUTION_MS);
  const paused = options.startPaused ?? false;

  tasks.set(id, {
    intervalMs: quantised,
    run,
    nextDueAt: Date.now() + quantised,
    paused,
  });
  ensureTimer();

  return {
    pause() {
      const task = tasks.get(id);
      if (!task) return;
      task.paused = true;
      ensureTimer();
    },
    resume() {
      const task = tasks.get(id);
      if (!task) return;
      task.paused = false;
      task.nextDueAt = Date.now() + task.intervalMs;
      ensureTimer();
    },
    cancel() {
      tasks.delete(id);
      ensureTimer();
    },
  };
}
