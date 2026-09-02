"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Card } from "@/components/dsgn/card";
import { Toggle } from "@/components/dsgn/toggle";
import { Progress } from "@/components/dsgn/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dsgn/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/dsgn/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/dsgn/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/dsgn/alert-dialog";
import { toast } from "@/components/dsgn/use-toast";
import { UserHoverCard } from "@/components/design-social/user-hover-card";
import {
  ChevronIcon,
  EchoIcon,
  MoreIcon,
  PlusIcon,
  ReplyIcon,
  SparkIcon,
  VerifiedIcon,
} from "@/components/design-social/icons";
import { personByHandle, pollTotal, roomBySlug, type Pulse } from "@/lib/design-social/feed";
import { compactCount, initials, relativeTime } from "@/lib/design-social/format";
import { cn } from "@/lib/utils";

/**
 * Thrum's reactions.
 *
 * Short mono tokens rather than emoji: the set is part of the product's
 * voice, and an emoji picker would render differently on every platform the
 * screenshots get taken on.
 */
const REACTIONS = [
  { id: "same", token: "same", hint: "I have also done this" },
  { id: "2am", token: "2am", hint: "Posted at an unreasonable hour" },
  { id: "ship", token: "ship", hint: "Finish it and post it" },
  { id: "how", token: "how?", hint: "Explain the build" },
  { id: "oof", token: "oof", hint: "Sympathy for the smoke" },
  { id: "loud", token: "!!", hint: "No further comment" },
] as const;

interface PulseCardProps {
  pulse: Pulse;
  /** Cascade position for the reveal animation. Capped by the caller. */
  index?: number;
  onOpenThread: (pulseId: string) => void;
  onOpenProfile: (handle: string) => void;
  onOpenRoom?: (slug: string) => void;
  className?: string;
}

/**
 * One pulse in the feed.
 *
 * State here is deliberately local and additive — sparking, reacting and
 * muting layer on top of the seed record rather than mutating it, so
 * "un-spark" is just dropping the layer rather than an inverse operation
 * that has to reconstruct the original count. Same non-destructive shape the
 * dsgn philosophy's third pillar describes for editors, applied to a feed.
 */
