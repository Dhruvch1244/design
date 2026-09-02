"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dsgn/dialog";
import { Button } from "@/components/dsgn/button";
import { Textarea } from "@/components/dsgn/textarea";
import { Avatar, AvatarFallback } from "@/components/dsgn/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/dsgn/radio-group";
import { Separator } from "@/components/dsgn/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { toast } from "@/components/dsgn/use-toast";
import { joinedRooms, VIEWER } from "@/lib/design-social/feed";
import { initials } from "@/lib/design-social/format";
import { cn } from "@/lib/utils";

/** Thrum's per-pulse character budget. Over it, posting is blocked. */
const LIMIT = 420;

type ReplyPolicy = "everyone" | "room" | "following";

const POLICIES: { value: ReplyPolicy; label: string; hint: string }[] = [
  { value: "everyone", label: "Everyone", hint: "Anyone on Thrum can reply." },
  { value: "room", label: "Room members", hint: "Only people who joined the room." },
  { value: "following", label: "People you follow", hint: "The quietest option." },
];

interface ComposeDialogProps {
  /** The trigger element. Wrapped in DialogTrigger asChild, so pass one node. */
  children: React.ReactNode;
}

/**
 * The composer.
 *
 * Draft state is kept until the dialog is *successfully* posted or explicitly
 * discarded — closing with Escape or the overlay keeps the text, so a stray
 * click never silently destroys something the user typed. That is the
 * non-destructive pillar at its smallest useful scale.
 */
export function ComposeDialog({ children }: ComposeDialogProps) {
  const rooms = joinedRooms();
  const [open, setOpen] = React.useState(false);
  const [body, setBody] = React.useState("");
  const [room, setRoom] = React.useState(rooms[0]?.slug ?? "");
  const [policy, setPolicy] = React.useState<ReplyPolicy>("everyone");

  const used = body.trim().length;
  const over = used > LIMIT;
  const canPost = used > 0 && !over;
  const remaining = LIMIT - used;

  function post() {
    if (!canPost) return;
    setOpen(false);
    setBody("");
    toast({
      title: "Pulse posted",
      description: `Live in ~${room}. Replies: ${
        POLICIES.find((p) => p.value === policy)?.label.toLowerCase() ?? "everyone"
      }.`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight">
            New pulse
          </DialogTitle>
          <DialogDescription>
            Post it before you talk yourself out of it.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 flex gap-3">
          <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border">
            <AvatarFallback className="bg-elevated font-display text-xs font-bold text-foreground">
              {initials(VIEWER.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              autoFocus
              placeholder="What did you make instead of sleeping?"
              aria-label="Pulse body"
              aria-describedby="compose-count"
              aria-invalid={over || undefined}
              className={cn(
                "resize-none border-border/70 bg-transparent text-[0.95rem] leading-relaxed",
                over && "border-destructive focus-visible:ring-destructive",
              )}
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p
                id="compose-count"
                aria-live="polite"
                className={cn(
                  "tnum font-mono text-xs",
                  over ? "text-destructive" : remaining < 60 ? "text-accent" : "text-ink-faint",
                )}
              >
                {remaining} left
              </p>
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="h-8 w-44 rounded-full border-border/70 font-mono text-xs">
                  <SelectValue placeholder="Choose a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.slug} value={r.slug} className="font-mono text-xs">
                      ~{r.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        <fieldset>
          <legend className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
            Who can reply
          </legend>
          <RadioGroup
            value={policy}
            onValueChange={(v) => setPolicy(v as ReplyPolicy)}
            className="mt-3 grid gap-2 sm:grid-cols-3"
          >
            {POLICIES.map((p) => (
              <label
                key={p.value}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors",
                  policy === p.value
                    ? "border-accent/60 bg-accent/10"
                    : "border-border hover:border-border/60 hover:bg-muted/40",
                )}
              >
                <RadioGroupItem value={p.value} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{p.label}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-faint">{p.hint}</span>
                </span>
              </label>
            ))}
          </RadioGroup>
        </fieldset>

        <DialogFooter className="mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setBody("");
              setOpen(false);
            }}
          >
            Discard
          </Button>
          <Button variant="glow" disabled={!canPost} onClick={post} className="px-7">
            Post pulse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
