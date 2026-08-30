"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Copy-to-clipboard for terminal/code snippets. Resets its "copied" state after 1.6s. */
export function CopyButton({
  text,
  className,
  icon = "clipboard",
  label = "Copy to clipboard",
}: {
  text: string;
  className?: string;
  /** "link" swaps the idle icon for a chain-link glyph — used by playground permalinks. */
  icon?: "clipboard" | "link";
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground",
        "transition-colors duration-300 ease-fluid hover:text-accent",
        className,
      )}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-accent">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : icon === "link" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
          <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
          <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
    </button>
  );
}
