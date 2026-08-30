"use client";

import { useState } from "react";
import { Button } from "@/components/dsgn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dsgn/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dsgn/dialog";
import { Input } from "@/components/dsgn/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dsgn/select";
import { toast } from "@/components/dsgn/use-toast";
import { TeamMembers } from "@/components/dsgn/recipes/team-members";
import { IconUsers } from "@/components/design-analytics/icons";

const ROLE_NOTES: Record<string, string> = {
  Admin: "Can change billing, rotate write keys, and remove members.",
  Member: "Can build reports and edit the schema registry.",
  Viewer: "Read-only across every property in the workspace.",
};

export function TeamView() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");

  function sendInvite() {
    setInviteOpen(false);
    toast({
      title: "Invite sent",
      description: `${email || "The address you entered"} can join as ${role.toLowerCase()}.`,
    });
    setEmail("");
    setRole("Member");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 pb-4">
          <div className="min-w-0">
            <CardTitle className="text-base">Members</CardTitle>
            <CardDescription>
              Roles apply to every property in {""}
              this workspace. Per-property access is on the roadmap.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            leftIcon={<IconUsers className="h-4 w-4" />}
            onClick={() => setInviteOpen(true)}
          >
            Invite
          </Button>
        </CardHeader>
        <CardContent className="pb-2">
          {/* Installed with `dsgn add recipe:team-members` — the table, the
              role badges and the per-row menu arrive as one composed file,
              then the sample rows get replaced with this workspace's own. */}
          <TeamMembers />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(ROLE_NOTES).map(([roleName, note]) => (
          <Card key={roleName} className="p-5">
            <p className="text-sm font-medium">{roleName}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{note}</p>
          </Card>
        ))}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              They get an email with a link that expires in seven days.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                Work email
              </label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@northbridge.dev"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span id="invite-role-label" className="text-sm font-medium">
                Role
              </span>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger aria-labelledby="invite-role-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{ROLE_NOTES[role]}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={sendInvite}>
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
