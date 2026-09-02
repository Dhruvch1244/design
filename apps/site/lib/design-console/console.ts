/**
 * VOLTGATE console data layer.
 *
 * Imports nothing from React, Next, or any component — the physical
 * separation the dsgn philosophy's first pillar asks for, enforced by the
 * fact that a bad import here would be visible in one file rather than
 * spread across a feature folder.
 *
 * Everything is a fixed snapshot rather than generated at render time. A
 * `Math.random()` or a `Date.now()` evaluated during render would produce a
 * different tree on the server than on the client and hydrate with a
 * mismatch, so both the seed data and the synthetic live-tail rows below are
 * deterministic and anchored to SNAPSHOT_AT.
 */

/** Fixed clock for the whole demo. Every relative timestamp is computed
 *  against this, so nothing in the UI depends on the wall clock. */
export const SNAPSHOT_AT = Date.parse("2026-03-14T09:41:00Z");

export type Environment = "production" | "staging";

export interface Project {
  id: string;
  name: string;
  slug: string;
  region: string;
}

export const ORGANIZATION = "Redshift Interactive";

export const PROJECTS: Project[] = [
  { id: "prj_h3l", name: "helios-edge", slug: "helios-edge", region: "global" },
  { id: "prj_c4r", name: "carbide-auth", slug: "carbide-auth", region: "eu-west" },
  { id: "prj_v9x", name: "vector-mesh", slug: "vector-mesh", region: "us-east" },
];

/* -------------------------------------------------------------------------
 * API keys
 * ---------------------------------------------------------------------- */

export type KeyStatus = "active" | "revoked";

