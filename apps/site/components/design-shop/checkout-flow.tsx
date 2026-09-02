"use client";

import * as React from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/dsgn/alert";
import { Badge } from "@/components/dsgn/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/dsgn/breadcrumb";
import { Button } from "@/components/dsgn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dsgn/card";
import { Checkbox } from "@/components/dsgn/checkbox";
import { Input } from "@/components/dsgn/input";
import { Progress } from "@/components/dsgn/progress";
import { RadioGroup, RadioGroupItem } from "@/components/dsgn/radio-group";
import { EmptyStateCta } from "@/components/design-shop/empty-state-cta";
import { Separator } from "@/components/dsgn/separator";
import { useCart } from "@/components/design-shop/cart-provider";
import { Container, Eyebrow } from "@/components/design-shop/primitives";
import { ProductArt } from "@/components/design-shop/product-art";
import { BagIcon, CheckIcon, UndoIcon } from "@/components/design-shop/icons";
import { formatMoney } from "@/lib/design-shop/catalog";
import {
  DELIVERY_OPTIONS,
  freeShippingProgress,
  itemCount,
  orderTotal,
  shippingFor,
  subtotal,
  untilFreeShipping,
} from "@/lib/design-shop/cart";
import { cn } from "@/lib/utils";

function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  className,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input id={id} type={type} placeholder={placeholder} autoComplete={autoComplete} />
    </div>
  );
}

export function CheckoutFlow() {
  const { state, dispatch } = useCart();
  const [delivery, setDelivery] = React.useState(DELIVERY_OPTIONS[0].id);
  const [giftNote, setGiftNote] = React.useState(false);
  const [placed, setPlaced] = React.useState<string | null>(null);

  const goods = subtotal(state);
  const shipping = shippingFor(delivery, goods);
  const total = orderTotal(state, delivery);
  const count = itemCount(state);
  const remaining = untilFreeShipping(goods);

  function placeOrder() {
    // Six characters is enough to be quotable back to us on the phone, and
    // the ambiguous glyphs (0/O, 1/I) are left out of the alphabet for the
    // same reason.
    const alphabet = "ACDEFGHJKLMNPQRTUVWXY2345789";
    let reference = "";
    for (let i = 0; i < 6; i += 1) {
      reference += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    setPlaced(`SR-${reference}`);
    dispatch({ type: "clear" });
  }

  if (placed) {
    return (
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-xl text-center" data-reveal>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <CheckIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-7 text-4xl tracking-[-0.035em] display-wonk">Order placed</h1>
          <p className="mt-4 text-[0.9375rem] leading-[1.8] text-muted-foreground">
            Reference <span className="font-mono text-foreground">{placed}</span>. We
            roast on Tuesday morning and your confirmation email will carry the
            roast date, not just a dispatch estimate.
          </p>
          <Alert className="mt-8 text-left">
            <AlertTitle>Nothing was actually ordered</AlertTitle>
            <AlertDescription className="mt-1 text-muted-foreground">
              Sableroot is a fictional brand built to demonstrate the dsgn
              component registry. No payment step exists in this demo and no
              details were collected or sent anywhere.
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-8" asChild>
            <Link href="/design-shop/shop">Back to the shop</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/design-shop">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/design-shop/shop">Shop</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Checkout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Eyebrow>Step 2 of 2</Eyebrow>
      <h1 className="mt-3 text-4xl tracking-[-0.035em] sm:text-5xl display-wonk">Checkout</h1>

      {state.restored && count === 0 ? (
        <div className="mt-10 max-w-xl">
          <EmptyStateCta
            icon={<BagIcon className="h-9 w-9" />}
            title="There is nothing to check out"
            description="Your bag emptied out — either you just placed an order, or the shop is waiting for you."
            action={
              <Button variant="accent" asChild>
                <Link href="/design-shop/shop">Browse the shop</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <div className="flex flex-col gap-10">
            <section aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="text-xl tracking-[-0.02em]">
                Where it goes
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing typed here is stored, validated or sent anywhere — this
                is a demo, and the fields exist to show the registry&apos;s Input
                in a real layout.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" className="sm:col-span-2" />
                <Field id="first-name" label="First name" autoComplete="given-name" />
                <Field id="last-name" label="Last name" autoComplete="family-name" />
                <Field id="address" label="Address" autoComplete="street-address" className="sm:col-span-2" />
                <Field id="city" label="Town or city" autoComplete="address-level2" />
                <Field id="postcode" label="Postcode" autoComplete="postal-code" />
              </div>
            </section>

            <section aria-labelledby="delivery-heading">
              <h2 id="delivery-heading" className="text-xl tracking-[-0.02em]">
                How it travels
              </h2>
              <RadioGroup
                value={delivery}
                onValueChange={setDelivery}
                aria-labelledby="delivery-heading"
                className="mt-6 gap-3"
              >
                {DELIVERY_OPTIONS.map((option) => {
                  const cost = shippingFor(option.id, goods);
                  const waived = option.id === "standard" && option.price > 0 && cost === 0;
                  return (
                    <label
                      key={option.id}
                      htmlFor={`delivery-${option.id}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3.5 rounded-lg border p-4 transition-colors duration-300 ease-fluid",
                        delivery === option.id
                          ? "border-accent bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]"
                          : "border-border hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]",
                      )}
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`delivery-${option.id}`}
                        className="mt-1"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{option.label}</span>
                          {waived && <Badge variant="accent">Free over £40</Badge>}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {option.detail}
                        </span>
                      </span>
                      <span className="tnum shrink-0 text-sm">
                        {cost === 0 ? "Free" : formatMoney(cost)}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>

              <div className="mt-6 flex items-start gap-3">
                <Checkbox
                  id="gift-note"
                  checked={giftNote}
                  onCheckedChange={(next) => setGiftNote(next === true)}
                  className="mt-0.5"
                />
                <label htmlFor="gift-note" className="cursor-pointer text-sm">
                  This is a gift — leave the invoice out and include a blank card
                  <span className="mt-0.5 block text-muted-foreground">
                    We will still email you the receipt.
                  </span>
                </label>
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="font-display text-xl font-medium tracking-[-0.02em]">
                  Your order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-4">
                  {state.lines.map((line) => (
                    <li key={line.id} className="flex gap-3">
                      <ProductArt
                        tone={line.tone}
                        motif={line.motif}
                        className="h-14 w-14 shrink-0 rounded-md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{line.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {line.optionSummary || "Standard"} · {line.qty}
                        </p>
                      </div>
                      <span className="tnum shrink-0 text-sm">
                        {formatMoney(line.unitPrice * line.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                {state.lastRemoved && (
                  <div
                    role="status"
                    className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-dashed border-border px-3 py-2"
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

                {remaining > 0 && (
                  <div className="mt-6">
                    <Progress
                      value={freeShippingProgress(goods)}
                      aria-label="Progress toward free standard delivery"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatMoney(remaining)} more for free standard delivery.
                    </p>
                  </div>
                )}

                <Separator className="my-6" />

                <dl className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tnum">{formatMoney(goods)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd className="tnum">{shipping === 0 ? "Free" : formatMoney(shipping)}</dd>
                  </div>
                </dl>

                <Separator className="my-6" />

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="tnum font-display text-2xl">{formatMoney(total)}</span>
                </div>

                <Button variant="accent" size="lg" className="mt-6 w-full" onClick={placeOrder}>
                  Place order
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  No payment step, no card details, nothing sent.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Container>
  );
}
