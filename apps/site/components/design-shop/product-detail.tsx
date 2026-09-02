"use client";

import * as React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/dsgn/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/dsgn/alert";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
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
import { Separator } from "@/components/dsgn/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dsgn/tabs";
import { useCart } from "@/components/design-shop/cart-provider";
import { Container, Eyebrow, Price, Stars } from "@/components/design-shop/primitives";
import { ProductArt } from "@/components/design-shop/product-art";
import { ProductCard } from "@/components/design-shop/product-card";
import { buildLine, OptionPickers, useProductSelection } from "@/components/design-shop/product-options";
import { CheckIcon, LeafIcon, MinusIcon, PlusIcon } from "@/components/design-shop/icons";
import { averageRating, CATEGORY_LABEL, formatMoney, type Product } from "@/lib/design-shop/catalog";
import { MAX_QTY } from "@/lib/design-shop/cart";

const FAQ = [
  {
    id: "shipping",
    question: "When does my order actually ship?",
    answer:
      "We roast on Tuesday and everything roasted that morning is with the courier by Wednesday afternoon. Order on a Wednesday and your coffee waits six days for the next roast — that is deliberate. Equipment and ceramics are not on the roast schedule and leave the same or next working day.",
  },
  {
    id: "returns",
    question: "Can I return coffee I did not like?",
    answer:
      "Unopened bags, yes, within thirty days. Opened bags, also yes — email us what you brewed and how, and we will either swap it for something better suited or refund it. We would rather know that a coffee did not work for you than have you quietly stop ordering.",
  },
  {
    id: "grind",
    question: "Should I buy whole bean or ground?",
    answer:
      "Whole bean if you own a grinder, without qualification — ground coffee loses most of its aromatics within about fifteen minutes of grinding. If you do not own a grinder, ground coffee brewed today still beats whole bean you cannot grind, so pick the setting closest to your brewer and we will do it on the morning it ships.",
  },
  {
    id: "subscription",
    question: "Is there a subscription?",
    answer:
      "Not a rolling one. The Three Month Table sends three bags and then stops on its own. We have not built anything that renews silently, because every version we sketched required somebody to remember to cancel it.",
  },
];

