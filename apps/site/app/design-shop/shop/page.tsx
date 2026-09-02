import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/dsgn/breadcrumb";
import { Container, Eyebrow } from "@/components/design-shop/primitives";
import { ShopBrowser } from "@/components/design-shop/shop-browser";
import { CATEGORY_LABEL, type CategoryId } from "@/lib/design-shop/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description: "Coffee, brewing equipment, ceramics and gifts from Sableroot.",
};

const VALID_CATEGORIES = new Set<string>(Object.keys(CATEGORY_LABEL));

/**
 * Reads the initial filter out of the URL so header and footer category
 * links land somewhere real, then hands off to the client browser.
 *
 * Unknown values are dropped rather than erroring — a stale or hand-typed
 * `?category=espresso` shows the full catalog instead of a 404, which is the
 * philosophy's "gatekeep structure, not content" rule applied to a query
 * string.
 */
export default async function ShopPage({ searchParams }: PageProps<"/design-shop/shop">) {
  const params = await searchParams;

  const raw = params.category;
  const requested = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter((value) =>
    VALID_CATEGORIES.has(value),
  ) as CategoryId[];

  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const heading =
    requested.length === 1 ? CATEGORY_LABEL[requested[0]] : "Everything we make";

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
          {requested.length === 1 ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/design-shop/shop">Shop</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{CATEGORY_LABEL[requested[0]]}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Shop</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-10 max-w-[46ch]">
        <Eyebrow>Catalog</Eyebrow>
        <h1 className="mt-3 text-4xl tracking-[-0.035em] sm:text-5xl display-wonk">{heading}</h1>
        <p className="mt-4 text-[0.9375rem] leading-[1.8] text-muted-foreground">
          Eighteen things, which is all we can make properly at our size. Filters
          below narrow it; nothing is hidden behind a login.
        </p>
      </div>

      {/*
        `key` remounts the browser when the URL's filter changes. Without it,
        clicking "Coffee" in the header while already on /shop would update the
        search params and re-render this server component, but the client
        component's useState initial value would never re-run — the link would
        look broken.
      */}
      <ShopBrowser
        key={`${requested.join(",")}|${initialPage}`}
        initialCategories={requested}
        initialPage={initialPage}
      />
    </Container>
  );
}
