import Link from "next/link";
import { Button } from "@/components/dsgn/button";
import { Container, Eyebrow } from "@/components/design-shop/primitives";

export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <div className="max-w-xl">
        <Eyebrow>404</Eyebrow>
        <h1 className="mt-4 text-4xl tracking-[-0.035em] sm:text-5xl display-wonk">
          That shelf is empty
        </h1>
        <p className="mt-5 text-[0.9375rem] leading-[1.8] text-muted-foreground">
          Either the lot sold out and the page went with it, or the link was
          never right. The catalog is eighteen items long, so it will not take
          you long to find what you were after.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="accent" asChild>
            <Link href="/design-shop/shop">Browse the shop</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/design-shop">Back home</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
