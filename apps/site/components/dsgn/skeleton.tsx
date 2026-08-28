import { cn } from "@/lib/utils";

/** A pulsing placeholder for content that hasn't loaded yet. Size it with className (h-4 w-32, etc). */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
