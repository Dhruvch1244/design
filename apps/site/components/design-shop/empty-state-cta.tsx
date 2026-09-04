import type { ReactNode } from "react";
import { EmptyState } from "@/components/dsgn/empty-state";
import { cn } from "@/lib/utils";

/**
 * LOCAL EDIT — installed via `dsgn add recipe:empty-state-cta`.
 *
 * As shipped, the recipe hardcodes a "No projects yet / create your first
 * project" panel with its own `max-w-md` and its own Button. Two changes:
 *
 * 1. Copy and action are now props. Registry components are copied into this
 *    tree precisely so they can be edited, and this shop needs the same panel
 *    in two different places with different words (an empty bag in the cart
 *    drawer, a no-results state under the catalog filters). Forking it twice
 *    would have been the wrong call.
 * 2. The `max-w-md` is gone. In the cart drawer this sits inside a Sheet that
 *    already constrains width; the recipe's own cap left it floating in the
 *    middle of an otherwise full-width panel.
 */
export function EmptyStateCta({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <EmptyState
      className={cn("w-full", className)}
      icon={
        icon ?? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            // Decorative — the empty state's own title carries the meaning.
            // Matches the aria-hidden every glyph in icons.tsx already sets.
            aria-hidden="true"
            className="h-9 w-9"
          >
            <path d="M12 4v16m8-8H4" strokeLinecap="round" />
          </svg>
        )
      }
      title={title}
      description={description}
      action={action}
    />
  );
}
