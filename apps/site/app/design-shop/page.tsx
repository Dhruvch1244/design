import type { CSSProperties } from "react";
import Link from "next/link";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Input } from "@/components/dsgn/input";
import { Separator } from "@/components/dsgn/separator";
import { Container, Eyebrow, Price } from "@/components/design-shop/primitives";
import { ProductArt } from "@/components/design-shop/product-art";
import { ProductCard } from "@/components/design-shop/product-card";
import { ArrowRightIcon } from "@/components/design-shop/icons";
import { CATEGORIES, featuredProducts, getProduct } from "@/lib/design-shop/catalog";

const STEPS = [
  {
    n: "01",
    title: "Green coffee lands on Thursday",
    body: "We buy in small lots, usually six to twelve sacks, which is small enough that we can taste every one before it goes on the roast list and honest enough that some of them sell out in a fortnight.",
  },
  {
    n: "02",
    title: "Everything roasts on Tuesday",
    body: "One roast day a week, on a 12 kg drum. It means your coffee is never more than six days old when it leaves us, and it means we can put the actual roast date on the bag instead of a best-before guess.",
  },
  {
    n: "03",
    title: "It ships on Wednesday",
    body: "Bagged the morning after roasting, with the degassing valve open, so it finishes off-gassing in transit rather than on our shelf. Most orders land Thursday or Friday.",
  },
];

export default function HomePage() {
  const hero = getProduct("ember-ridge");
  const featured = featuredProducts(3);
  const secondary = getProduct("fold-dripper");
  const tertiary = getProduct("tilde-mug");

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <Container className="pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:gap-16">
          <div data-reveal>
            <Eyebrow>North bank roastery · since 2019</Eyebrow>
            <h1 className="mt-5 text-[2.75rem] leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.25rem] display-wonk">
              Coffee with a date
              <br />
              on it, not a season.
            </h1>
            <p className="mt-7 max-w-[52ch] text-base leading-[1.8] text-muted-foreground">
              We roast once a week, on a Tuesday, in batches small enough that
              nothing sits. Every bag carries the day it was roasted rather than
              a best-before that could mean anything — because that date is the
              only one that changes how the coffee tastes.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button variant="accent" size="lg" asChild>
                <Link href="/design-shop/shop?category=coffee">Shop the roast list</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/design-shop/shop/ritual-kit">Start with the kit</Link>
              </Button>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-7">
              {[
                { label: "Roast day", value: "Tuesday" },
                { label: "Lots this year", value: "18" },
                { label: "Free over", value: "£40" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd className="mt-1.5 font-display text-2xl tracking-[-0.02em]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/*
            A contact-sheet composition rather than one hero image. Nothing
            here is a photograph — every tile is generated from a tone token
            and a motif, so the whole arrangement re-tints with the theme.
          */}
          {hero && secondary && tertiary && (
            <div
              className="relative"
              data-reveal
              style={{ "--reveal-index": 1 } as CSSProperties}
            >
              <div className="grid grid-cols-2 gap-4">
                <ProductArt
                  tone={hero.tone}
                  motif={hero.motif}
                  emphasis="large"
                  className="aspect-[3/4] rounded-2xl border border-border"
                />
                <div className="flex flex-col gap-4">
                  <ProductArt
                    tone={secondary.tone}
                    motif={secondary.motif}
                    className="aspect-square rounded-2xl border border-border"
                  />
                  <ProductArt
                    tone={tertiary.tone}
                    motif={tertiary.motif}
                    className="aspect-square rounded-2xl border border-border"
                  />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-border bg-card p-4 sm:right-auto sm:max-w-[16rem]">
                <Badge variant="accent" className="mb-2">
                  {hero.flag}
                </Badge>
                <p className="text-sm font-medium">{hero.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{hero.tagline}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Price amount={hero.price} className="text-sm" />
                  <Link
                    href={`/design-shop/shop/${hero.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-accent transition-colors duration-200 ease-fluid hover:underline"
                  >
                    View
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>

      {/* --------------------------------------------------------- Featured */}
      <Container className="py-6">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <Eyebrow>This week on the shelf</Eyebrow>
            <h2 className="mt-3 text-3xl tracking-[-0.03em] sm:text-4xl">
              Three we would hand you first
            </h2>
          </div>
          <Button variant="link" asChild>
            <Link href="/design-shop/shop">See all eighteen</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i} />
          ))}
        </div>
      </Container>

      {/* -------------------------------------------------- How Tuesday works */}
      <section className="mt-24 border-y border-border bg-[color-mix(in_srgb,var(--accent)_5%,var(--background))]">
        <Container className="py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
            <div>
              <Eyebrow>How Tuesday works</Eyebrow>
              <h2 className="mt-3 text-3xl tracking-[-0.03em] sm:text-4xl">
                One roast day, on purpose
              </h2>
              <p className="mt-5 max-w-[46ch] text-[0.9375rem] leading-[1.8] text-muted-foreground">
                Roasting daily would let us ship faster and would make every bag
                slightly worse. We picked the other trade-off, and this is what
                it costs you: a wait of up to six days, and never longer.
              </p>
            </div>
            <ol className="flex flex-col">
              {STEPS.map((step, i) => (
                <li key={step.n}>
                  {i > 0 && <Separator className="my-8" />}
                  <div className="flex gap-6 sm:gap-10">
                    <span
                      aria-hidden="true"
                      className="font-display text-3xl tracking-[-0.02em] text-accent sm:text-4xl"
                    >
                      {step.n}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xl tracking-[-0.02em]">{step.title}</h3>
                      <p className="mt-2.5 max-w-[58ch] text-[0.9375rem] leading-[1.8] text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------- Categories */}
      <Container className="py-20">
        <Eyebrow>Browse</Eyebrow>
        <h2 className="mt-3 text-3xl tracking-[-0.03em] sm:text-4xl">
          Four shelves, nothing else
        </h2>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, i) => {
            return (
              <Link
                key={category.id}
                href={`/design-shop/shop?category=${category.id}`}
                data-reveal
                style={{ "--reveal-index": i } as CSSProperties}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border transition-colors duration-300 ease-fluid hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]"
              >
                <ProductArt
                  tone={category.tone}
                  motif={category.motif}
                  className="aspect-[16/9] w-full transition-transform duration-500 ease-fluid group-hover:scale-[1.04]"
                />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-lg tracking-[-0.02em]">{category.label}</p>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                    {category.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent">
                    Browse
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-fluid group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>

      {/* --------------------------------------------------------- Roast list */}
      <Container className="pb-8">
        <div className="rounded-2xl border border-border p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-16">
            <div>
              <Eyebrow>The roast list</Eyebrow>
              <h2 className="mt-3 text-2xl tracking-[-0.03em] sm:text-3xl">
                What is going on the drum, sent Monday night
              </h2>
              <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-[1.8] text-muted-foreground">
                One email a week, written by whoever is roasting. It says what is
                on tomorrow&apos;s list, what sold out, and occasionally what we got
                wrong. No offers.
              </p>
            </div>
            {/*
              Deliberately not a <form>. This demo has nothing to post to, and
              a field that looks live but silently discards what you type is
              worse than one that says so.
            */}
            <div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="roast-list" className="sr-only">
                  Email address for the roast list
                </label>
                <Input
                  id="roast-list"
                  type="email"
                  placeholder="you@example.com"
                  className="sm:flex-1"
                  disabled
                />
                <Button variant="outline" disabled>
                  Sign up
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Inert in this demo — nothing is collected or sent.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
