/**
 * Halyard's data layer.
 *
 * Deliberately framework-free: nothing in this file imports React, Next, or
 * any component. That's the dsgn philosophy's first pillar made physical
 * rather than aspirational — the series math, the aggregation, and the
 * formatting can be unit-tested with no render harness, and a bad import
 * here shows up as an obviously wrong dependency direction rather than a
 * code-review comment.
 *
 * Every number below is invented sample data for a fictional product. It is
 * generated from a fixed seed rather than Math.random() for a correctness
 * reason, not a stylistic one: an unseeded generator produces different
 * values on the server render and the client hydration pass, which React
 * reports as a hydration mismatch and then silently re-renders around.
 */

export type Interval = "7d" | "30d" | "90d";

export interface SeriesPoint {
  /** ISO date, formatted server-side to avoid a timezone-dependent render. */
  date: string;
  /** Short axis label, e.g. "Mar 04". */
  label: string;
  sessions: number;
  activations: number;
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  /** Signed percentage change vs. the previous equivalent window. */
  delta: number;
  /** Whether a rising number is good. Error rate rising is not. */
  positiveIsUp: boolean;
  caption: string;
  /** Normalised 0..1 samples for the inline sparkline. */
  spark: number[];
}

export type EventHealth = "healthy" | "degraded" | "no-data";

export interface TrackedEvent {
  id: string;
  name: string;
  /** Dot-namespaced key as it arrives on the ingest API. */
  key: string;
  surface: string;
  owner: string;
  volume: number;
  conversion: number;
  p95Ms: number;
  health: EventHealth;
  lastSeen: string;
  description: string;
}

export interface SourceShare {
  name: string;
  sessions: number;
  share: number;
}

export interface Property {
  value: string;
  label: string;
}

/**
 * mulberry32 — 32-bit seeded PRNG, ~10 lines, no dependency. The philosophy's
 * "reach for the standard library before a dependency for anything small"
 * pillar: pulling a seedrandom package in for this would add a transitive
 * tree and an update cadence to something fully understood and frozen.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Fixed end date so the demo never drifts and never renders per-timezone. */
const WINDOW_END = Date.UTC(2026, 7, 28);
const DAY_MS = 86_400_000;

const INTERVAL_DAYS: Record<Interval, number> = { "7d": 7, "30d": 30, "90d": 90 };

function formatAxisDate(ms: number): string {
  const d = new Date(ms);
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}`;
}

function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * A weekly-seasonal series with a mild upward trend and bounded noise —
 * shaped to look like real product traffic (weekend troughs, a plateau) so
 * the chart reads as plausible rather than as a sine wave.
 */
export function buildSeries(interval: Interval, seed = 20260828): SeriesPoint[] {
  const days = INTERVAL_DAYS[interval];
  const rand = mulberry32(seed + days);
  const points: SeriesPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const ms = WINDOW_END - i * DAY_MS;
    const dayOfWeek = new Date(ms).getUTCDay();
    const weekend = dayOfWeek === 0 || dayOfWeek === 6 ? 0.68 : 1;
    const trend = 1 + (days - i) / (days * 3.4);
    const noise = 0.9 + rand() * 0.22;
    const sessions = Math.round(3_180 * weekend * trend * noise);
    const activations = Math.round(sessions * (0.17 + rand() * 0.05));
    points.push({ date: isoDate(ms), label: formatAxisDate(ms), sessions, activations });
  }

  return points;
}

/** Downsamples a series to n normalised 0..1 values for a sparkline path. */
function sparkline(points: SeriesPoint[], n = 16): number[] {
  const step = Math.max(1, Math.floor(points.length / n));
  const sampled = points.filter((_, i) => i % step === 0).slice(-n).map((p) => p.sessions);
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const span = max - min || 1;
  return sampled.map((v) => (v - min) / span);
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export function formatCount(value: number): string {
  return NUMBER_FORMAT.format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}k`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDelta(delta: number): string {
  return `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${Math.abs(delta).toFixed(1)}%`;
}

export function buildMetrics(interval: Interval): Metric[] {
  const points = buildSeries(interval, 20260828);
  const spark = sparkline(points);
  const totalSessions = points.reduce((sum, p) => sum + p.sessions, 0);
  const totalActivations = points.reduce((sum, p) => sum + p.activations, 0);
  const activationRate = (totalActivations / totalSessions) * 100;

  const deltaByInterval: Record<Interval, number[]> = {
    "7d": [4.2, 1.9, -6.4, 0.3],
    "30d": [11.8, 3.4, -12.1, -0.8],
    "90d": [26.5, 5.1, -18.7, 2.6],
  };
  const [sessionsDelta, activationDelta, latencyDelta, errorDelta] = deltaByInterval[interval];

  return [
    {
      id: "sessions",
      label: "Tracked sessions",
      value: formatCompact(totalSessions),
      delta: sessionsDelta,
      positiveIsUp: true,
      caption: `${formatCount(totalSessions)} over the last ${INTERVAL_DAYS[interval]} days`,
      spark,
    },
    {
      id: "activation",
      label: "Activation rate",
      value: formatPercent(activationRate),
      delta: activationDelta,
      positiveIsUp: true,
      caption: `${formatCount(totalActivations)} accounts reached first value`,
      spark: spark.map((v) => 0.25 + v * 0.6),
    },
    {
      id: "latency",
      label: "Ingest latency p95",
      value: "312 ms",
      delta: latencyDelta,
      positiveIsUp: false,
      caption: "Measured at the collector edge",
      spark: spark.map((v) => 0.85 - v * 0.55),
    },
    {
      id: "errors",
      label: "Rejected events",
      value: "0.42%",
      delta: errorDelta,
      positiveIsUp: false,
      caption: "Schema mismatches and stale keys",
      spark: spark.map((v) => 0.4 + (1 - v) * 0.3),
    },
  ];
}

