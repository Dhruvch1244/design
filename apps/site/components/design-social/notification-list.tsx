import { Badge } from "@/components/dsgn/badge";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/dsgn/card";
import { cn } from "@/lib/utils";

/*
 * LOCAL EDIT — installed via `dsgn add recipe:notification-list`.
 *
 * Two changes from the shipped recipe, both because a recipe is a starting
 * shape rather than a finished component:
 *
 * 1. The three hardcoded placeholder rows ("Priya Nair commented on your pull
 *    request") were replaced by an `items` prop. As shipped the recipe renders
 *    a fixed const array, so a second instance on the same page would show
 *    identical rows — fine for a docs example, useless in an app.
 * 2. `title` and `className` were added and the recipe's own `max-w-sm` was
 *    dropped, so the card can size to whatever column it is placed in.
 *
 * Everything else — the card chrome, the avatar/badge composition, the unread
 * dot — is the recipe as installed.
 */

export interface NotificationItem {
  /** Avatar fallback text; this project has no image assets. */
  initials: string;
  text: string;
  time: string;
  unread: boolean;
}

export interface NotificationListProps {
  items: NotificationItem[];
  title?: string;
  className?: string;
}

export function NotificationList({
  items,
  title = "Notifications",
  className,
}: NotificationListProps) {
  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {unreadCount > 0 && <Badge variant="accent">{unreadCount} new</Badge>}
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-md p-2 -mx-2 hover:bg-muted/50">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>{item.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">{item.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
            </div>
            {item.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
