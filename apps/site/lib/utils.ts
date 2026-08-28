import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, then resolve conflicting Tailwind utility
 * classes in favor of the last one wins (e.g. a caller's `className="p-2"`
 * overriding this component's own `"p-4"`) instead of Tailwind's own
 * cascade order, which is source-order-dependent and easy to fight with a
 * consumer's own override.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
