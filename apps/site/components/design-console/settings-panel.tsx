import { Button } from "@/components/dsgn/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/dsgn/card";
import { Switch } from "@/components/dsgn/switch";
import { Separator } from "@/components/dsgn/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/dsgn/select";

/*
 * Installed with `npx @dhruvchoudhary/dsgn add recipe:settings-panel`.
 *
 * LOCAL EDITS, all recorded here rather than left as silent drift:
 *
 *  1. `max-w-sm` -> `w-full`. The recipe assumes it is the only thing on the
 *     page; here it sits in a two-column grid beside another panel, and a
 *     384px card floating in a 700px column reads as a layout bug.
 *  2. Placeholder rows ("Email notifications", "Marketing emails", "Theme")
 *     replaced with real console preferences. A demo whose whole point is
 *     "this is what a real product looks like" cannot ship lorem-ipsum
 *     settings.
 *  3. `variant="accent"` -> `variant="soft"` on the submit button. A
 *     full-width flat saturated cyan block is exactly the "large flat
 *     saturated fill" the neon-cyberpunk voice rules out; `soft` is the
 *     tinted step down that the registry already provides for this.
 *  4. Card chrome matched to components/panel.tsx (glass + bezel), so it
 *     doesn't read as a second design system next to every other panel.
 *
 *  The recipe's own framing — "Changes apply on Save, not as you toggle
 *  them" — is kept verbatim, because it is the same non-destructive rule the
 *  flag overlay next to it implements.
 */
export function SettingsPanel() {
  return (
    <Card className="bezel w-full border-border/80 bg-card/70 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="display text-xl">Console preferences</CardTitle>
        <CardDescription>Changes apply on Save, not as you toggle them.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="pref-alerts" className="cursor-pointer text-sm">
            Page me on a 5xx spike
          </label>
          <Switch id="pref-alerts" defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="pref-digest" className="cursor-pointer text-sm">
            Weekly usage digest
          </label>
          <Switch id="pref-digest" />
        </div>
        <Separator className="bg-border/60" />
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="pref-env" className="cursor-pointer text-sm">
            Default environment
          </label>
          <Select defaultValue="production">
            <SelectTrigger id="pref-env" className="w-36 font-mono text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="last">Last used</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="soft" className="w-full">
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}
