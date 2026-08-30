import { Badge } from "../components/badge/badge";
import { Avatar, AvatarFallback } from "../components/avatar/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../components/card/card";

const NOTIFICATIONS = [
  {
    initials: "PN",
    text: "Priya Nair commented on your pull request.",
    time: "2m ago",
    unread: true,
  },
  {
    initials: "SO",
    text: "Sam Okafor invited you to the Design team.",
    time: "1h ago",
    unread: true,
  },
  {
    initials: "JB",
    text: "Jules Bianchi approved your changes.",
    time: "Yesterday",
    unread: false,
  },
] as const;

export function NotificationList() {
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Notifications</CardTitle>
        {unreadCount > 0 && <Badge variant="accent">{unreadCount} new</Badge>}
      </CardHeader>
      <CardContent className="space-y-1">
        {NOTIFICATIONS.map((item, i) => (
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
