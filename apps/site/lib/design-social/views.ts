/**
 * The view registry.
 *
 * One list, read by three different navigations — the desktop rail, the
 * mobile bottom bar, and the mobile Sheet menu. Adding a view is an entry
 * here, not three edits that drift apart. No React import: this is data
 * about views, not a view.
 */

export type ViewId = "feed" | "explore" | "notifications" | "profile";

export interface ViewMeta {
  id: ViewId;
  /** Label in the desktop rail and the Sheet menu. */
  label: string;
  /** Shorter label for the mobile bottom bar, where width is scarce. */
  shortLabel: string;
  /** Which icon in components/icons.tsx renders for this view. */
  icon: "home" | "compass" | "bell" | "user";
  /** Shown as the document-ish heading above the view. */
  heading: string;
}

export const VIEWS: ViewMeta[] = [
  {
    id: "feed",
    label: "Home",
    shortLabel: "Home",
    icon: "home",
    heading: "Your feed",
  },
  {
    id: "explore",
    label: "Explore rooms",
    shortLabel: "Explore",
    icon: "compass",
    heading: "Explore",
  },
  {
    id: "notifications",
    label: "Notifications",
    shortLabel: "Alerts",
    icon: "bell",
    heading: "Notifications",
  },
  {
    id: "profile",
    label: "Your profile",
    shortLabel: "You",
    icon: "user",
    heading: "Profile",
  },
];

/** Looks up a view's metadata. Falls back to the feed for an unknown id. */
export function viewMeta(id: ViewId): ViewMeta {
  return VIEWS.find((v) => v.id === id) ?? VIEWS[0];
}
