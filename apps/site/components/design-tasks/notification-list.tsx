import { Badge } from "@/components/dsgn/badge";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/dsgn/card";

/*
 * LOCAL EDIT — installed via `npx @dhruvchoudhary/dsgn add recipe:notification-list`.
 *
 * Two changes from the shipped recipe, both recorded in the README:
 *
 * 1. The hardcoded NOTIFICATIONS array became an `items` prop. As shipped
 *    the recipe is a static demo; a real activity feed differs per task, and
 *    the placeholder people in it are not this project's cast.
 * 2. Added `asPanel`. The feed is used twice here — as a standalone card in
 *    the sidebar rail, and inline inside the task sheet, where the sheet is
 *    already a card surface and a second card-on-card reads as a mistake.
 *    `asPanel={false}` drops the chrome and keeps the rows.
 */

export interface NotificationItem {
  id: string;
  initials: string;
  text: string;
  time: string;
  unread: boolean;
}

export interface NotificationListProps {
  title?: string;
  items: NotificationItem[];
  asPanel?: boolean;
  className?: string;
}

export function NotificationList({
  title = "Activity",
  items,
  asPanel = true,
  className,
}: NotificationListProps) {
  const unreadCount = items.filter((n) => n.unread).length;

  const rows = (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="-mx-2 flex items-start gap-3 rounded-md p-2 transition-colors duration-300 ease-[var(--ease-fluid)] hover:bg-muted/60"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-accent/14 text-[0.6875rem] font-semibold text-accent">
              {item.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug">{item.text}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{item.time}</p>
          </div>
          {item.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
        </div>
      ))}
    </div>
  );

  if (!asPanel) {
    return (
      <div className={className}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
            {title}
          </h3>
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="border-transparent bg-accent/12 text-[0.6875rem] text-accent"
            >
              {unreadCount} new
            </Badge>
          )}
        </div>
        {rows}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {unreadCount > 0 && (
          <Badge
            variant="secondary"
            className="border-transparent bg-accent/12 text-[0.6875rem] text-accent"
          >
            {unreadCount} new
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">{rows}</CardContent>
    </Card>
  );
}
