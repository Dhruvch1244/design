import { Badge } from "@/components/dsgn/badge";
import { HEALTH_LABEL, type EventHealth } from "@/lib/design-analytics/analytics";
import { cn } from "@/lib/utils";

/**
 * Status is carried by a 6px dot and the label's weight, not by a filled
 * slab of colour.
 *
 * A `destructive`-filled Badge is the obvious first reach, but a table with
 * two solid red pills in it reads as an incident rather than as two events
 * running slow — and a saturated fill is exactly what the corporate voice
 * rules out. Red survives here only as the dot and the label colour, which
 * is enough to find the row without shouting. Status is also not encoded by
 * colour alone: every state keeps its written label.
 */
const DOT: Record<EventHealth, string> = {
  healthy: "bg-foreground/45",
  degraded: "bg-destructive",
  "no-data": "bg-foreground/20",
};

const TEXT: Record<EventHealth, string> = {
  healthy: "text-foreground",
  degraded: "text-destructive",
  "no-data": "text-muted-foreground",
};

export function HealthPill({ health, className }: { health: EventHealth; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 whitespace-nowrap font-normal", TEXT[health], className)}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", DOT[health])} />
      {HEALTH_LABEL[health]}
    </Badge>
  );
}