export interface ApiKey {
  id: string;
  label: string;
  /** Public prefix — the part that is safe to show unmasked, always. */
  prefix: string;
  /** The remainder. Real products never store this; here it exists so the
   *  reveal interaction has something honest to reveal. */
  secret: string;
  environment: Environment;
  scopes: string[];
  createdAt: number;
  lastUsedAt: number | null;
  createdBy: string;
  status: KeyStatus;
  /** Requests in the last 24h attributed to this key. */
  requests24h: number;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const API_KEYS: ApiKey[] = [
  {
    id: "key_01",
    label: "Matchmaking service",
    prefix: "vg_live_7QF2",
    secret: "kR8nZp3xLd06WvTqYb1Ac5Me",
    environment: "production",
    scopes: ["sessions:write", "sessions:read", "players:read"],
    createdAt: SNAPSHOT_AT - 214 * DAY,
    lastUsedAt: SNAPSHOT_AT - 41_000,
    createdBy: "M. Okonkwo",
    status: "active",
    requests24h: 1_284_402,
  },
  {
    id: "key_02",
    label: "Telemetry ingest",
    prefix: "vg_live_D4KX",
    secret: "9tJhV2sNqW7bRzUe0LpAmC3f",
    environment: "production",
    scopes: ["events:write"],
    createdAt: SNAPSHOT_AT - 188 * DAY,
    lastUsedAt: SNAPSHOT_AT - 3_000,
    createdBy: "M. Okonkwo",
    status: "active",
    requests24h: 903_117,
  },
  {
    id: "key_03",
    label: "Storefront (web)",
    prefix: "vg_live_B1MC",
    secret: "Xq4dFy8vNe2TrPk6ZaWuJh0S",
    environment: "production",
    scopes: ["catalog:read", "orders:write", "orders:read"],
    createdAt: SNAPSHOT_AT - 96 * DAY,
    lastUsedAt: SNAPSHOT_AT - 12 * 60_000,
    createdBy: "P. Ravensworth",
    status: "active",
    requests24h: 148_930,
  },
  {
    id: "key_04",
    label: "Build agent — CI",
    prefix: "vg_test_R7VN",
    secret: "0mBcLs5wYt3JgQx9DhKfEa2P",
    environment: "staging",
    scopes: ["sessions:write", "events:write", "flags:read"],
    createdAt: SNAPSHOT_AT - 61 * DAY,
    lastUsedAt: SNAPSHOT_AT - 4 * HOUR,
    createdBy: "CI (automation)",
    status: "active",
    requests24h: 21_884,
  },
  {
    id: "key_05",
    label: "Load-test harness",
    prefix: "vg_test_M0PA",
    secret: "Uw6RzKn1QcVi4TyBjEo8Xs2L",
    environment: "staging",
    scopes: ["sessions:write"],
    createdAt: SNAPSHOT_AT - 33 * DAY,
    lastUsedAt: SNAPSHOT_AT - 9 * DAY,
    createdBy: "A. Delacroix",
    status: "active",
    requests24h: 0,
  },
  {
    id: "key_06",
    label: "Legacy launcher",
    prefix: "vg_live_ZZ8T",
    secret: "Ld3PqXn7Ka0RcWv5BmZuTi9E",
    environment: "production",
    scopes: ["sessions:read"],
    createdAt: SNAPSHOT_AT - 402 * DAY,
    lastUsedAt: SNAPSHOT_AT - 51 * DAY,
    createdBy: "M. Okonkwo",
    status: "revoked",
    requests24h: 0,
  },
];

export const AVAILABLE_SCOPES = [
  { value: "sessions:read", label: "sessions:read", detail: "Read match sessions" },
  { value: "sessions:write", label: "sessions:write", detail: "Create and close sessions" },
  { value: "players:read", label: "players:read", detail: "Read player profiles" },
  { value: "events:write", label: "events:write", detail: "Publish telemetry events" },
  { value: "catalog:read", label: "catalog:read", detail: "Read the storefront catalog" },
  { value: "orders:write", label: "orders:write", detail: "Create and refund orders" },
  { value: "flags:read", label: "flags:read", detail: "Evaluate feature flags" },
] as const;

/* -------------------------------------------------------------------------
 * Webhooks
 * ---------------------------------------------------------------------- */

export interface WebhookEndpoint {
  id: string;
  url: string;
  environment: Environment;
  events: string[];
  enabled: boolean;
  /** 0–100, last 24h. */
  successRate: number;
  deliveries24h: number;
  createdAt: number;
}

export const WEBHOOK_ENDPOINTS: WebhookEndpoint[] = [
  {
    id: "wh_01",
    url: "https://hooks.redshift-interactive.dev/voltgate/session-events",
    environment: "production",
    events: ["session.started", "session.ended", "session.abandoned"],
    enabled: true,
    successRate: 99.8,
    deliveries24h: 41_902,
    createdAt: SNAPSHOT_AT - 190 * DAY,
  },
  {
    id: "wh_02",
    url: "https://hooks.redshift-interactive.dev/voltgate/commerce",
    environment: "production",
    events: ["order.paid", "order.refunded", "entitlement.granted"],
    enabled: true,
    successRate: 91.2,
    deliveries24h: 6_118,
    createdAt: SNAPSHOT_AT - 88 * DAY,
  },
  {
    id: "wh_03",
    url: "https://ops.redshift-interactive.dev/paging/voltgate-alerts",
    environment: "production",
    events: ["quota.threshold", "key.revoked"],
    enabled: false,
    successRate: 0,
    deliveries24h: 0,
    createdAt: SNAPSHOT_AT - 12 * DAY,
  },
];

export type DeliveryOutcome = "delivered" | "failed" | "pending";

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: string;
  outcome: DeliveryOutcome;
  statusCode: number | null;
  attempt: number;
  maxAttempts: number;
  durationMs: number;
  at: number;
  requestBody: string;
  responseBody: string;
  responseHeaders: Array<[string, string]>;
}

