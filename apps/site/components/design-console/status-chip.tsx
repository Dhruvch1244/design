import * as React from "react";
import { Badge } from "@/components/dsgn/badge";
import { statusClass, type StatusClass } from "@/lib/design-console/format";
import { cn } from "@/lib/utils";

/**
 * Status colour, in one place.
 *
 * The registry's Badge ships five variants — primary / secondary / accent /
 * outline / destructive — and deliberately has no opinion on "success" or
 * "warning", because a generic registry shouldn't. A console does: a 2xx and
 * a 502 are not the same event and must not be the same colour.
 *
 * So this composes `variant="outline"` and re-tints via className rather than
 * adding a variant to badge.tsx. Two reasons that's the right call and not
 * laziness: `dsgn diff badge` stays clean so a future `dsgn update` can never
 * clobber it, and the status palette stays legible as one table here instead
 * of being spread through a CVA config.
 *
 * Colour is never the only signal — every chip carries its own text (the code
 * or the word), so the meaning survives a monochrome screenshot and any form
 * of colour blindness.
 */
const TONE: Record<StatusClass, string> = {
  ok: "border-signal-ok/35 bg-signal-ok/10 text-signal-ok",
  redirect: "border-violet/40 bg-violet/10 text-violet",
  client: "border-signal-warn/35 bg-signal-warn/10 text-signal-warn",
  server: "border-signal-bad/40 bg-signal-bad/12 text-signal-bad",
  pending: "border-border bg-muted/60 text-ink-soft",
};

export function StatusCodeChip({
  code,
  className,
}: {
  code: number | null;
  className?: string;
}) {
  const tone = statusClass(code);
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded px-1.5 py-0 font-mono text-[11px] tabular-nums",
        TONE[tone],
        className,
      )}
    >
      {code ?? "—"}
      <span className="sr-only">
        {" "}
        {tone === "ok"
          ? "success"
          : tone === "redirect"
            ? "redirect"
            : tone === "client"
              ? "client error"
              : tone === "server"
                ? "server error"
                : "no response yet"}
      </span>
    </Badge>
  );
}

const METHOD_TONE: Record<string, string> = {
  GET: "text-ink-soft",
  POST: "text-cyan",
  PATCH: "text-signal-warn",
  DELETE: "text-signal-bad",
};

/** Method is set as bare text, not a chip — a table with a filled pill in
 *  every row of two different columns stops reading as a table. */
export function MethodLabel({ method }: { method: string }) {
  return (
    <span className={cn("font-mono text-[11px] font-medium", METHOD_TONE[method] ?? "text-ink-soft")}>
      {method}
    </span>
  );
}

export function EnvironmentChip({
  environment,
  className,
}: {
  environment: string;
  className?: string;
}) {
  const isProd = environment === "production";
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded px-1.5 py-0 font-mono text-[10px] uppercase tracking-wider",
        isProd
          ? "border-magenta/40 bg-magenta/10 text-magenta"
          : "border-border bg-muted/60 text-ink-soft",
        className,
      )}
    >
      {isProd ? "prod" : "staging"}
    </Badge>
  );
}

/** Small pulsing dot + label. The pulse is opacity/transform only and bottoms
 *  out at 0.35, so the dot never vanishes mid-cycle. */
export function LiveDot({
  tone = "ok",
  label,
  srLabel,
  animate = true,
}: {
  tone?: "ok" | "warn" | "bad";
  label?: string;
  /**
   * The state the colour is signalling, for anyone who can't see the colour.
   * Required in practice wherever the dot stands alone — with no `label` and
   * no adjacent text naming the state, the dot is an empty <span> and the
   * status simply doesn't exist for a screen reader.
   */
  srLabel?: string;
  animate?: boolean;
}) {
  const color =
    tone === "ok" ? "bg-signal-ok" : tone === "warn" ? "bg-signal-warn" : "bg-signal-bad";
  const glow =
    tone === "ok"
      ? "shadow-[0_0_10px_var(--signal-ok)]"
      : tone === "warn"
        ? "shadow-[0_0_10px_var(--signal-warn)]"
        : "shadow-[0_0_10px_var(--signal-bad)]";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        {...(animate ? { "data-pulse": "" } : {})}
        className={cn("h-1.5 w-1.5 rounded-full", color, glow)}
      />
      {label && <span className="text-[11px] text-muted-foreground">{label}</span>}
      {srLabel && <span className="sr-only">{srLabel}</span>}
    </span>
  );
}
