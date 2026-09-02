"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/dsgn/toggle-group";
import {
  defaultSelection,
  describeSelection,
  formatMoney,
  priceFor,
  type Product,
  type Selection,
} from "@/lib/design-shop/catalog";
import { lineKey, type CartLine } from "@/lib/design-shop/cart";
import { cn } from "@/lib/utils";

/**
 * Variant selection, shared by the product page and the quick-view dialog.
 *
 * Both surfaces need identical pricing and identical option rules, so the
 * rules live here once. The arithmetic itself is still in lib/catalog.ts —
 * this hook only holds which values are currently chosen.
 */
export function useProductSelection(product: Product) {
  const [selection, setSelection] = React.useState<Selection>(() => defaultSelection(product));

  const setOption = React.useCallback((optionId: string, valueId: string) => {
    setSelection((current) => ({ ...current, [optionId]: valueId }));
  }, []);

  return {
    selection,
    setOption,
    price: priceFor(product, selection),
    summary: describeSelection(product, selection),
  };
}

/** The cart line a product + selection produces. Pure; no React. */
export function buildLine(product: Product, selection: Selection): Omit<CartLine, "qty"> {
  return {
    id: lineKey(product.slug, selection),
    slug: product.slug,
    name: product.name,
    unitPrice: priceFor(product, selection),
    optionSummary: describeSelection(product, selection),
    tone: product.tone,
    motif: product.motif,
  };
}

export function OptionPickers({
  product,
  selection,
  onChange,
  idPrefix,
  className,
}: {
  product: Product;
  selection: Selection;
  onChange: (optionId: string, valueId: string) => void;
  /** Prefixes generated ids so two copies on one page keep distinct labels. */
  idPrefix: string;
  className?: string;
}) {
  if (product.options.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {product.options.map((option) => {
        const labelId = `${idPrefix}-${option.id}-label`;

        if (option.kind === "chips") {
          return (
            <div key={option.id}>
              <p id={labelId} className="mb-2 text-sm font-medium">
                {option.label}
              </p>
              <ToggleGroup
                type="single"
                value={selection[option.id]}
                // Radix allows a single-select group to be deselected back to
                // "". A variant picker has no valid empty state — an unpriced
                // configuration is not a thing you can add to a bag — so an
                // empty value is treated as "keep the current one".
                onValueChange={(next) => {
                  if (next) onChange(option.id, next);
                }}
                aria-labelledby={labelId}
                // w-fit: the group is a flex child of a stretch-aligned column,
                // so without it the chip rail spans the whole column width
                // and the border reads as an empty input, not a chip set.
                className="w-fit max-w-full flex-wrap"
              >
                {option.values.map((value) => (
                  <ToggleGroupItem key={value.id} value={value.id} size="sm">
                    {value.label}
                    {value.priceDelta > 0 && (
                      <span className="tnum ml-1.5 text-xs opacity-70">
                        +{formatMoney(value.priceDelta)}
                      </span>
                    )}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          );
        }

        return (
          <div key={option.id}>
            <p id={labelId} className="mb-2 text-sm font-medium">
              {option.label}
            </p>
            <Select
              value={selection[option.id]}
              onValueChange={(next) => onChange(option.id, next)}
            >
              <SelectTrigger aria-labelledby={labelId} className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {option.values.map((value) => (
                  <SelectItem key={value.id} value={value.id}>
                    {value.label}
                    {value.priceDelta > 0 ? ` (+${formatMoney(value.priceDelta)})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