export const WEBHOOK_DELIVERIES: WebhookDelivery[] = [
  {
    id: "dlv_9f31c",
    endpointId: "wh_01",
    event: "session.ended",
    outcome: "delivered",
    statusCode: 200,
    attempt: 1,
    maxAttempts: 5,
    durationMs: 84,
    at: SNAPSHOT_AT - 22_000,
    requestBody:
      '{\n  "id": "evt_2Kd91xQ",\n  "type": "session.ended",\n  "created": 1773481238,\n  "data": {\n    "session_id": "ses_8Hq2Lm",\n    "players": 12,\n    "duration_s": 1844,\n    "region": "eu-west-1"\n  }\n}',
    responseBody: '{"received":true}',
    responseHeaders: [
      ["content-type", "application/json"],
      ["x-request-id", "req_c81f0a4e"],
    ],
  },
  {
    id: "dlv_9f2ea",
    endpointId: "wh_02",
    event: "order.paid",
    outcome: "failed",
    statusCode: 502,
    attempt: 3,
    maxAttempts: 5,
    durationMs: 30_012,
    at: SNAPSHOT_AT - 4 * 60_000,
    requestBody:
      '{\n  "id": "evt_2Kd8vRt",\n  "type": "order.paid",\n  "created": 1773481012,\n  "data": {\n    "order_id": "ord_44QxZ",\n    "amount": 2499,\n    "currency": "usd",\n    "sku": "helios-season-04"\n  }\n}',
    responseBody: "<html><head><title>502 Bad Gateway</title></head>\n<body>\n<center><h1>502 Bad Gateway</h1></center>\n</body></html>",
    responseHeaders: [
      ["content-type", "text/html"],
      ["retry-after", "30"],
    ],
  },
  {
    id: "dlv_9f2c7",
    endpointId: "wh_01",
    event: "session.started",
    outcome: "delivered",
    statusCode: 200,
    attempt: 1,
    maxAttempts: 5,
    durationMs: 61,
    at: SNAPSHOT_AT - 6 * 60_000,
    requestBody:
      '{\n  "id": "evt_2Kd8pLm",\n  "type": "session.started",\n  "created": 1773480881,\n  "data": {\n    "session_id": "ses_8Hq2Lm",\n    "playlist": "ranked-duo",\n    "region": "eu-west-1"\n  }\n}',
    responseBody: '{"received":true}',
    responseHeaders: [
      ["content-type", "application/json"],
      ["x-request-id", "req_bb02f1d9"],
    ],
  },
  {
    id: "dlv_9f2b0",
    endpointId: "wh_02",
    event: "order.refunded",
    outcome: "pending",
    statusCode: null,
    attempt: 2,
    maxAttempts: 5,
    durationMs: 0,
    at: SNAPSHOT_AT - 9 * 60_000,
    requestBody:
      '{\n  "id": "evt_2Kd8k2C",\n  "type": "order.refunded",\n  "created": 1773480702,\n  "data": {\n    "order_id": "ord_44Qwz",\n    "amount": 1299,\n    "reason": "requested_by_customer"\n  }\n}',
    responseBody: "",
    responseHeaders: [],
  },
  {
    id: "dlv_9f298",
    endpointId: "wh_02",
    event: "entitlement.granted",
    outcome: "failed",
    statusCode: 422,
    attempt: 5,
    maxAttempts: 5,
    durationMs: 143,
    at: SNAPSHOT_AT - 27 * 60_000,
    requestBody:
      '{\n  "id": "evt_2Kd7wQa",\n  "type": "entitlement.granted",\n  "created": 1773479620,\n  "data": {\n    "player_id": "plr_Rn18Ty",\n    "entitlement": "helios-season-04",\n    "source": "purchase"\n  }\n}',
    responseBody: '{"error":{"code":"unknown_entitlement","message":"No entitlement matching \\"helios-season-04\\""}}',
    responseHeaders: [
      ["content-type", "application/json"],
      ["x-request-id", "req_1a7cc330"],
    ],
  },
  {
    id: "dlv_9f244",
    endpointId: "wh_01",
    event: "session.abandoned",
    outcome: "delivered",
    statusCode: 202,
    attempt: 2,
    maxAttempts: 5,
    durationMs: 512,
    at: SNAPSHOT_AT - 63 * 60_000,
    requestBody:
      '{\n  "id": "evt_2Kd6bNv",\n  "type": "session.abandoned",\n  "created": 1773477460,\n  "data": {\n    "session_id": "ses_8Hp0Cz",\n    "reason": "host_timeout"\n  }\n}',
    responseBody: '{"received":true,"queued":true}',
    responseHeaders: [
      ["content-type", "application/json"],
      ["x-request-id", "req_5d0f8b12"],
    ],
  },
];

