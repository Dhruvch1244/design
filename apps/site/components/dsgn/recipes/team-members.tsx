import { Button } from "@/components/dsgn/button";
import { Badge } from "@/components/dsgn/badge";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/dsgn/dropdown-menu";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/dsgn/table";

/* Recipe sample rows replaced with this workspace's own people — the recipe
   ships placeholder @acme.co addresses, which is exactly the kind of filler
   a real screenshot shouldn't carry. */
const MEMBERS = [
  { name: "Rosa Marchetti", email: "rosa@northbridge.dev", role: "Owner", initials: "RM" },
  { name: "Dan Whitlock", email: "dan@northbridge.dev", role: "Admin", initials: "DW" },
  { name: "Ingrid Sørensen", email: "ingrid@northbridge.dev", role: "Admin", initials: "IS" },
  { name: "Tobi Adeyemi", email: "tobi@northbridge.dev", role: "Member", initials: "TA" },
  { name: "Mira Kaur", email: "mira@northbridge.dev", role: "Member", initials: "MK" },
] as const;

const ROLE_VARIANT = {
  Owner: "accent",
  Admin: "secondary",
  Member: "outline",
} as const;

export function TeamMembers() {
  return (
    /* max-w-lg and the double border/radius removed: the recipe is written to
       stand alone on a docs page, but here it sits inside a Card that already
       supplies both, and its own 32rem cap would leave the card half empty. */
    <div className="w-full">
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
