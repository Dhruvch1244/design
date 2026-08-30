import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "../button/button";
import { cn } from "../../lib/utils";

export function Pagination({ className, ...props }: React.ComponentPropsWithoutRef<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

export const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

export const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  (props, ref) => <li ref={ref} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<VariantProps<typeof buttonVariants>, "size"> &
  React.ComponentPropsWithoutRef<"a">;

export function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
        isActive && "border-accent text-accent",
        className,
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: React.ComponentPropsWithoutRef<"a">) {
  return (
    <PaginationLink aria-label="Go to previous page" size="sm" className={cn("gap-1 pl-2.5", className)} {...props}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Previous</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, ...props }: React.ComponentPropsWithoutRef<"a">) {
  return (
    <PaginationLink aria-label="Go to next page" size="sm" className={cn("gap-1 pr-2.5", className)} {...props}>
      <span>Next</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span aria-hidden="true" className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </svg>
      <span className="sr-only">More pages</span>
    </span>
  );
}