export const PROPERTIES: Property[] = [
  { value: "web-app", label: "app.halyard.dev — Web app" },
  { value: "marketing", label: "halyard.dev — Marketing site" },
  { value: "docs", label: "docs.halyard.dev — Documentation" },
  { value: "ios", label: "Halyard for iOS" },
  { value: "android", label: "Halyard for Android" },
];

export const SOURCES: SourceShare[] = [
  { name: "Direct / SDK", sessions: 41_820, share: 46 },
  { name: "Organic search", sessions: 21_460, share: 24 },
  { name: "Documentation", sessions: 12_390, share: 14 },
  { name: "Referral", sessions: 8_140, share: 9 },
  { name: "Email digest", sessions: 6_310, share: 7 },
];

export const TRACKED_EVENTS: TrackedEvent[] = [
  {
    id: "evt-01",
    name: "Workspace created",
    key: "workspace.created",
    surface: "Web app",
    owner: "Growth",
    volume: 4_812,
    conversion: 68.4,
    p95Ms: 184,
    health: "healthy",
    lastSeen: "2 min ago",
    description:
      "Fires once per new workspace, after the first billing profile is attached. Deduplicated on workspace id.",
  },
  {
    id: "evt-02",
    name: "Source connected",
    key: "integration.source.connected",
    surface: "Web app",
    owner: "Platform",
    volume: 3_146,
    conversion: 54.1,
    p95Ms: 297,
    health: "healthy",
    lastSeen: "4 min ago",
    description:
      "Emitted when a warehouse or SDK source completes its first successful sync, not when the form is submitted.",
  },
  {
    id: "evt-03",
    name: "Report exported",
    key: "report.exported",
    surface: "Web app",
    owner: "Reporting",
    volume: 2_075,
    conversion: 31.8,
    p95Ms: 1_412,
    health: "degraded",
    lastSeen: "11 min ago",
    description:
      "CSV and Parquet exports share this event. The p95 is dominated by exports over 2M rows, which stream rather than buffer.",
  },
  {
    id: "evt-04",
    name: "Alert acknowledged",
    key: "alert.acknowledged",
    surface: "Web app",
    owner: "Reliability",
    volume: 1_694,
    conversion: 82.6,
    p95Ms: 141,
    health: "healthy",
    lastSeen: "18 min ago",
    description:
      "Records the acknowledging member and the time between threshold breach and acknowledgement.",
  },
  {
    id: "evt-05",
    name: "Funnel saved",
    key: "funnel.definition.saved",
    surface: "Web app",
    owner: "Reporting",
    volume: 1_208,
    conversion: 47.3,
    p95Ms: 226,
    health: "healthy",
    lastSeen: "26 min ago",
    description:
      "Saved definitions are versioned; this fires per revision, so a single funnel can emit many times in a session.",
  },
  {
    id: "evt-06",
    name: "Retention cohort viewed",
    key: "cohort.retention.viewed",
    surface: "Web app",
    owner: "Reporting",
    volume: 986,
    conversion: 22.9,
    p95Ms: 874,
    health: "degraded",
    lastSeen: "39 min ago",
    description:
      "Cohort queries above 12 weeks fall back to the cold path and are the reason this event's p95 sits high.",
  },
  {
    id: "evt-07",
    name: "Write key rotated",
    key: "security.write_key.rotated",
    surface: "API",
    owner: "Platform",
    volume: 412,
    conversion: 91.2,
    p95Ms: 98,
    health: "healthy",
    lastSeen: "1 hr ago",
    description:
      "Rotation invalidates the previous key after a 24-hour grace window. Both keys accept writes during the overlap.",
  },
  {
    id: "evt-08",
    name: "Mobile session started",
    key: "mobile.session.started",
    surface: "iOS / Android",
    owner: "Mobile",
    volume: 0,
    conversion: 0,
    p95Ms: 0,
    health: "no-data",
    lastSeen: "No events yet",
    description:
      "Declared in the schema registry but not yet emitted by a released build. Expected with the 4.2 mobile SDK.",
  },
];

export const HEALTH_LABEL: Record<EventHealth, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  "no-data": "No data",
};

/** Filters the event list the way the UI's controls describe, in one place. */
export function filterEvents(
  events: TrackedEvent[],
  options: { surfaces: string[]; minVolume: number; query: string },
): TrackedEvent[] {
  const query = options.query.trim().toLowerCase();
  return events.filter((event) => {
    if (options.surfaces.length > 0 && !options.surfaces.includes(event.owner)) return false;
    if (event.volume < options.minVolume) return false;
    if (query.length > 0) {
      const haystack = `${event.name} ${event.key} ${event.owner}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export const EVENT_OWNERS = ["Growth", "Platform", "Reporting", "Reliability", "Mobile"] as const;
