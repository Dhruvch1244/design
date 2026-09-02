"use client";

import * as React from "react";
import { ERROR_SERIES, TRAFFIC_SERIES } from "@/lib/design-console/console";
import { cn } from "@/lib/utils";

/**
 * 24h request volume with the error-rate overlay, drawn by hand in SVG.
 *
 * No charting library: this is one series plus one overlay on a fixed
 * viewBox, which is the size/maintenance test the philosophy's std-first rule
 * asks for. Recharts or visx would be several hundred kB and a version
 * treadmill for ~40 lines of path math.
 *
 * The chart is `preserveAspectRatio="none"` over a fixed viewBox so it scales
 * to any container width without recalculating on resize — no ResizeObserver,
 * no layout thrash while the log tail is also updating. Stroke widths are
 * given in `vector-effect: non-scaling-stroke` so they stay 1.5px rather than
 * stretching with the box.
 */

const W = 720;
const H = 200;
const PAD_Y = 14;

function toPoints(series: number[], max: number) {
  const step = W / (series.length - 1);
  return series.map((value, i) => {
    const x = i * step;
    const y = H - PAD_Y - (value / max) * (H - PAD_Y * 2);
    return [x, y] as const;
  });
}

/** Catmull-Rom -> cubic bezier. Smooths without overshooting below zero,
 *  which a naive quadratic smoothing does on the error series' spike. */
function smoothPath(points: ReadonlyArray<readonly [number, number]>) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

export function TrafficChart({ className }: { className?: string }) {
  const trafficMax = Math.max(...TRAFFIC_SERIES) * 1.12;
  const errorMax = Math.max(...ERROR_SERIES) * 1.35;

  const trafficPoints = toPoints(TRAFFIC_SERIES, trafficMax);
  const errorPoints = toPoints(ERROR_SERIES, errorMax);

  const trafficLine = smoothPath(trafficPoints);
  const areaPath = `${trafficLine} L ${W} ${H} L 0 ${H} Z`;
  const errorLine = smoothPath(errorPoints);

  const peakIndex = ERROR_SERIES.indexOf(Math.max(...ERROR_SERIES));
  const peak = errorPoints[peakIndex];

  return (
    <figure className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Requests per hour over the last 24 hours, peaking at 152 thousand, with the non-2xx rate overlaid; the error rate spiked to 1.42 percent 12 hours ago."
        className="h-[180px] w-full sm:h-[220px]"
      >
        <defs>
          <linearGradient id="vg-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.38" />
            <stop offset="55%" stopColor="var(--cyan)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vg-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--violet)" />
            <stop offset="55%" stopColor="var(--cyan)" />
            <stop offset="100%" stopColor="var(--cyan)" />
          </linearGradient>
          {/* The glow is a blurred copy of the stroke behind the crisp one,
              not a filter on the stroke itself — a feGaussianBlur applied to
              the visible path softens the line the user is trying to read. */}
          <filter id="vg-blur" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Horizontal rules. Drawn under everything and kept faint enough
            that they never compete with the series. */}
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1="0"
            x2={W}
            y1={PAD_Y + fraction * (H - PAD_Y * 2)}
            y2={PAD_Y + fraction * (H - PAD_Y * 2)}
            stroke="var(--rule)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity="0.55"
          />
        ))}

        <path d={areaPath} fill="url(#vg-area)" />
        <path
          d={trafficLine}
          fill="none"
          stroke="url(#vg-stroke)"
          strokeWidth="6"
          vectorEffect="non-scaling-stroke"
          filter="url(#vg-blur)"
          opacity="0.55"
        />
        <path
          d={trafficLine}
          fill="none"
          stroke="url(#vg-stroke)"
          strokeWidth="1.75"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />

        <path
          d={errorLine}
          fill="none"
          stroke="var(--magenta)"
          strokeWidth="1.25"
          strokeDasharray="3 4"
          vectorEffect="non-scaling-stroke"
          opacity="0.85"
        />
        <circle cx={peak[0]} cy={peak[1]} r="3" fill="var(--magenta)" />
        <circle cx={peak[0]} cy={peak[1]} r="7" fill="var(--magenta)" opacity="0.25" />
      </svg>

      {/* Axis labels sit outside the SVG so they never stretch with
          preserveAspectRatio="none". */}
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-ink-faint">
        <span>24h ago</span>
        <span className="hidden sm:inline">12h</span>
        <span>now</span>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-px w-4 bg-cyan shadow-[0_0_8px_var(--cyan)]" />
          Requests / hour
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-magenta" />
          Non-2xx rate
        </span>
        <span className="text-ink-faint">Peak 1.42% at 21:00 UTC — eu-west-1 upstream</span>
      </figcaption>
    </figure>
  );
}

/**
 * Tiny inline sparkline for the metric cards. Same non-scaling-stroke trick;
 * aria-hidden because the card already states the value and the delta in
 * text, and a screen reader reading sixteen numbers adds nothing.
 */
export function Sparkline({ points, tone }: { points: number[]; tone: "up" | "down" | "flat" }) {
  const max = Math.max(...points) * 1.1;
  const path = smoothPath(toPoints(points, max));
  const stroke =
    tone === "up" ? "var(--cyan)" : tone === "down" ? "var(--signal-bad)" : "var(--ink-faint)";
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className="h-8 w-full"
    >
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}
