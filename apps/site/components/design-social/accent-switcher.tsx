"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import { Button } from "@/components/dsgn/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { ACCENTS, setAccent, useAccent, type AccentId } from "@/lib/design-social/accent";

/**
 * The accent-preset picker.
 *
 * Worth having in a showcase specifically because of what it *doesn't* do:
 * it changes one attribute on <html>. No component under components/dsgn/ is
 * re-rendered differently, no className is swapped, no theme object is
 * threaded through context. The 27 installed registry components restyle
 * because they were written against semantic token names and globals.css
 * repoints those names per preset — the dsgn token doc's central claim,
 * demonstrated rather than asserted.
 */
export function AccentSwitcher() {
  const accent = useAccent();
  const active = ACCENTS.find((a) => a.id === accent) ?? ACCENTS[0];

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Accent palette: ${active.label}. Change palette`}
              className="rounded-full"
            >
              <span
                className="h-4 w-4 rounded-full ring-1 ring-border"
                style={{ backgroundImage: `linear-gradient(100deg, ${active.from}, ${active.to})` }}
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Accent palette</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Accent palette</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={accent} onValueChange={(v) => setAccent(v as AccentId)}>
          {ACCENTS.map((a) => (
            <DropdownMenuRadioItem key={a.id} value={a.id}>
              <span className="flex items-center gap-2.5">
                <span
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-border"
                  style={{ backgroundImage: `linear-gradient(100deg, ${a.from}, ${a.to})` }}
                />
                {a.label}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
