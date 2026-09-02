"use client";

import Link from "next/link";
import { Button } from "@/components/dsgn/button";
import { Progress } from "@/components/dsgn/progress";
import { EmptyStateCta } from "@/components/design-shop/empty-state-cta";
import { Separator } from "@/components/dsgn/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/dsgn/sheet";
import { useCart } from "@/components/design-shop/cart-provider";
import { BagIcon, MinusIcon, PlusIcon, TrashIcon, UndoIcon } from "@/components/design-shop/icons";
import { ProductArt } from "@/components/design-shop/product-art";
import { formatMoney } from "@/lib/design-shop/catalog";
import {
  freeShippingProgress,
  itemCount,
  MAX_QTY,
  subtotal,
  untilFreeShipping,
} from "@/lib/design-shop/cart";

function QuantityStepper({
  qty,
  name,
  onChange,
}: {
  qty: number;
  name: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border">
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-r-none"
        onClick={() => onChange(qty - 1)}
        aria-label={`Decrease quantity of ${name}`}
      >
        <MinusIcon className="h-3.5 w-3.5" />
      </Button>
      {/* aria-live so a screen reader hears the new value after either
          button press — the buttons themselves keep their static labels. */}
      <span className="tnum w-8 text-center text-sm" aria-live="polite">
        {qty}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-l-none"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= MAX_QTY}
        aria-label={`Increase quantity of ${name}`}
      >
        <PlusIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function CartSheet() {
  const { state, dispatch, isOpen, setOpen } = useCart();
  const goods = subtotal(state);
  const count = itemCount(state);
  const remaining = untilFreeShipping(goods);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-0 p-0 sm:w-[26rem]"
      >
        <SheetHeader className="px-6 pb-5 pt-6">
          <SheetTitle className="font-display text-2xl font-medium">Your bag</SheetTitle>
          <SheetDescription>
            {count === 0
              ? "Nothing in here yet."
              : `${count} ${count === 1 ? "item" : "items"}, roasted to order.`}
          </SheetDescription>
        </SheetHeader>

        {state.lines.length > 0 && (
          <div className="px-6 pb-5">
            <Progress
              value={freeShippingProgress(goods)}
              aria-label="Progress toward free standard delivery"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {remaining === 0
                ? "Standard delivery is on us."
                : `${formatMoney(remaining)} more for free standard delivery.`}
            </p>
          </div>
        )}

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {state.lines.length === 0 ? (
            <EmptyStateCta
              icon={<BagIcon className="h-9 w-9" />}
              title="Your bag is empty"
              description="Everything is roasted the Tuesday after you order, so there is no rush — but there is a queue."
              action={
                <Button variant="accent" asChild onClick={() => setOpen(false)}>
                  <Link href="/design-shop/shop">Browse the shop</Link>
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-5">
              {state.lines.map((line) => (
                <li key={line.id} className="flex gap-4">
                  <ProductArt
                    tone={line.tone}
                    motif={line.motif}
                    className="h-20 w-20 shrink-0 rounded-md"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/design-shop/shop/${line.slug}`}
                          onClick={() => setOpen(false)}
                          className="block truncate text-sm font-medium transition-colors duration-200 ease-fluid hover:text-accent"
                        >
                          {line.name}
                        </Link>
                        {line.optionSummary && (
                          <p className="truncate text-xs text-muted-foreground">
                            {line.optionSummary}
                          </p>
                        )}
                      </div>
                      <span className="tnum shrink-0 text-sm">
                        {formatMoney(line.unitPrice * line.qty)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <QuantityStepper
                        qty={line.qty}
                        name={line.name}
                        onChange={(next) => dispatch({ type: "setQty", id: line.id, qty: next })}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => dispatch({ type: "remove", id: line.id })}
                        aria-label={`Remove ${line.name} from your bag`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/*
            The undo affordance for lib/cart.ts's non-destructive removal.
            A removed line is held with its original index, so this puts it
            back exactly where it was rather than appending it to the end.
          */}
          {state.lastRemoved && (
            <div
              role="status"
              className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-dashed border-border px-4 py-3"
            >
              <p className="min-w-0 truncate text-xs text-muted-foreground">
                Removed {state.lastRemoved.line.name}
              </p>
              <Button
                variant="link"
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => dispatch({ type: "undoRemove" })}
              >
                <UndoIcon className="mr-1.5 h-3.5 w-3.5" />
                Undo
              </Button>
            </div>
          )}
        </div>

        {state.lines.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-4 px-6 pb-6 pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="tnum font-display text-xl">{formatMoney(goods)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery and any gift note are chosen at the next step.
              </p>
              <Button variant="accent" size="lg" asChild onClick={() => setOpen(false)}>
                <Link href="/design-shop/checkout">Checkout</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Keep shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
