import { Button } from "../../components/button/button";
import { Badge } from "../../components/badge/badge";
import { Progress } from "../../components/progress/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/card/card";

export function BillingSummary() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Team plan</CardTitle>
          <CardDescription>Renews on Sep 12, 2026</CardDescription>
        </div>
        <Badge variant="accent">Active</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Seats</span>
            <span className="text-muted-foreground">7 of 10 used</span>
          </div>
          <Progress value={70} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Storage</span>
            <span className="text-muted-foreground">42 GB of 50 GB</span>
          </div>
          <Progress value={84} />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <Button variant="accent" className="w-full">
          Upgrade plan
        </Button>
        <Button variant="link" size="sm" className="self-center">
          View invoices
        </Button>
      </CardFooter>
    </Card>
  );
}