/* -------------------------------------------------------------------------
 * Request logs
 * ---------------------------------------------------------------------- */

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestLog {
  id: string;
  method: HttpMethod;
  path: string;
  status: number;
  durationMs: number;
  region: string;
  keyPrefix: string;
  at: number;
  ip: string;
  userAgent: string;
  /** Present only on 4xx/5xx — the honest reason, not a generic string. */
  error?: string;
}

/**
 * Deterministic 32-bit LCG. Ten lines and no maintenance surface, which is
 * the std-first test from the philosophy's dependency rule — a seeded-random
 * package would be a transitive tree for this.
 */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1_664_525 + 1_013_904_223) >>> 0;
    return s / 4_294_967_296;
  };
}

const LOG_ROUTES: Array<{ method: HttpMethod; path: string; weight: number }> = [
  { method: "POST", path: "/v1/sessions", weight: 24 },
  { method: "GET", path: "/v1/sessions/:id", weight: 20 },
  { method: "POST", path: "/v1/events/batch", weight: 18 },
  { method: "GET", path: "/v1/players/:id/profile", weight: 12 },
  { method: "GET", path: "/v1/catalog", weight: 9 },
  { method: "POST", path: "/v1/orders", weight: 6 },
  { method: "PATCH", path: "/v1/sessions/:id/roster", weight: 5 },
  { method: "GET", path: "/v1/flags/evaluate", weight: 4 },
  { method: "DELETE", path: "/v1/sessions/:id", weight: 2 },
];

const REGIONS = ["eu-west-1", "us-east-1", "us-west-2", "ap-south-1", "sa-east-1"];

const ERRORS: Record<number, string> = {
  401: "Signature does not match the key prefix presented",
  403: "Key is missing scope orders:write",
  404: "No session matching ses_8Hq2Lm in this environment",
  409: "Roster version 14 is stale; current is 17",
  422: "Field players[3].platform is not one of: pc, console, mobile",
  429: "Rate limit of 12,000 req/min exceeded for this key",
  500: "Upstream matchmaker returned an unparseable frame",
  502: "Origin closed the connection before responding",
  504: "Region ap-south-1 exceeded the 30s upstream deadline",
};

function pickRoute(r: number) {
  const total = LOG_ROUTES.reduce((sum, route) => sum + route.weight, 0);
  let cursor = r * total;
  for (const route of LOG_ROUTES) {
    cursor -= route.weight;
    if (cursor <= 0) return route;
  }
  return LOG_ROUTES[0];
}

function pickStatus(r: number, method: HttpMethod): number {
  if (r > 0.955) return [500, 502, 504][Math.floor(r * 1000) % 3];
  if (r > 0.88) return [401, 403, 404, 409, 422, 429][Math.floor(r * 1000) % 6];
  if (r > 0.855) return 304;
  return method === "POST" ? 201 : 200;
}

