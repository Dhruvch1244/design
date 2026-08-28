import Link from "next/link";
import { Mark } from "@/components/brand/mark";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Button } from "@/components/dsgn/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-32 text-center">
      <Mark className="h-10 w-10 text-accent" />
      <Eyebrow className="mt-8">404</Eyebrow>
      <h1 className="mt-6 font-display text-5xl uppercase tracking-wide">Off the map</h1>
      <p className="mt-4 max-w-sm text-muted-foreground">
        Whatever you were looking for isn&rsquo;t at this address. The pole star doesn&rsquo;t
        move, but URLs apparently do.
      </p>
      <Button asChild variant="accent" size="lg" className="mt-10 rounded-full px-7 shadow-glow">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
