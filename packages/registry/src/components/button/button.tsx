import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
    "transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring " +
    "active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        /** Permanently-glowing accent — for the one CTA per view that should read as "the" action. */
        glow: "bg-accent text-accent-foreground shadow-[0_0_30px_-6px_var(--accent)] hover:bg-accent/90",
        /** Low-emphasis tinted fill — a step down from `accent` without dropping to a bare outline. */
        soft: "bg-accent/12 text-accent hover:bg-accent/20",
        outline: "border border-border bg-transparent hover:bg-muted",
        ghost: "bg-transparent hover:bg-muted",
        /** Text-only, no fill/border — for inline or low-chrome actions (e.g. "Learn more"). */
        link: "text-accent underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        xs: "h-7 rounded px-2.5 text-xs",
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        xl: "h-14 rounded-lg px-8 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    compoundVariants: [
      // `link` has no padding/height box to speak of — it should read as
      // inline text regardless of which size prop is passed alongside it.
      { variant: "link", size: ["xs", "sm", "md", "lg", "xl"], class: "h-auto p-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Renders a loading spinner and disables interaction, without changing
   * the button's dimensions — the label stays laid out (visually hidden)
   * and the spinner is absolutely positioned over it, so a button never
   * resizes or reflows neighboring elements when a loading state toggles.
   */
  loading?: boolean;
  /**
   * Renders the child element instead of a <button>, merging Button's
   * classes/props onto it via Radix Slot — e.g. `<Button asChild><Link
   * .../></Button>`. Required for composing with `<a>`/`<Link>`, since
   * nesting an anchor inside a <button> is invalid HTML. Not compatible
   * with `loading` (the spinner overlay assumes a <button>'s box model).
   */
  asChild?: boolean;
  /**
   * Icon rendered before the label, sized and gapped to match the button's
   * text. Has no effect when `asChild` is set — Radix Slot needs its single
   * child to be the element actually being slotted (e.g. a `<Link>`), so an
   * icon can't be composed in without `Slottable`, which no current call
   * site needs.
   */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label. Ignored when `size` is an `icon*` variant — use `leftIcon` alone for a plain icon button. Same `asChild` caveat as `leftIcon`. */
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      disabled,
      asChild,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const isIconOnly = typeof size === "string" && size.startsWith("icon");
    const content = (
      <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>
        {leftIcon}
        {children}
        {!isIconOnly && rightIcon}
      </span>
    );

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), "relative", className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </span>
        )}
        {content}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
