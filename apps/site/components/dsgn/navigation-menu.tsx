"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

export const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium " +
    "transition-colors hover:bg-muted focus:bg-muted focus:outline-none disabled:pointer-events-none disabled:opacity-50 " +
    "data-[active]:bg-accent/12 data-[active]:text-accent data-[state=open]:bg-muted",
);

export const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger ref={ref} className={cn(navigationMenuTriggerStyle(), "group", className)} {...props}>
    {children}{" "}
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="relative top-px ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

// Enter/exit motion is a plain opacity transition on the data-motion
// attribute, not the tailwindcss-animate plugin's animate-in/fade-in
// utilities — this project doesn't install that plugin (see Toast's own
// note on the same trade-off). A fade covers this panel's content swap
// without needing that dependency.
export const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full transition-opacity duration-200 " +
        "data-[motion^=from-]:opacity-0 data-[motion^=to-]:opacity-0 md:absolute md:w-auto",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

export const NavigationMenuLink = NavigationMenuPrimitive.Link;

export const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className="absolute left-0 top-full flex justify-center">
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden " +
          "rounded-2xl border border-border bg-card text-card-foreground shadow-lg md:w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

export const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-10 flex h-1.5 items-end justify-center overflow-hidden transition-opacity duration-200 " +
        "data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100",
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;
