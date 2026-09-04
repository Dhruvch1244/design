import { Button } from "../../components/button/button";
import { Badge } from "../../components/badge/badge";
import { Avatar, AvatarFallback } from "../../components/avatar/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../components/dropdown-menu/dropdown-menu";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/table/table";

const MEMBERS = [
  { name: "Priya Nair", email: "priya@acme.co", role: "Owner", initials: "PN" },
  { name: "Sam Okafor", email: "sam@acme.co", role: "Admin", initials: "SO" },
  { name: "Jules Bianchi", email: "jules@acme.co", role: "Member", initials: "JB" },
] as const;

const ROLE_VARIANT = {
  Owner: "accent",
  Admin: "secondary",
  Member: "outline",
} as const;

export function TeamMembers() {
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {MEMBERS.map((member) => (
            <TableRow key={member.email}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={ROLE_VARIANT[member.role]}>{member.role}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${member.name}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Change role</DropdownMenuItem>
                    <DropdownMenuItem>Resend invite</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
