import Link from "next/link";
import { buttonVariants } from "@/components/dsgn/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/dsgn/card";

const PILLARS = [
  {
    title: "Physical separation",
    body: "Logic that can't import your UI framework, enforced by the build — not a naming convention.",
  },
  {
    title: "One scheduler",
    body: "Every background job goes through one deliberate engine, never an ad-hoc thread per call site.",
  },
  {
    title: "Non-destructive by default",
    body: "Edits are an overlay over an untouched original. Undo is structural, not reconstructed.",
  },
  {
    title: "Trust the data",
    body: "Gatekeep structure, never content. The user's data is the user's data.",
  },
  {
    title: "Measure, don't guess",
    body: "Performance claims are proven against the real thing, under real load, more than once.",
  },
  {
    title: "Idioms stay current",
    body: "Framework footguns from stale training data get written down with their exact failure mode.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          A design philosophy, made usable.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Every rule here was extracted from a decision that actually shipped in a real app —
          named, with the commit it came from. Read it as a portable file any AI tool can load,
          or install the components it produced with one command.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/philosophy" className={buttonVariants({ size: "lg" })}>
            Read the philosophy
          </Link>
          <Link href="/components" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Browse components
          </Link>
        </div>
        <pre className="mt-8 w-fit overflow-x-auto rounded-md bg-muted px-4 py-3 text-sm">
          <code>npx dsgn add button card</code>
        </pre>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((pillar) => (
          <Card key={pillar.title}>
            <CardHeader>
              <CardTitle className="text-base">{pillar.title}</CardTitle>
              <CardDescription>{pillar.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