function buildLog(index: number, rand: () => number, at: number): RequestLog {
  const route = pickRoute(rand());
  const status = pickStatus(rand(), route.method);
  const slow = status >= 500 || rand() > 0.97;
  const durationMs = slow
    ? 900 + Math.floor(rand() * 29_000)
    : 8 + Math.floor(rand() * 240);
  const activeKeys = API_KEYS.filter((k) => k.status === "active");
  return {
    id: `req_${(0x2c0000 + index * 977).toString(16)}`,
    method: route.method,
    path: route.path,
    status,
    durationMs,
    region: REGIONS[Math.floor(rand() * REGIONS.length)],
    keyPrefix: activeKeys[Math.floor(rand() * activeKeys.length)].prefix,
    at,
    // +1 on the trailing octets: without it index 0 renders 18.0.0.0, which
    // is technically valid and reads to any engineer as "the fixture
    // generator was never finished".
    ip: `${18 + (index % 190)}.${((index * 7) % 250) + 1}.${((index * 31) % 250) + 1}.${((index * 13) % 250) + 1}`,
    userAgent:
      index % 3 === 0
        ? "voltgate-go/1.9.2 (linux; amd64)"
        : index % 3 === 1
          ? "voltgate-node/2.4.0"
          : "HeliosClient/4.18.1 (PS5)",
    error: status >= 400 ? ERRORS[status] : undefined,
  };
}

/** 96 rows, newest first, spaced ~9s apart back from the snapshot. */
export const REQUEST_LOGS: RequestLog[] = (() => {
  const rand = lcg(0x5eed_1234);
  return Array.from({ length: 96 }, (_, i) =>
    buildLog(i, rand, SNAPSHOT_AT - i * 9_400 - 1_200),
  );
})();

/**
 * Synthetic rows for the live-tail toggle. Pre-generated from a separate
 * seed rather than produced on each tick, so the tail is reproducible and a
 * screenshot taken twice looks the same twice.
 */
export const LIVE_TAIL_QUEUE: RequestLog[] = (() => {
  const rand = lcg(0xbeef_7a21);
  return Array.from({ length: 40 }, (_, i) => ({
    ...buildLog(1000 + i, rand, SNAPSHOT_AT + (i + 1) * 1_800),
    id: `req_tail_${i}`,
  }));
})();

/* -------------------------------------------------------------------------
 * Feature flags
 * ---------------------------------------------------------------------- */

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  group: string;
  enabled: Record<Environment, boolean>;
  /** Percentage of eligible traffic when enabled. */
  rollout: number;
  updatedAt: number;
  updatedBy: string;
  /** How many services read this flag — the thing that makes a toggle scary. */
  consumers: number;
}

export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: "matchmaking.skill_bands_v3",
    name: "Skill bands v3",
    description: "Replaces the fixed MMR buckets with continuous skill bands during queueing.",
    group: "Matchmaking",
    enabled: { production: true, staging: true },
    rollout: 35,
    updatedAt: SNAPSHOT_AT - 2 * DAY,
    updatedBy: "A. Delacroix",
    consumers: 4,
  },
  {
    key: "matchmaking.cross_region_fallback",
    name: "Cross-region fallback",
    description: "Allows a queue to spill into an adjacent region after 45s with no match.",
    group: "Matchmaking",
    enabled: { production: false, staging: true },
    rollout: 100,
    updatedAt: SNAPSHOT_AT - 6 * HOUR,
    updatedBy: "A. Delacroix",
    consumers: 2,
  },
  {
    key: "edge.brotli_response_encoding",
    name: "Brotli response encoding",
    description: "Compresses JSON responses over 4 KB at the edge instead of at the origin.",
    group: "Edge",
    enabled: { production: true, staging: true },
    rollout: 100,
    updatedAt: SNAPSHOT_AT - 19 * DAY,
    updatedBy: "M. Okonkwo",
    consumers: 9,
  },
  {
    key: "edge.request_coalescing",
    name: "Request coalescing",
    description: "Collapses identical in-flight GETs per region into a single upstream call.",
    group: "Edge",
    enabled: { production: false, staging: false },
    rollout: 10,
    updatedAt: SNAPSHOT_AT - 31 * DAY,
    updatedBy: "M. Okonkwo",
    consumers: 6,
  },
  {
    key: "commerce.deferred_entitlements",
    name: "Deferred entitlements",
    description: "Grants entitlements from a queue instead of inline with the payment call.",
    group: "Commerce",
    enabled: { production: true, staging: true },
    rollout: 70,
    updatedAt: SNAPSHOT_AT - 4 * DAY,
    updatedBy: "P. Ravensworth",
    consumers: 3,
  },
  {
    key: "commerce.regional_pricing_v2",
    name: "Regional pricing v2",
    description: "Sources price tiers from the pricing service rather than the static table.",
    group: "Commerce",
    enabled: { production: false, staging: true },
    rollout: 100,
    updatedAt: SNAPSHOT_AT - 11 * HOUR,
    updatedBy: "P. Ravensworth",
    consumers: 5,
  },
];

