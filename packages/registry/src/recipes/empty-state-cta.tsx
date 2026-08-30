import { Button } from "../components/button/button";
import { EmptyState } from "../components/empty-state/empty-state";

export function EmptyStateCta() {
  return (
    <EmptyState
      className="w-full max-w-md"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-10 w-10"
        >
          <path d="M12 4v16m8-8H4" strokeLinecap="round" />
        </svg>
      }
      title="No projects yet"
      description="Create your first project to start shipping components into it."
      action={<Button variant="accent">New project</Button>}
    />
  );
}
