import { Button } from "../components/button/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/card/card";
import { Switch } from "../components/switch/switch";
import { Separator } from "../components/separator/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/select/select";

export function SettingsPanel() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Changes apply on Save, not as you toggle them.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Email notifications</span>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Marketing emails</span>
          <Switch />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm">Theme</span>
          <Select defaultValue="system">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="accent" className="w-full">
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}
