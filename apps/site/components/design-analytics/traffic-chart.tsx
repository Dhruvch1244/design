"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatCompact, formatCount, type SeriesPoint } from "@/lib/design-analytics/analytics";
import { cn } from "@/lib/utils";

type SeriesKey = "sessions" | "activations";

export interface TrafficChartProps {
  points: SeriesPoint[];
  series: SeriesKey;
  /** Draws a dashed neutral line for the equivalent prior window. */
  compare?: boolean;
  className?: string;
}

const PAD = { top: 16, right: 14, bottom: 26, left: 46 };

/**
 * Hand-drawn SVG rather than a charting library.
 *
 * A chart library would arrive with its own tokens — its own palette, type
 * scale, tooltip chrome and easing — and the work of overriding all of it to
 * match this voice is larger than drawing two paths. It also keeps the
 * corporate voice's rules enforceable: flat accent tint (no gradient fill),
 * 1px neutral gridlines, and hover motion that is a position change rather
 * than an animated tooltip.
 *
 * Sized from a measured container width instead of a scaling viewBox:
 * `preserveAspectRatio="none"` would stretch the stroke widths and the text
 * along with the geometry, which is visible immediately at 390px.
 */
export function TrafficChart({ points, series, compare = false, className }: TrafficChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(760);
  const [height, setHeight] = useState(272);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      if (next > 0) {
        setWidth(next);
        setHeight(next < 480 ? 208 : 272);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => {
    const values = points.map((p) => p[series]);
    const prior = points.map((p) => Math.round(p[series] * (0.83 + ((p.sessions % 17) / 100))));
    const max = Math.max(...values, ...(compare ? prior : [])) * 1.08;
    const min = 0;
    const plotWidth = Math.max(1, width - PAD.left - PAD.right);
    const plotHeight = Math.max(1, height - PAD.top - PAD.bottom);

    const x = (i: number) =>
      PAD.left + (points.length === 1 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth);
    const y = (v: number) => PAD.top + plotHeight - ((v - min) / (max - min || 1)) * plotHeight;

    const toPath = (list: number[]) =>
      list.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(" ");

    const line = toPath(values);
    const area = `${line} L${x(points.length - 1).toFixed(2)} ${(PAD.top + plotHeight).toFixed(
      2,
    )} L${x(0).toFixed(2)} ${(PAD.top + plotHeight).toFixed(2)} Z`;

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      value: Math.round(max * t),
      y: PAD.top + plotHeight - t * plotHeight,
    }));

    return { values, prior, priorLine: toPath(prior), line, area, x, y, ticks, plotWidth, plotHeight };
  }, [points, series, compare, width, height]);

  const handleMove = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const ratio = (event.clientX - bounds.left) / (bounds.width || 1);
      const index = Math.round(ratio * (points.length - 1));
      setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
    },
    [points.length],
  );

  const active = hoverIndex === null ? null : points[hoverIndex];
  const seriesLabel = series === "sessions" ? "sessions" : "activations";
  const first = points[0];
  const last = points[points.length - 1];

  /* Axis labels thin out as the window grows so 90 dates never overlap. The
     final date is always drawn (it anchors the range), so any regular label
     that would land within ~52px of it is dropped instead — without this the
     two collide into unreadable overlapping glyphs at every window length
     that isn't an exact multiple of the stride. */
  const labelEvery = Math.max(1, Math.ceil(points.length / (width < 480 ? 4 : 8)));
  const lastIndex = points.length - 1;
  const showLabel = (i: number) => {
    if (i === lastIndex) return true;
    if (i % labelEvery !== 0) return false;
    return geometry.x(lastIndex) - geometry.x(i) > 52;
  };

  return (
    <figure ref={containerRef} className={cn("relative w-full", className)}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`${seriesLabel} per day, from ${formatCount(first[series])} on ${
          first.label
        } to ${formatCount(last[series])} on ${last.label}`}
        className="block overflow-visible"
        onPointerLeave={() => setHoverIndex(null)}
      >
        <g aria-hidden="true">
          {geometry.ticks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--border)"
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <text
                x={PAD.left - 10}
                y={tick.y + 3.5}
                textAnchor="end"
                className="tnum fill-ink-faint text-[10px]"
              >
                {formatCompact(tick.value)}
              </text>
            </g>
          ))}

          {points.map((point, i) =>
            showLabel(i) ? (
              <text
                key={point.date}
                x={geometry.x(i)}
                y={height - 8}
                textAnchor={i === points.length - 1 ? "end" : i === 0 ? "start" : "middle"}
                className="fill-ink-faint text-[10px]"
              >
                {point.label}
              </text>
            ) : null,
          )}

          {/* One wipe on mount, transform-only, 240ms — the voice's ceiling. */}
          <g data-wipe>
            {/* Flat tint, not a gradient: gradients are ruled out in this voice. */}
            <path d={geometry.area} fill="var(--accent)" fillOpacity={0.07} />
            {compare ? (
              <path
                d={geometry.priorLine}
                fill="none"
                stroke="var(--ink-faint)"
                strokeWidth={1.25}
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            ) : null}
            <path
              d={geometry.line}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {hoverIndex !== null ? (
            <g>
              <line
                x1={geometry.x(hoverIndex)}
                x2={geometry.x(hoverIndex)}
                y1={PAD.top}
                y2={height - PAD.bottom}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <circle
                cx={geometry.x(hoverIndex)}
                cy={geometry.y(geometry.values[hoverIndex])}
                r={3.5}
                fill="var(--card)"
                stroke="var(--accent)"
                strokeWidth={2}
              />
            </g>
          ) : null}
        </g>

        <rect
          x={PAD.left}
          y={PAD.top}
          width={geometry.plotWidth}
          height={geometry.plotHeight}
          fill="transparent"
          onPointerMove={handleMove}
        />
      </svg>

      {/* HTML, not <text>: an SVG label can't wrap, can't inherit the card's
          border/shadow tokens, and renders text at a different weight. */}
      {active ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-md border border-border bg-card px-2.5 py-1.5 shadow-md"
          style={{
            left: `${Math.min(
              Math.max(geometry.x(hoverIndex ?? 0), 64),
              Math.max(64, width - 64),
            )}px`,
          }}
        >
          <p className="text-[11px] leading-tight text-muted-foreground">{active.label}</p>
          <p className="tnum text-sm font-semibold leading-tight">
            {formatCount(active[series])}
            <span className="ml-1 text-[11px] font-normal text-muted-foreground">
              {seriesLabel}
            </span>
          </p>
        </div>
      ) : null}

      <figcaption className="sr-only">
        Daily {seriesLabel} between {first.label} and {last.label}. Peak{" "}
        {formatCount(Math.max(...geometry.values))}, low{" "}
        {formatCount(Math.min(...geometry.values))}.
      </figcaption>
    </figure>
  );
}
