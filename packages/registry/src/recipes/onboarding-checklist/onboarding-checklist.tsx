import { Checkbox } from "../../components/checkbox/checkbox";
import { Progress } from "../../components/progress/progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/card/card";

const STEPS = [
  { label: "Create your account", done: true },
  { label: "Verify your email", done: true },
  { label: "Invite a teammate", done: false },
  { label: "Connect your first project", done: false },
] as const;

export function OnboardingChecklist() {
  const doneCount = STEPS.filter((step) => step.done).length;
  const percent = Math.round((doneCount / STEPS.length) * 100);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Get set up</CardTitle>
        <CardDescription>
          {doneCount} of {STEPS.length} steps complete
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={percent} />
        <ul className="space-y-3">
          {STEPS.map((step) => (
            <li key={step.label} className="flex items-center gap-3">
              <Checkbox defaultChecked={step.done} disabled={step.done} />
              <span className={step.done ? "text-sm text-muted-foreground line-through" : "text-sm"}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
