import { Button } from "../components/button/button";
import { Badge } from "../components/badge/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/card/card";
import { cn } from "../lib/utils";

const PLANS = [
  {
    name: "Community",
    price: "Free",
    tagline: "Everything you need to get started.",
    features: ["Core features", "Community support", "Unlimited projects"],
    featured: false,
  },
  {
    name: "Team",
    price: "Custom",
    tagline: "For teams that need more.",
    features: ["Everything in Community", "Priority support", "Shared settings"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "SSO, audit logs, dedicated support.",
    features: ["Everything in Team", "SSO / SAML", "Dedicated support channel"],
    featured: false,
  },
] as const;

export function PricingTiers() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
      {PLANS.map((plan) => (
        <Card key={plan.name} className={cn("flex flex-col", plan.featured && "border-accent")}>
          <CardHeader>
            {plan.featured && (
              <Badge variant="accent" className="mb-2 w-fit">
                Most popular
              </Badge>
            )}
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <p className="text-3xl font-semibold uppercase">{plan.price}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant={plan.featured ? "accent" : "outline"} className="w-full">
              {plan.price === "Free" ? "Get started" : "Talk to us"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
