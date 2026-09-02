"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/dsgn/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/dsgn/pagination";
import { EmptyStateCta } from "@/components/design-shop/empty-state-cta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { Separator } from "@/components/dsgn/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/dsgn/toggle-group";
import { ProductCard, ProductCardSkeleton } from "@/components/design-shop/product-card";
import { LeafIcon } from "@/components/design-shop/icons";
import {
  CATEGORIES,
  PER_PAGE,
  pageCount,
  paginate,
  queryCatalog,
  SORTS,
  type CategoryId,
  type SortId,
} from "@/lib/design-shop/catalog";

interface ShopBrowserProps {
  initialCategories: CategoryId[];
  initialPage: number;
}

/**
 * The catalog view. Filtering, sorting and pagination are all
 * lib/catalog.ts's `queryCatalog` / `paginate` — this component only holds
 * which filters are on and renders the result.
 *
 * Initial filter state comes from the URL (`/shop?category=coffee`) so the
 * header's category links land somewhere real and a filtered view is
 * shareable. Subsequent changes are local state rather than router pushes:
 * writing every chip toggle into history would make the browser Back button
 * a filter-undo button, which is not what anyone expects it to be.
 */
export function ShopBrowser({ initialCategories, initialPage }: ShopBrowserProps) {
  const [categories, setCategories] = React.useState<CategoryId[]>(initialCategories);
  const [availability, setAvailability] = React.useState<("in-stock" | "sale")[]>([]);
  const [sort, setSort] = React.useState<SortId>("featured");
  const [page, setPage] = React.useState(initialPage);
  const [pending, setPending] = React.useState(false);

  const results = React.useMemo(
    () => queryCatalog({ categories, availability, sort }),
    [categories, availability, sort],
  );
  const lastPage = pageCount(results.length);

  /*
   * The current page is *derived*, not stored-and-corrected. Tightening a
   * filter can shorten the result set out from under whatever page you were
   * on; clamping here means there is no window in which the pagination
   * control highlights a page that no longer exists. The obvious alternative
   * — an effect that watches `lastPage` and calls setPage — is a second
   * render pass to fix state that was never right in the first place, and
   * React's own lint rules now flag it as the cascading-render bug it is.
   */
  const currentPage = Math.min(page, lastPage);
  const visible = paginate(results, currentPage);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const pendingTimer = React.useRef<number | null>(null);

  /*
   * A short deliberate pending state on every filter change. There is no
   * network here — the data is a local array — but shipping the skeleton only
   * in a hypothetical future "real backend" branch would mean the loading
   * state was never actually looked at, which is how loading states end up
   * mismatched with the content they stand in for. 260ms is long enough to
   * see, short enough not to read as latency.
   *
   * Driven from the event handlers rather than an effect on the filter state:
   * the trigger is a user interaction, so that is where it belongs.
   */
  const withPending = React.useCallback((apply: () => void) => {
    apply();
    setPending(true);
    if (pendingTimer.current !== null) window.clearTimeout(pendingTimer.current);
    pendingTimer.current = window.setTimeout(() => setPending(false), 260);
  }, []);

  React.useEffect(
    () => () => {
      if (pendingTimer.current !== null) window.clearTimeout(pendingTimer.current);
    },
    [],
  );

  function changePage(next: number) {
    withPending(() => setPage(next));
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearFilters() {
    withPending(() => {
      setCategories([]);
      setAvailability([]);
      setPage(1);
    });
  }

  const activeFilters = categories.length + availability.length;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-medium" id="filter-category-label">
              Category
            </p>
            <ToggleGroup
              type="multiple"
              value={categories}
              onValueChange={(next) =>
                withPending(() => {
                  setCategories(next as CategoryId[]);
                  setPage(1);
                })
              }
              aria-labelledby="filter-category-label"
              size="sm"
              className="w-fit max-w-full flex-wrap"
            >
              {CATEGORIES.map((category) => (
                <ToggleGroupItem key={category.id} value={category.id}>
                  {category.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium" id="filter-availability-label">
              Availability
            </p>
            <ToggleGroup
              type="multiple"
              value={availability}
              onValueChange={(next) =>
                withPending(() => {
                  setAvailability(next as ("in-stock" | "sale")[]);
                  setPage(1);
                })
              }
              aria-labelledby="filter-availability-label"
              size="sm"
              className="w-fit max-w-full flex-wrap"
            >
              <ToggleGroupItem value="in-stock">In stock</ToggleGroupItem>
              <ToggleGroupItem value="sale">Reduced</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div>
            <p className="mb-2 text-sm font-medium" id="filter-sort-label">
              Sort
            </p>
            <Select
              value={sort}
              onValueChange={(next) =>
                withPending(() => {
                  setSort(next as SortId);
                  setPage(1);
                })
              }
            >
              <SelectTrigger aria-labelledby="filter-sort-label" className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-0.5"
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-7" />

      <div className="mb-6 flex items-baseline justify-between gap-4">
        {/* Announced on change so filtering is not a silent event for anyone
            not watching the grid repaint. */}
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {results.length === 0
            ? "No products match these filters"
            : `${results.length} ${results.length === 1 ? "product" : "products"}`}
          {lastPage > 1 && ` · page ${currentPage} of ${lastPage}`}
        </p>
        {results.length > PER_PAGE && (
          <p className="hidden text-xs text-muted-foreground sm:block">
            {PER_PAGE} per page
          </p>
        )}
      </div>

      <div ref={gridRef} className="scroll-mt-28">
        {pending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: Math.max(3, Math.min(visible.length || PER_PAGE, PER_PAGE)) }).map(
              (_, i) => (
                <ProductCardSkeleton key={i} />
              ),
            )}
          </div>
        ) : results.length === 0 ? (
          <EmptyStateCta
            icon={<LeafIcon className="h-9 w-9" />}
            title="Nothing matches those filters"
            description="Every lot we have is either roasting or on a shelf — try widening the category, or clear the filters and start again."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        )}
      </div>

      {lastPage > 1 && !pending && (
        <Pagination className="mt-12">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-40" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage > 1) changePage(currentPage - 1);
                }}
              />
            </PaginationItem>
            {Array.from({ length: lastPage }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  aria-label={`Go to page ${i + 1}`}
                  onClick={(event) => {
                    event.preventDefault();
                    changePage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={currentPage === lastPage}
                className={currentPage === lastPage ? "pointer-events-none opacity-40" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage < lastPage) changePage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="mt-14 rounded-2xl border border-border p-7 sm:p-9">
        <p className="font-display text-2xl tracking-[-0.03em]">
          Not sure where to start?
        </p>
        <p className="mt-2.5 max-w-[52ch] text-sm leading-[1.75] text-muted-foreground">
          The Ritual Kit is the box we put together for exactly that question —
          a brewer, a hundred filters, a mug, and a bag of whichever coffee you
          like the sound of.
        </p>
        <Button variant="outline" className="mt-5" asChild>
          <Link href="/design-shop/shop/ritual-kit">See the kit</Link>
        </Button>
      </div>
    </div>
  );
}
