import * as React from "react";
import { Card } from "@/components/dsgn/card";
import { cn } from "@/lib/utils";

/* `title` is deliberately omitted from the div attributes this extends: the
   DOM `title` attribute is a string and would render a native browser
   tooltip, while this component's `title` is the panel heading and takes any
   node. */
interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Small uppercase label above the title. Optional — most panels want one. */
  kicker?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned controls in the header row. */
  actions?: React.ReactNode;
  /** Set false when the child is a full-bleed table. */
  padded?: boolean;
  contentClassName?: string;
  /** Staggers the reveal animation. Keep under ~6 or the cascade drags. */
  revealIndex?: number;
}

/**
 * The one section container in the app.
 *
 * Wraps the registry's Card rather than editing it: the glass fill, the
 * `.bezel` inner highlight and the header layout are this product's
 * decisions, not the registry's, so they live here and `dsgn diff card` stays
 * clean forever.
 */
export function Panel({
  kicker,
  title,
  description,
  actions,
  padded = true,
  className,
  contentClassName,
  revealIndex,
  children,
  ...props
}: PanelProps) {
  return (
    <Card
      data-reveal
      style={revealIndex ? ({ "--reveal-index": revealIndex } as React.CSSProperties) : undefined}
      className={cn(
        "bezel overflow-hidden border-border/80 bg-card/70 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 bg-surface-lift/40 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          {kicker && (
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              {kicker}
            </p>
          )}
          <h2 className="display text-lg text-foreground sm:text-xl">{title}</h2>
          {description && (
            <p className="mt-1 max-w-prose text-[13px] leading-snug text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className={cn(padded && "p-4 sm:p-5", contentClassName)}>{children}</div>
    </Card>
  );
}

/** Uppercase mono label used for field names inside detail views. */
export function FieldLabel({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint",
        className,
      )}
      {...props}
    />
  );
}

/** Preformatted payload block. Scrolls rather than wrapping — a JSON body
 *  reflowed to fit a phone is unreadable in a different way than one that
 *  scrolls. */
export function CodeBlock({ className, children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className={cn(
        "max-h-56 overflow-auto rounded-md border border-border/70 bg-[var(--void)]/70 p-3",
        "font-mono text-[11.5px] leading-relaxed text-ink-soft",
        className,
      )}
      {...props}
    >
      {children}
    </pre>
  );
}
