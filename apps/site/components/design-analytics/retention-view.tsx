"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dsgn/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dsgn/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { formatCount } from "@/lib/design-analytics/analytics";

type Grain = "weekly" | "monthly";

interface Cohort {
  label: string;
  size: number;
  /** Retention percentage per period, index 0 = period of signup. */
  values: number[];
}

/**
 * Fixed cohort data rather than generated: a retention table has a shape
 * people read at a glance (monotonic decay along each row, later cohorts
 * shorter than earlier ones), and random values break that shape in a way
 * that reads as wrong even to someone not checking the numbers.
 */
const COHORTS: Record<Grain, Cohort[]> = {
  weekly: [
    { label: "Week of Jun 30", size: 1_284, values: [100, 62, 51, 46, 43, 41, 40, 39] },
    { label: "Week of Jul 07", size: 1_402, values: [100, 64, 54, 48, 45, 43, 42] },
    { label: "Week of Jul 14", size: 1_351, values: [100, 61, 50, 45, 42, 40] },
    { label: "Week of Jul 21", size: 1_496, values: [100, 67, 57, 51, 48] },
    { label: "Week of Jul 28", size: 1_610, values: [100, 69, 59, 53] },
    { label: "Week of Aug 04", size: 1_538, values: [100, 66, 56] },
    { label: "Week of Aug 11", size: 1_724, values: [100, 71] },
    { label: "Week of Aug 18", size: 1_802, values: [100] },
  ],
  monthly: [
    { label: "March", size: 5_140, values: [100, 58, 47, 41, 38, 36] },
    { label: "April", size: 5_620, values: [100, 61, 50, 44, 41] },
    { label: "May", size: 6_010, values: [100, 63, 52, 46] },
    { label: "June", size: 6_284, values: [100, 66, 55] },
    { label: "July", size: 6_940, values: [100, 68] },
    { label: "August", size: 7_120, values: [100] },
  ],
};

export function RetentionView() {
  const [grain, setGrain] = useState<Grain>("weekly");
  const cohorts = COHORTS[grain];
  const periodCount = useMemo(
    () => Math.max(...cohorts.map((c) => c.values.length)),
    [cohorts],
  );
  const unit = grain === "weekly" ? "Week" : "Month";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-4 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Cohort retention</CardTitle>
              <CardDescription>
                Share of each cohort that returned in a later period. Read across a row.
              </CardDescription>
            </div>
            <Select value={grain} onValueChange={(value) => setGrain(value as Grain)}>
              <SelectTrigger className="w-40" aria-label="Cohort grain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly cohorts</SelectItem>
                <SelectItem value="monthly">Monthly cohorts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          {/* Overflow lives on this wrapper, not on the page: a heat grid is
              genuinely wider than 390px and clipping it would hide data,
              but the page body must never scroll sideways. */}
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <table className="w-full min-w-[40rem] border-separate border-spacing-1 text-sm">
              <caption className="sr-only">
                {unit}ly retention by signup cohort, as a percentage of cohort size.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-40 pb-1 text-left text-xs font-medium text-muted-foreground">
                    Cohort
                  </th>
                  <th scope="col" className="w-20 pb-1 text-right text-xs font-medium text-muted-foreground">
                    Size
                  </th>
                  {Array.from({ length: periodCount }).map((_, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="pb-1 text-center text-xs font-medium text-muted-foreground"
                    >
                      {unit.charAt(0)}
                      {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.label}>
                    <th
                      scope="row"
                      className="whitespace-nowrap py-1 pr-2 text-left text-sm font-normal"
                    >
                      {cohort.label}
                    </th>
                    <td className="tnum py-1 pr-3 text-right text-sm text-muted-foreground">
                      {formatCount(cohort.size)}
                    </td>
                    {Array.from({ length: periodCount }).map((_, i) => {
                      const value = cohort.values[i];
                      if (value === undefined) {
                        return <td key={i} className="rounded-sm bg-muted/40" />;
                      }
                      /* Opacity of one accent, not a multi-hue heat ramp —
                         a second colour would break this voice's single-accent
                         rule, and a monochrome ramp is easier to read anyway. */
                      const intensity = Math.max(0.06, Math.min(1, value / 100));
                      return (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            {/* Deliberately not focusable. Making 60 heat
                                cells tab stops to expose a tooltip would cost
                                a keyboard user more than the absolute count is
                                worth — the percentage is already in the cell,
                                and the caption describes the grid. */}
                            <td
                              className="tnum rounded-sm py-1.5 text-center text-xs font-medium"
                              style={{
                                backgroundColor: `color-mix(in srgb, var(--accent) ${(
                                  intensity * 80
                                ).toFixed(0)}%, transparent)`,
                                color: value >= 90 ? "var(--accent-foreground)" : undefined,
                              }}
                            >
                              {value}%
                            </td>
                          </TooltipTrigger>
                          <TooltipContent>
                            {cohort.label} · {unit} {i} ·{" "}
                            {formatCount(Math.round((cohort.size * value) / 100))} still active
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">What changed in the Jul 21 cohort</p>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The guided source-connection flow shipped on Jul 22. Cohorts after that date hold roughly
          six points more at {unit.toLowerCase()} two, and the gap has not closed by{" "}
          {unit.toLowerCase()} four — which is the part that suggests a real behaviour change rather
          than a novelty bump.
        </p>
      </Card>
    </div>
  );
}
