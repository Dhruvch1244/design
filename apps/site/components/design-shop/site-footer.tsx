import Link from "next/link";
import { Separator } from "@/components/dsgn/separator";
import { Container, Eyebrow } from "@/components/design-shop/primitives";
import { LeafIcon } from "@/components/design-shop/icons";
import { CATEGORIES } from "@/lib/design-shop/catalog";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "Everything", href: "/design-shop/shop" },
      ...CATEGORIES.map((c) => ({ label: c.label, href: `/design-shop/shop?category=${c.id}` })),
    ],
  },
  {
    heading: "Brewing",
    links: [
      { label: "Fold Dripper", href: "/design-shop/shop/fold-dripper" },
      { label: "Stem Kettle", href: "/design-shop/shop/stem-kettle" },
      { label: "Field Grinder", href: "/design-shop/shop/field-grinder" },
      { label: "Bench Scale", href: "/design-shop/shop/bench-scale" },
    ],
  },
  {
    heading: "Gifts",
    links: [
      { label: "The Ritual Kit", href: "/design-shop/shop/ritual-kit" },
      { label: "Three Month Table", href: "/design-shop/shop/three-month-table" },
      { label: "Ceramics", href: "/design-shop/shop?category=ceramics" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <p className="font-display text-2xl tracking-[-0.03em]">Sableroot</p>
            <p className="mt-3 text-sm leading-[1.75] text-muted-foreground">
              A small roastery on the north bank. We roast on Tuesdays, ship on
              Wednesdays, and put the roast date on every bag because it is the
              only number on there that matters.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <LeafIcon className="h-4 w-4 text-accent" />
              Compostable bags since 2023
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <Eyebrow>{column.heading}</Eyebrow>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-200 ease-fluid hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Sableroot is a fictional brand, invented to demonstrate the{" "}
            <a
              href="https://design.dhruvchoudhary.com"
              className="text-foreground underline decoration-border underline-offset-4 transition-colors duration-200 ease-fluid hover:text-accent"
            >
              dsgn
            </a>{" "}
            component registry. Nothing here is for sale.
          </p>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em]">
            editorial-warm
          </p>
        </div>
      </Container>
    </footer>
  );
}
