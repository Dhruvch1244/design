"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Card } from "@/components/dsgn/card";
import { Skeleton } from "@/components/dsgn/skeleton";
import { Price } from "@/components/design-shop/primitives";
import { ProductArt } from "@/components/design-shop/product-art";
import { QuickViewDialog } from "@/components/design-shop/quick-view-dialog";
import { ExpandIcon } from "@/components/design-shop/icons";
import { CATEGORY_LABEL, type Product } from "@/lib/design-shop/catalog";
import type { CSSProperties } from "react";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [quickOpen, setQuickOpen] = React.useState(false);

  return (
    <>
      <Card
        data-reveal
        style={{ "--reveal-index": index } as CSSProperties}
        className="group relative flex flex-col overflow-hidden border-border bg-card shadow-none transition-colors duration-300 ease-fluid hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] focus-within:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]"
      >
        <div className="relative">
          <ProductArt
            tone={product.tone}
            motif={product.motif}
            className="aspect-[5/4] w-full transition-transform duration-500 ease-fluid group-hover:scale-[1.03]"
          />

          {(product.flag || !product.inStock) && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {!product.inStock && <Badge variant="secondary">Sold out</Badge>}
              {product.flag && product.inStock && (
                <Badge variant="accent">{product.flag}</Badge>
              )}
            </div>
          )}

          {/*
            Quick view stays visible at all times below `sm`. A control that
            only appears on :hover is unreachable on a touch screen, and this
            grid is the primary way to browse on a phone.

            z-10 is also load-bearing: the product name's stretched ::after
            covers the whole card and comes later in the DOM, so without an
            explicit stacking order it would swallow this button's clicks.
          */}
          {product.inStock && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setQuickOpen(true)}
              className="absolute bottom-3 right-3 z-10 gap-1.5 opacity-100 transition-opacity duration-300 ease-fluid sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 sm:focus-visible:opacity-100"
            >
              <ExpandIcon className="h-3.5 w-3.5" />
              Quick view
            </Button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-5">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground">
            {CATEGORY_LABEL[product.category]}
          </p>
          <h3 className="text-lg">
            {/*
              The stretched-link pattern: the whole card is clickable via this
              pseudo-element, but the accessible target stays the product
              name, so a screen reader announces one link with a real label
              instead of a card-sized anonymous hit area.
            */}
            <Link
              href={`/design-shop/shop/${product.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">{product.tagline}</p>
          <div className="mt-3 flex items-baseline justify-between pt-1">
            <Price
              amount={product.price}
              was={product.wasPrice}
              className="font-display text-lg"
            />
            {product.category === "coffee" && (
              <span className="text-xs text-muted-foreground">250 g</span>
            )}
          </div>
        </div>
      </Card>

      {/* Mounted only while open. The registry's Dialog portals to the body,
          so keeping eighteen of them mounted per page would be eighteen
          idle focus scopes for no benefit. */}
      {quickOpen && (
        <QuickViewDialog product={product} open={quickOpen} onOpenChange={setQuickOpen} />
      )}
    </>
  );
}

/** The loading shape of the card above — same box, same rhythm, no content. */
export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden shadow-none">
      <Skeleton className="aspect-[5/4] w-full rounded-none" />
      <div className="flex flex-col gap-2.5 p-5">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="mt-3 h-5 w-20" />
      </div>
    </Card>
  );
}
