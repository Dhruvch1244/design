"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/dsgn/command";
import { PHILOSOPHY_DOCS } from "@/lib/philosophy-docs";
import { CASE_STUDIES } from "@/lib/case-studies";

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/philosophy", label: "Philosophy — root file" },
  ...PHILOSOPHY_DOCS.map((doc) => ({ href: `/philosophy/${doc.slug}`, label: `Philosophy — ${doc.title}` })),
  { href: "/case-studies", label: "Case Studies" },
  ...CASE_STUDIES.map((study) => ({ href: `/case-studies/${study.slug}`, label: `Case Study — ${study.name}` })),
  { href: "/components", label: "Components" },
];

/**
 * Owns the palette's open state and both ways into it: Cmd/Ctrl+K anywhere
 * on the site, and the "cmdk:open" event Nav's search button dispatches.
 * Decoupled from Nav via that event instead of lifted state/context, so
 * Nav doesn't need to know this component exists.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onCustomOpen() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("cmdk:open", onCustomOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("cmdk:open", onCustomOpen);
    };
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a page..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGES.map((page) => (
            <CommandItem key={page.href} value={page.label} onSelect={() => go(page.href)}>
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="External">
          <CommandItem
            value="GitHub"
            onSelect={() => {
              setOpen(false);
              window.open("https://github.com/dhruvch1244/design", "_blank", "noreferrer");
            }}
          >
            GitHub
            <CommandShortcut>↗</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
