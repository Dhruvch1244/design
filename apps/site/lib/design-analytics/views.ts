/** View registry — framework-free, so the shell, the breadcrumb, and the
 *  command palette all read the same list instead of each keeping a copy
 *  that drifts. Icons are attached at the component layer, not here. */

export type ViewId = "overview" | "events" | "retention" | "team" | "alerts";

export interface ViewMeta {
  id: ViewId;
  label: string;
  /** Page-title copy — deliberately different from the nav label, which has
   *  to stay short enough for a 15rem sidebar. */
  title: string;
  description: string;
  /** Command-palette match terms beyond the label itself. */
  keywords: string;
}

export const VIEWS: ViewMeta[] = [
  {
    id: "overview",
    label: "Overview",
    title: "Overview",
    description: "Traffic, activation, and ingest health for the selected property.",
    keywords: "dashboard home metrics sessions",
  },
  {
    id: "events",
    label: "Events",
    title: "Tracked events",
    description: "Every event in the schema registry, with delivery health and volume.",
    keywords: "schema registry tracking plan volume",
  },
  {
    id: "retention",
    label: "Retention",
    title: "Weekly retention",
    description: "Share of each signup cohort still active in later weeks.",
    keywords: "cohorts churn weekly stickiness",
  },
  {
    id: "team",
    label: "Team",
    title: "Team access",
    description: "Who can read and write in this workspace.",
    keywords: "members roles permissions invite",
  },
  {
    id: "alerts",
    label: "Alerts",
    title: "Alerts",
    description: "Thresholds that page someone when a metric moves.",
    keywords: "monitors thresholds paging notifications",
  },
];

export const VIEW_BY_ID = Object.fromEntries(VIEWS.map((v) => [v.id, v])) as Record<
  ViewId,
  ViewMeta
>;

export const WORKSPACE_NAME = "Northbridge Labs";
export const PRODUCT_NAME = "Halyard";
