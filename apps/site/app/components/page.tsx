import type { Metadata } from "next";
import { Button } from "@/components/dsgn/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/dsgn/card";
import { Badge } from "@/components/dsgn/badge";
import { Input } from "@/components/dsgn/input";

export const metadata: Metadata = {
  title: "Components — dsgn",
  description: "Live components from the dsgn registry, installed with the dsgn CLI.",
};

const VARIANTS = ["primary", "secondary", "outline", "ghost", "destructive"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const BADGE_VARIANTS = ["primary", "secondary", "outline", "destructive"] as const;

function InstallCommand({ name }: { name: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 text-sm">
      <code>npx dsgn add {name}</code>
    </pre>
  );
}

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          These aren&rsquo;t imported from a package at runtime — the dsgn CLI copies the source
          straight into your project, the same way it copied them into this site. You own the
          file the moment it lands; edit it freely.
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-medium">Button</h2>
        </div>
        <InstallCommand name="button" />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {SIZES.map((size) => (
              <Button key={size} size={size}>
                size {size}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-medium">Card</h2>
        <InstallCommand name="card" />

        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Non-destructive by default</CardTitle>
            <CardDescription>Pillar #3 of the philosophy.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Edits are modeled as an overlay over an untouched original, so undo is structural,
              not reconstructed after the fact.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">
              Read the pillar
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-medium">Badge</h2>
        <InstallCommand name="badge" />

        <div className="flex flex-wrap items-center gap-3">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-medium">Input</h2>
        <InstallCommand name="input" />

        <div className="max-w-sm space-y-3">
          <Input placeholder="Email address" />
          <Input placeholder="Disabled" disabled />
        </div>
      </section>
    </div>
  );
}
