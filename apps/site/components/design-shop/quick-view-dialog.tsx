"use client";

import Link from "next/link";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/dsgn/dialog";
import { Separator } from "@/components/dsgn/separator";
import { useCart } from "@/components/design-shop/cart-provider";
import { Price, Stars } from "@/components/design-shop/primitives";
import { ProductArt } from "@/components/design-shop/product-art";
import { buildLine, OptionPickers, useProductSelection } from "@/components/design-shop/product-options";
import { averageRating, type Product } from "@/lib/design-shop/catalog";

/**
 * Quick view: enough to decide with, not a second copy of the product page.
 * It deliberately omits the tabs, the reviews and the shipping accordion —
 * a dialog that reproduces the whole page is a page, and should have been a
 * navigation.
 */
export function QuickViewDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { selection, setOption, price, summary } = useProductSelection(product);
  const { dispatch, setOpen } = useCart();

  function addToBag() {
    dispatch({ type: "add", line: buildLine(product, selection), qty: 1 });
    onOpenChange(false);
    setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
          <ProductArt
            tone={product.tone}
            motif={product.motif}
            className="hidden rounded-l-2xl sm:block"
          />
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[0.625rem] uppercase tracking-[0.14em]">
                  {product.tagline}
                </Badge>
              </div>
              <DialogTitle className="pt-1 font-display text-2xl font-medium tracking-[-0.03em]">
                {product.name}
              </DialogTitle>
              <DialogDescription className="line-clamp-3 leading-[1.7]">
                {product.description}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex items-center gap-4">
              <Price amount={price} was={product.wasPrice} className="font-display text-xl" />
              <Stars rating={averageRating(product)} count={product.reviews.length} />
            </div>

            <Separator className="my-5" />

            <OptionPickers
              product={product}
              selection={selection}
              onChange={setOption}
              idPrefix={`quick-${product.slug}`}
            />

            {summary && (
              <p className="mt-4 text-xs text-muted-foreground">Selected: {summary}</p>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button variant="accent" className="sm:flex-1" onClick={addToBag}>
                Add to bag
              </Button>
              <Button variant="outline" asChild onClick={() => onOpenChange(false)}>
                <Link href={`/design-shop/shop/${product.slug}`}>Full details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
