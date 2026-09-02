"use client";

import * as React from "react";
import { Button } from "@/components/dsgn/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { IconCheck, IconCopy } from "@/components/design-console/icons";
import { toast } from "@/components/dsgn/use-toast";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  /** What was copied, for the toast and the accessible name. */
  label: string;
  className?: string;
}

/**
 * Copy-to-clipboard, with the confirmation living on the button itself rather
 * than only in a toast — a toast in the corner is easy to miss when the thing
 * you clicked is in the middle of a dense table.
 *
 * navigator.clipboard is unavailable on insecure origins and can be denied by
 * permission policy, so the failure path is a real destructive toast naming
 * the reason, not a silent no-op. Nothing is more corrosive in a key-
 * management UI than a copy button that might not have copied.
 */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 1600);
      toast({ title: "Copied", description: `${label} is on your clipboard.` });
    } catch {
      toast({
        variant: "destructive",
        title: "Clipboard unavailable",
        description: "Your browser blocked clipboard access. Select the value and copy manually.",
      });
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={copy}
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
          className={cn("text-ink-faint hover:text-cyan", className)}
        >
          {copied ? (
            <IconCheck className="h-3.5 w-3.5 text-signal-ok" />
          ) : (
            <IconCopy className="h-3.5 w-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : `Copy ${label}`}</TooltipContent>
    </Tooltip>
  );
}
