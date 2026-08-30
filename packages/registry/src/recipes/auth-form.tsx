import { Button } from "../components/button/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/card/card";
import { Input } from "../components/input/input";
import { Checkbox } from "../components/checkbox/checkbox";

export function AuthForm() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="auth-email">
            Email
          </label>
          <Input id="auth-email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="auth-password">
            Password
          </label>
          <Input id="auth-password" type="password" placeholder="••••••••" />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox defaultChecked /> Remember me
        </label>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        <Button variant="accent" className="w-full">
          Sign in
        </Button>
        <Button variant="link" size="sm" className="self-center">
          Forgot password?
        </Button>
      </CardFooter>
    </Card>
  );
}