function QuantityField({
  qty,
  setQty,
}: {
  qty: number;
  setQty: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-r-none"
        onClick={() => setQty(Math.max(1, qty - 1))}
        disabled={qty <= 1}
        aria-label="Decrease quantity"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
      <span className="tnum w-10 text-center text-sm" aria-live="polite">
        {qty}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-l-none"
        onClick={() => setQty(Math.min(MAX_QTY, qty + 1))}
        disabled={qty >= MAX_QTY}
        aria-label="Increase quantity"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { selection, setOption, price, summary } = useProductSelection(product);
  const [qty, setQty] = React.useState(1);
  const { dispatch, setOpen } = useCart();
  const rating = averageRating(product);

  function addToBag() {
    dispatch({ type: "add", line: buildLine(product, selection), qty });
    setOpen(true);
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
            <BreadcrumbLink asChild>
              <Link href={`/design-shop/shop?category=${product.category}`}>
                {CATEGORY_LABEL[product.category]}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div data-reveal>
          <ProductArt
            tone={product.tone}
            motif={product.motif}
            emphasis="large"
            className="aspect-square w-full rounded-2xl border border-border lg:sticky lg:top-28"
          />
        </div>

        <div data-reveal style={{ "--reveal-index": 1 } as React.CSSProperties}>
          <Eyebrow>{CATEGORY_LABEL[product.category]}</Eyebrow>
          <h1 className="mt-3 text-4xl tracking-[-0.035em] sm:text-5xl display-wonk">
            {product.name}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">{product.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Price
              amount={price}
              was={product.wasPrice}
              className="font-display text-2xl"
            />
            <Stars rating={rating} count={product.reviews.length} />
            {product.flag && product.inStock && (
              <Badge variant="accent">{product.flag}</Badge>
            )}
          </div>

          <p className="mt-6 max-w-[58ch] text-[0.9375rem] leading-[1.8] text-muted-foreground">
            {product.description}
          </p>

          {product.notes.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.notes.map((note) => (
                <Badge key={note} variant="outline" className="font-normal">
                  {note}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="my-8" />

          {product.inStock ? (
            <>
              <OptionPickers
                product={product}
                selection={selection}
                onChange={setOption}
                idPrefix={`pdp-${product.slug}`}
              />

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <QuantityField qty={qty} setQty={setQty} />
                <Button variant="accent" size="lg" className="flex-1" onClick={addToBag}>
                  Add to bag · {formatMoney(price * qty)}
                </Button>
              </div>

              {summary && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {summary}
                  {qty > 1 && ` · ${qty} bags`}
                </p>
              )}
            </>
          ) : (
            <Alert>
              <AlertTitle>Sold out for this season</AlertTitle>
              <AlertDescription className="mt-1 text-muted-foreground">
                We are not substituting another lot in under this name. It comes
                back when the next harvest lands — around March.
              </AlertDescription>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/design-shop/shop?category=coffee">See what is roasting now</Link>
              </Button>
            </Alert>
          )}

          <ul className="mt-8 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <CheckIcon className="h-4 w-4 shrink-0 text-accent" />
              Roasted the Tuesday after you order
            </li>
            <li className="flex items-center gap-2.5">
              <CheckIcon className="h-4 w-4 shrink-0 text-accent" />
              Free UK delivery over £40
            </li>
            <li className="flex items-center gap-2.5">
              <LeafIcon className="h-4 w-4 shrink-0 text-accent" />
              Compostable bag, valve and all
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 lg:mt-24">
        <Tabs defaultValue="details">
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="brewing">How we brew it</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews{product.reviews.length > 0 ? ` (${product.reviews.length})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-8">
            {/* gap-x is load-bearing: each row is its own justify-between flex,
                  so with no column gap the left column's value ran straight
                  into the right column's label ("Adola Washing StationALTITUDE"). */}
            <dl className="grid max-w-3xl grid-cols-1 sm:grid-cols-2 sm:gap-x-12">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-6 border-b border-border py-3.5"
                >
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="text-right text-sm">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>

          <TabsContent value="brewing" className="mt-8">
            <p className="max-w-[62ch] text-[0.9375rem] leading-[1.85] text-muted-foreground">
              {product.method}
            </p>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            {product.reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nobody has written about this one yet. If you buy it, tell us what
                you thought — we print the good and the bad.
              </p>
            ) : (
              <ul className="flex max-w-3xl flex-col divide-y divide-border">
                {product.reviews.map((review) => (
                  <li key={review.id} className="flex gap-4 py-6 first:pt-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback>{review.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm font-medium">{review.author}</p>
                        <Stars rating={review.rating} />
                        <span className="text-xs text-muted-foreground">{review.when}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium">{review.title}</p>
                      <p className="mt-1 text-sm leading-[1.75] text-muted-foreground">
                        {review.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <div>
          <Eyebrow>Before you order</Eyebrow>
          <h2 className="mt-3 text-2xl tracking-[-0.03em]">
            Shipping, grinding, and the things people ask twice
          </h2>
        </div>
        <Accordion type="single" collapsible className="border-t border-border">
          {FAQ.map((entry) => (
            <AccordionItem key={entry.id} value={entry.id}>
              <AccordionTrigger className="text-left text-[0.9375rem]">
                {entry.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-[62ch] leading-[1.8]">
                {entry.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {related.length > 0 && (
        <div className="mt-20 lg:mt-28">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Also on the shelf</Eyebrow>
              <h2 className="mt-3 text-2xl tracking-[-0.03em]">You might get on with these</h2>
            </div>
            <Button variant="link" asChild>
              <Link href="/design-shop/shop">See everything</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <ProductCard key={item.slug} product={item} index={i} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