export function PulseCard({
  pulse,
  index = 0,
  onOpenThread,
  onOpenProfile,
  onOpenRoom,
  className,
}: PulseCardProps) {
  const author = personByHandle(pulse.author);
  const room = roomBySlug(pulse.room);

  const [sparked, setSparked] = React.useState(pulse.sparked);
  const [echoed, setEchoed] = React.useState(false);
  const [reactions, setReactions] = React.useState<string[]>([]);
  const [repliesOpen, setRepliesOpen] = React.useState(false);
  const [muteOpen, setMuteOpen] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [voted, setVoted] = React.useState<number | null>(null);

  const sparkCount = pulse.sparks + (sparked === pulse.sparked ? 0 : sparked ? 1 : -1);
  const echoCount = pulse.echoes + (echoed ? 1 : 0);

  function toggleReaction(id: string) {
    setReactions((current) =>
      current.includes(id) ? current.filter((r) => r !== id) : [...current, id],
    );
  }

  function copyLink() {
    // Clipboard access is permission-gated and absent in insecure contexts;
    // the toast has to tell the truth either way rather than always claiming
    // success.
    const url = `https://thrum.example/${pulse.author}/${pulse.id}`;
    navigator.clipboard?.writeText(url).then(
      () => toast({ title: "Link copied", description: url }),
      () =>
        toast({
          variant: "destructive",
          title: "Couldn't copy",
          description: "Your browser blocked clipboard access.",
        }),
    );
  }

  if (muted) {
    return (
      <Card
        data-reveal
        style={{ "--reveal-index": index } as React.CSSProperties}
        className={cn(
          "flex items-center justify-between gap-4 border-dashed bg-transparent p-4 shadow-none",
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">
          Muted <span className="font-mono text-xs">@{author.handle}</span> — this pulse is hidden.
        </p>
        <Button variant="ghost" size="xs" onClick={() => setMuted(false)}>
          Undo
        </Button>
      </Card>
    );
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card
            data-reveal
            style={{ "--reveal-index": index } as React.CSSProperties}
            className={cn(
              "group/pulse relative overflow-hidden p-4 sm:p-5",
              // The card's own top highlight — a 1px inner light line, not a
              // border, so it survives the rounded corner without doubling up
              // on the border already drawn by Card.
              "shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--ink)_9%,transparent),var(--elev-sm)]",
              "transition-[transform,box-shadow] duration-300 ease-[var(--ease-fluid)]",
              "hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--ink)_14%,transparent),var(--elev-md)]",
              className,
            )}
          >
            <header className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onOpenProfile(author.handle)}
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Open ${author.name}'s profile`}
              >
                <Avatar className="h-10 w-10 ring-1 ring-border transition-transform duration-300 ease-[var(--ease-spring)] hover:scale-105">
                  <AvatarFallback className="bg-elevated font-display text-xs font-bold text-foreground">
                    {initials(author.name)}
                  </AvatarFallback>
                </Avatar>
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <UserHoverCard
                    handle={author.handle}
                    onOpenProfile={onOpenProfile}
                    className="font-display text-[0.95rem] font-bold leading-tight tracking-tight"
                  >
                    {author.name}
                  </UserHoverCard>
                  {author.verified && (
                    <VerifiedIcon
                      className="h-4 w-4 text-accent"
                      aria-label="Verified maker"
                    />
                  )}
                  {/* Handle, separator and timestamp wrap as one unit. Split
                      across three flex children, the separator strands itself
                      at the end of a line at phone widths and reads as a typo
                      rather than a divider. */}
                  <span className="inline-flex min-w-0 items-baseline gap-1.5">
                    <span className="truncate font-mono text-xs text-ink-faint">
                      @{author.handle}
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-ink-faint">
                      ·
                    </span>
                    <time className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">
                      {relativeTime(pulse.minutesAgo)}
                    </time>
                  </span>
                </div>
                {room && (
                  <button
                    type="button"
                    onClick={() => onOpenRoom?.(room.slug)}
                    className="mt-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Badge
                      variant="outline"
                      className="border-border/80 bg-elevated/50 font-mono text-[0.68rem] text-muted-foreground transition-colors hover:border-accent/60 hover:text-foreground"
                    >
                      ~{room.slug}
                    </Badge>
                  </button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`More options for ${author.name}'s pulse`}
                    className="-mr-1 -mt-1 text-ink-faint hover:text-foreground"
                  >
                    <MoreIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Pulse</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={copyLink}>Copy link</DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      toast({
                        title: "Saved to your shelf",
                        description: `${author.name}'s pulse in ~${pulse.room}.`,
                      })
                    }
                  >
                    Save to shelf
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setMuteOpen(true)}>
                    Mute @{author.handle}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    onSelect={() =>
                      toast({
                        title: "Report sent",
                        description: "A room moderator will look at this within a day.",
                      })
                    }
                  >
                    Report to moderators
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>

            <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/90">{pulse.body}</p>

            {pulse.poll && (
              <PollBlock
                poll={pulse.poll}
                voted={voted}
                onVote={(i) => {
                  setVoted(i);
                  toast({ title: "Vote counted", description: pulse.poll?.options[i].label });
                }}
              />
            )}

            {reactions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {reactions.map((id) => {
                  const r = REACTIONS.find((x) => x.id === id);
                  if (!r) return null;
                  return (
                    <span
                      key={id}
                      className="grad-ring inline-flex items-center gap-1 rounded-full bg-elevated px-2.5 py-0.5 font-mono text-[0.7rem] text-foreground"
                    >
                      {r.token}
                      <span className="text-ink-faint">1</span>
                    </span>
                  );
                })}
              </div>
            )}

            <footer className="mt-4 flex items-center gap-1">
              <ActionButton
                label="Reply"
                count={pulse.replies.length}
                onClick={() => onOpenThread(pulse.id)}
              >
                <ReplyIcon className="h-[1.05rem] w-[1.05rem]" />
              </ActionButton>

              <ActionButton
                label={echoed ? "Undo echo" : "Echo"}
                count={echoCount}
                active={echoed}
                onClick={() => {
                  setEchoed((e) => !e);
                  if (!echoed) toast({ title: "Echoed to your followers" });
                }}
              >
                <EchoIcon className="h-[1.05rem] w-[1.05rem]" />
              </ActionButton>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={sparked}
                    onPressedChange={setSparked}
                    aria-label={sparked ? "Remove spark" : "Spark this pulse"}
                    size="sm"
                    className={cn(
                      "gap-1.5 rounded-full px-2.5 font-mono text-xs text-ink-faint",
                      "transition-transform duration-300 ease-[var(--ease-spring)] active:scale-90",
                      // Registry default for data-[state=on] is a solid accent
                      // fill; a filled pill in a row of ghost actions reads as
                      // a primary CTA rather than a toggled state, so it's
                      // overridden to a tinted chip here.
                      "data-[state=on]:bg-accent/15 data-[state=on]:text-accent",
                    )}
                  >
                    <SparkIcon
                      className={cn(
                        "h-[1.05rem] w-[1.05rem] transition-transform duration-300 ease-[var(--ease-spring)]",
                        sparked && "scale-110",
                      )}
                    />
                    <span className="tnum">{compactCount(sparkCount)}</span>
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>{sparked ? "Sparked" : "Spark"}</TooltipContent>
              </Tooltip>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Add a reaction"
                    className="rounded-full text-ink-faint hover:text-foreground"
                  >
                    <PlusIcon className="h-[1.05rem] w-[1.05rem]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2">
                  <p className="px-1 pb-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
                    React
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {REACTIONS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        title={r.hint}
                        onClick={() => toggleReaction(r.id)}
                        aria-pressed={reactions.includes(r.id)}
                        className={cn(
                          "rounded-md px-3 py-1.5 font-mono text-xs transition-colors outline-none",
                          "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                          reactions.includes(r.id)
                            ? "bg-accent/15 text-accent"
                            : "text-muted-foreground",
                        )}
                      >
                        {r.token}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </footer>

            {pulse.replies.length > 0 && (
              <Collapsible open={repliesOpen} onOpenChange={setRepliesOpen} className="mt-3">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "group/rep flex w-full items-center gap-1.5 rounded-md py-1 text-left",
                      "font-mono text-[0.72rem] text-ink-faint outline-none transition-colors",
                      "hover:text-accent focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <ChevronIcon
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300 ease-[var(--ease-fluid)]",
                        repliesOpen && "rotate-180",
                      )}
                    />
                    {repliesOpen
                      ? "Hide thread"
                      : `${pulse.replies.length} ${pulse.replies.length === 1 ? "reply" : "replies"}`}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-1 space-y-3 border-l border-border pl-4">
                    {pulse.replies.map((reply) => {
                      const person = personByHandle(reply.author);
                      return (
                        <li key={reply.id} className="flex gap-2.5">
                          <Avatar className="mt-0.5 h-7 w-7 ring-1 ring-border">
                            <AvatarFallback className="bg-elevated text-[0.6rem] font-bold">
                              {initials(person.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
                              <span className="font-semibold text-foreground">{person.name}</span>
                              <span className="font-mono text-ink-faint">@{person.handle}</span>
                              <span className="font-mono tabular-nums text-ink-faint">
                                {relativeTime(reply.minutesAgo)}
                              </span>
                            </p>
                            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                              {reply.body}
                            </p>
                            <p className="mt-1 font-mono text-[0.68rem] tabular-nums text-ink-faint">
                              {compactCount(reply.sparks)} sparks
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}
          </Card>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56">
          <ContextMenuItem onSelect={() => onOpenThread(pulse.id)}>
            Open thread
            <ContextMenuShortcut>↵</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={copyLink}>
            Copy link
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => onOpenProfile(author.handle)}>
            View @{author.handle}
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setMuteOpen(true)}>
            Mute @{author.handle}
          </ContextMenuItem>
          <ContextMenuItem
            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
            onSelect={() =>
              toast({
                title: "Report sent",
                description: "A room moderator will look at this within a day.",
              })
            }
          >
            Report to moderators
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={muteOpen} onOpenChange={setMuteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mute @{author.handle}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their pulses stop appearing in your feed and rooms. They are not told, and you can
              undo it from the muted card that replaces this one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep showing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setMuted(true);
                toast({ title: `Muted @${author.handle}`, description: "Undo from the feed." });
              }}
            >
              Mute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ActionButtonProps {
  label: string;
  count: number;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

/** A ghost icon+count action, tooltipped because the icon carries the meaning. */
function ActionButton({ label, count, active, onClick, children }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          aria-label={`${label} (${count})`}
          className={cn(
            "gap-1.5 rounded-full px-2.5 font-mono text-xs",
            "transition-transform duration-300 ease-[var(--ease-spring)] active:scale-90",
            active ? "text-accent" : "text-ink-faint hover:text-foreground",
          )}
        >
          {children}
          <span className="tnum">{compactCount(count)}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** A poll inside a pulse. Before voting the tallies stay hidden — showing
 *  them first would bias the vote it is trying to collect. */
function PollBlock({
  poll,
  voted,
  onVote,
}: {
  poll: NonNullable<Pulse["poll"]>;
  voted: number | null;
  onVote: (index: number) => void;
}) {
  const total = pollTotal(poll);

  return (
    <div className="mt-4 rounded-lg border border-border bg-elevated/40 p-3.5">
      <p className="font-display text-sm font-bold tracking-tight">{poll.question}</p>
      <ul className="mt-3 space-y-2.5">
        {poll.options.map((option, i) => {
          const share = total === 0 ? 0 : Math.round((option.votes / total) * 100);
          const isChoice = voted === i;
          return (
            <li key={option.label}>
              {voted === null ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVote(i)}
                  className="h-9 w-full justify-start border-border/70 px-3 text-left text-xs font-normal hover:border-accent/60"
                >
                  {option.label}
                </Button>
              ) : (
                <div>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                    <span className={cn("truncate", isChoice && "font-semibold text-accent")}>
                      {option.label}
                    </span>
                    <span className="tnum shrink-0 font-mono text-ink-faint">{share}%</span>
                  </div>
                  <div data-meter style={{ "--reveal-index": i } as React.CSSProperties}>
                    <Progress
                      value={share}
                      className={cn("h-1.5 bg-muted", !isChoice && "opacity-45")}
                      aria-label={option.label}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 font-mono text-[0.68rem] tabular-nums text-ink-faint">
        {compactCount(total)} votes · closes in {relativeTime(poll.closesInMinutes)}
      </p>
    </div>
  );
}
