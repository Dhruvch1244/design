import { Badge } from "../../components/badge/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/card/card";
import { cn } from "../../lib/utils";

const STATS = [
  { label: "Monthly recurring revenue", value: "$48.2k", delta: "12.4%", direction: "up" },
  { label: "Active subscriptions", value: "1,284", delta: "3.1%", direction: "up" },
  { label: "Churn rate", value: "2.1%", delta: "0.6%", direction: "down" },
  { label: "Avg. response time", value: "1.8h", delta: "9.2%", direction: "down" },
] as const;

function TrendArrow({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="h-3 w-3 shrink-0"
      aria-hidden="true"
    >
      {direction === "up" ? <path d="M6 15 12 9l6 6" /> : <path d="M6 9l6 6 6-6" />}
    </svg>
  );
}

/**
 * A responsive grid of KPI tiles — label, big number, and a colored trend
 * badge. There's no dedicated "success" token in this registry's theme
 * (only `--destructive` has a semantic color across every voice), so an
 * upward trend reuses Tailwind's own `emerald` palette rather than
 * inventing a new custom property this recipe alone would depend on; a
 * downward trend reuses the existing `destructive` token so it already
 * tracks whatever red each voice defines.
 */
export function StatTiles() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => {
        const positive = stat.direction === "up";
        return (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-2">
              <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 border-transparent",
                  positive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                <TrendArrow direction={stat.direction} />
                {stat.delta}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