/* -------------------------------------------------------------------------
 * Overview metrics
 * ---------------------------------------------------------------------- */

export interface Metric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  /** Percent change vs. the previous equivalent window. */
  delta: number;
  /** Whether an increase in this metric is a good thing. */
  higherIsBetter: boolean;
  note: string;
  spark: number[];
}

export const METRICS: Metric[] = [
  {
    id: "requests",
    label: "Requests",
    value: "2.41",
    unit: "M",
    delta: 8.4,
    higherIsBetter: true,
    note: "vs. 2.22M in the previous 24h",
    spark: [42, 38, 44, 51, 47, 59, 64, 58, 71, 68, 74, 82, 78, 91, 88, 96],
  },
  {
    id: "latency",
    label: "p99 latency",
    value: "184",
    unit: "ms",
    delta: 12.1,
    higherIsBetter: false,
    note: "eu-west-1 is carrying the regression",
    spark: [61, 58, 63, 60, 66, 64, 71, 69, 78, 74, 83, 88, 92, 90, 97, 94],
  },
  {
    id: "errors",
    label: "Error rate",
    value: "0.42",
    unit: "%",
    delta: -3.6,
    higherIsBetter: false,
    note: "9,984 non-2xx of 2.41M",
    spark: [72, 68, 74, 61, 66, 58, 62, 55, 51, 57, 48, 44, 47, 41, 38, 40],
  },
  {
    id: "keys",
    label: "Active keys",
    value: "5",
    delta: 0,
    higherIsBetter: true,
    note: "1 revoked in the last 30 days",
    spark: [50, 50, 50, 50, 66, 66, 66, 66, 66, 66, 83, 83, 83, 83, 83, 83],
  },
];

/** Hourly request volume for the last 24h, in thousands. Index 0 = 24h ago. */
export const TRAFFIC_SERIES: number[] = [
  61, 54, 47, 43, 39, 41, 52, 68, 84, 97, 112, 121, 118, 126, 133, 129, 141,
  152, 147, 138, 129, 118, 104, 88,
];

/** Same window, share of requests that were non-2xx, in percent. */
export const ERROR_SERIES: number[] = [
  0.31, 0.28, 0.3, 0.29, 0.33, 0.3, 0.36, 0.41, 0.38, 0.44, 0.52, 0.61, 1.42,
  1.18, 0.74, 0.55, 0.48, 0.44, 0.4, 0.39, 0.42, 0.37, 0.35, 0.34,
];

export interface RegionRow {
  region: string;
  share: number;
  p50: number;
  p99: number;
  errorRate: number;
}

export const REGION_ROWS: RegionRow[] = [
  { region: "eu-west-1", share: 38.2, p50: 41, p99: 312, errorRate: 0.71 },
  { region: "us-east-1", share: 29.4, p50: 34, p99: 148, errorRate: 0.28 },
  { region: "us-west-2", share: 16.1, p50: 37, p99: 161, errorRate: 0.31 },
  { region: "ap-south-1", share: 11.8, p50: 62, p99: 244, errorRate: 0.44 },
  { region: "sa-east-1", share: 4.5, p50: 58, p99: 209, errorRate: 0.39 },
];

/** Requests included in the current billing cycle. */
export const QUOTA = {
  used: 41_280_000,
  included: 60_000_000,
  cycleEndsAt: SNAPSHOT_AT + 17 * DAY,
  overageRate: "$0.28 / 100k",
};
