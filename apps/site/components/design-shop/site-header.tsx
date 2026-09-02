"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { useCart } from "@/components/design-shop/cart-provider";
import { CartSheet } from "@/components/design-shop/cart-sheet";
import { Container } from "@/components/design-shop/primitives";
import { ThemeToggle } from "@/components/theme-toggle";
import { BagIcon } from "@/components/design-shop/icons";
import { CATEGORIES } from "@/lib/design-shop/catalog";
import { itemCount } from "@/lib/design-shop/cart";
import { cn } from "@/lib/utils";

function Wordmark() {
  return (
    <Link
      href="/design-shop"
      className="group inline-flex items-center gap-2.5"
      aria-label="Sableroot, home"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
        <circle cx="12" cy="12" r="10.25" fill="var(--accent)" />
        <path
          d="M12 2.2c-3.6 3.1-3.6 16.5 0 19.6"
          fill="none"
          stroke="var(--accent-foreground)"
          strokeWidth="1.6"
        />
      </svg>
      <span className="font-display text-[1.35rem] leading-none tracking-[-0.03em]">
        Sableroot
      </span>
    </Link>
  );
}

const NAV = [
  { href: "/design-shop/shop", label: "Shop all" },
  ...CATEGORIES.map((c) => ({ href: `/design-shop/shop?category=${c.id}`, label: c.label })),
];

export function SiteHeader() {
  const pathname = usePathname();
  const { state, setOpen } = useCart();
  const count = itemCount(state);

  return (
    <>
      {/* Announcement rail. Solid accent, not translucent — this voice has
          no glass layer anywhere, including here. */}
      <div className="bg-accent text-accent-foreground">
        <Container className="flex h-9 items-center justify-center">
          <p className="truncate text-center text-xs tracking-[0.01em]">
            Free UK delivery over £40 · Roasted Tuesdays, shipped Wednesdays
          </p>
        </Container>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <Container className="flex h-16 items-center gap-8">
          <Wordmark />

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm transition-colors duration-200 ease-fluid hover:text-accent",
                      pathname === "/design-shop/shop" && item.href === "/design-shop/shop"
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="relative gap-2"
              onClick={() => setOpen(true)}
              aria-label={`Open your bag, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <BagIcon className="h-[1.05rem] w-[1.05rem]" />
              <span className="hidden sm:inline">Bag</span>
              {/* `state.restored` gates this so the badge never renders a
                  stale 0 for a frame before storage is read back. */}
              {state.restored && count > 0 && (
                <Badge variant="accent" className="tnum px-1.5 py-0 text-[0.6875rem]">
                  {count}
                </Badge>
              )}
            </Button>
          </div>
        </Container>

        {/* Mobile category rail. Scrolls inside its own container so it can
            never push the document itself wide — the horizontal-overflow
            failure the dsgn motion doc documents at 360–390px. */}
        <div className="border-t border-border md:hidden">
          <Container className="px-0">
            <nav aria-label="Categories" className="overflow-x-auto">
              <ul className="flex w-max items-center gap-5 px-5 py-2.5">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="whitespace-nowrap text-sm text-muted-foreground transition-colors duration-200 ease-fluid hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Container>
        </div>
      </header>

      <CartSheet />
    </>
  );
}
