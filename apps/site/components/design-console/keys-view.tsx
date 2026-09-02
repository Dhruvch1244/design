"use client";

import * as React from "react";
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
import { Badge } from "@/components/dsgn/badge";
import { Button } from "@/components/dsgn/button";
import { Checkbox } from "@/components/dsgn/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/dsgn/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dsgn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dsgn/dropdown-menu";
import { EmptyState } from "@/components/dsgn/empty-state";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/dsgn/hover-card";
import { Input } from "@/components/dsgn/input";
import { ScrollArea } from "@/components/dsgn/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dsgn/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { toast } from "@/components/dsgn/use-toast";
import { CodeBlock, FieldLabel, Panel } from "@/components/design-console/panel";
import { CopyButton } from "@/components/design-console/copy-button";
import { EnvironmentChip } from "@/components/design-console/status-chip";
import {
  IconEye,
  IconEyeOff,
  IconKey,
  IconMore,
  IconPlus,
  IconWarning,
} from "@/components/design-console/icons";
import {
  API_KEYS,
  AVAILABLE_SCOPES,
  SNAPSHOT_AT,
  type ApiKey,
  type Environment,
} from "@/lib/design-console/console";
import { absoluteTime, compactNumber, fullKey, maskedKey, relativeTime } from "@/lib/design-console/format";
import { cn } from "@/lib/utils";

type PendingAction = { kind: "rotate" | "revoke"; key: ApiKey } | null;

export function KeysView({ environment }: { environment: Environment }) {
  /*
   * A local copy, seeded once. API_KEYS itself is never written to — the same
   * non-destructive rule the flags view applies to staged toggles, applied
   * here to the seed data so a "revoke" in one session can't leak into
   * another view's idea of what exists.
   */
  const [keys, setKeys] = React.useState<ApiKey[]>(() => API_KEYS.map((k) => ({ ...k })));
  const [revealed, setRevealed] = React.useState<ReadonlySet<string>>(() => new Set());
  const [pending, setPending] = React.useState<PendingAction>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [issued, setIssued] = React.useState<ApiKey | null>(null);

  const visible = keys.filter((key) => key.environment === environment);

  function toggleReveal(id: string) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmPending() {
    if (!pending) return;
    const { kind, key } = pending;

    if (kind === "revoke") {
      // The row stays. Removing it would hide the fact that a key ever
      // existed, which is exactly the "my data disappeared" failure the
      // trust-the-data rule is about — a revoked key is still an audit fact.
      setKeys((current) =>
        current.map((k) =>
          k.id === key.id ? { ...k, status: "revoked", requests24h: 0, lastUsedAt: k.lastUsedAt } : k,
        ),
      );
      toast({
        variant: "destructive",
        title: `Revoked ${key.label}`,
        description: "Requests signed with this key now fail with 401. The row stays for audit.",
      });
    } else {
      const rotated: ApiKey = {
        ...key,
        prefix: `${key.prefix.slice(0, 8)}${randomChunk(4)}`,
        secret: randomChunk(24),
        createdAt: SNAPSHOT_AT,
      };
      setKeys((current) => current.map((k) => (k.id === key.id ? rotated : k)));
      setIssued(rotated);
      toast({
        title: `Rotated ${key.label}`,
        description: "The previous secret stays valid for 24 hours.",
      });
    }
    setPending(null);
  }

  return (
    <div className="space-y-4">
      <Panel
        kicker={`${visible.length} key${visible.length === 1 ? "" : "s"} · ${environment}`}
        title="Active credentials"
        description="Secrets are shown once at creation. Revealing one here re-reads it from the vault and is written to the audit log."
        padded={false}
        actions={
          <Button variant="glow" size="sm" leftIcon={<IconPlus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            New key
          </Button>
        }
      >
        {visible.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              icon={<IconKey className="h-7 w-7" />}
              title={`No keys in ${environment}`}
              description="Create a key scoped to this environment to start signing requests against it."
              action={
                <Button variant="soft" size="sm" onClick={() => setCreateOpen(true)}>
                  Create a key
                </Button>
              }
              className="border-border/70 bg-[var(--void)]/30"
            />
          </div>
        ) : (
          /*
           * Horizontal scroll, not stacked cards. A key list is scanned by
           * comparing one column across rows ("which of these was used
           * recently?"), and a card stack destroys that. The three columns a
           * phone can't fit are hidden outright rather than squeezed, the
           * key column gets a fixed min-width so it never wraps mid-secret,
           * and .scroll-hint fades the right edge so the affordance is
           * visible before the user tries.
           */
          <div className="scroll-hint relative">
            <Table className="min-w-[640px] text-[13px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4 sm:pl-5">Key</TableHead>
                  <TableHead className="hidden lg:table-cell">Scopes</TableHead>
                  <TableHead className="hidden text-right md:table-cell">24h</TableHead>
                  <TableHead className="text-right">Last used</TableHead>
                  <TableHead className="w-12 pr-12 text-right xl:pr-5">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((key) => (
                  <KeyRow
                    key={key.id}
                    apiKey={key}
                    revealed={revealed.has(key.id)}
                    onToggleReveal={() => toggleReveal(key.id)}
                    onRotate={() => setPending({ kind: "rotate", key })}
                    onRevoke={() => setPending({ kind: "revoke", key })}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      <p className="flex items-start gap-2 px-1 text-[12px] text-ink-faint">
        <IconWarning className="mt-px h-3.5 w-3.5 shrink-0" />
        Rotating issues a new secret immediately and keeps the previous one valid for 24 hours.
        Revoking takes effect at the edge within 30 seconds and cannot be undone.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel
          kicker="quickstart"
          title="Signing a request"
          description="Every call carries the key as a bearer token and names the project it targets."
          revealIndex={1}
        >
          <CodeBlock className="max-h-none">
            {`curl https://api.voltgate.dev/v1/sessions \\\n  -H "Authorization: Bearer ${visible[0]?.prefix ?? "vg_live_XXXX"}…" \\\n  -H "Voltgate-Project: helios-edge" \\\n  -d '{"playlist":"ranked-duo","region":"eu-west-1"}'`}
          </CodeBlock>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
            A key missing the scope for a route fails with{" "}
            <span className="font-mono text-signal-warn">403</span> and names the exact scope it
            needed — never a generic &ldquo;forbidden&rdquo;.
          </p>
        </Panel>

        <Panel
          kicker="reference"
          title="Scopes"
          description="What each scope grants, and how many live keys currently hold it."
          padded={false}
          revealIndex={2}
        >
          {/* Fixed-height ScrollArea rather than a growing list: this panel
              sits beside a code block of known height, and a reference list
              that stretches the row is worse than one that scrolls. */}
          <ScrollArea className="h-[248px]">
            <ul className="divide-y divide-border/50">
              {AVAILABLE_SCOPES.map((scope) => {
                const holders = visible.filter(
                  (key) => key.status === "active" && key.scopes.includes(scope.value),
                ).length;
                return (
                  <li
                    key={scope.value}
                    className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-5"
                  >
                    <div className="min-w-0">
                      <code className="block truncate font-mono text-[12px] text-foreground">
                        {scope.label}
                      </code>
                      <span className="block text-[11.5px] text-ink-faint">{scope.detail}</span>
                    </div>
                    <span
                      className={cn(
                        "tnum shrink-0 font-mono text-[11.5px]",
                        holders === 0 ? "text-ink-faint" : "text-cyan",
                      )}
                    >
                      {holders} key{holders === 1 ? "" : "s"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </Panel>
      </div>

      <ConfirmDialog pending={pending} onOpenChange={(open) => !open && setPending(null)} onConfirm={confirmPending} />

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        environment={environment}
        onCreate={(created) => {
          setKeys((current) => [created, ...current]);
          setIssued(created);
          setCreateOpen(false);
          toast({ title: `Created ${created.label}`, description: "Copy the secret now — it is not shown again." });
        }}
      />

      <IssuedSecretDialog issued={issued} onOpenChange={(open) => !open && setIssued(null)} />
    </div>
  );
}

function KeyRow({
  apiKey,
  revealed,
  onToggleReveal,
  onRotate,
  onRevoke,
}: {
  apiKey: ApiKey;
  revealed: boolean;
  onToggleReveal: () => void;
  onRotate: () => void;
  onRevoke: () => void;
}) {
  const isRevoked = apiKey.status === "revoked";
  const shown = revealed && !isRevoked;
  const value = shown ? fullKey(apiKey.prefix, apiKey.secret) : maskedKey(apiKey.prefix);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow
          className={cn(
            "border-border/60 transition-colors",
            isRevoked && "opacity-55 hover:opacity-80",
          )}
        >
          <TableCell className="py-2.5 pl-4 sm:pl-5">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <span className="cursor-default truncate text-[13px] font-medium text-foreground">
                      {apiKey.label}
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72" align="start">
                    <p className="text-[13px] font-medium text-foreground">{apiKey.label}</p>
                    <dl className="mt-2 space-y-1.5 text-[11.5px]">
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-faint">Created</dt>
                        <dd className="font-mono text-ink-soft">{absoluteTime(apiKey.createdAt)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-faint">By</dt>
                        <dd className="text-ink-soft">{apiKey.createdBy}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-faint">Scopes</dt>
                        <dd className="text-right font-mono text-ink-soft">
                          {apiKey.scopes.join(", ")}
                        </dd>
                      </div>
                    </dl>
                  </HoverCardContent>
                </HoverCard>
                <EnvironmentChip environment={apiKey.environment} />
                {isRevoked && (
                  <Badge
                    variant="outline"
                    className="rounded px-1.5 py-0 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                  >
                    revoked
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                <code
                  className={cn(
                    "truncate font-mono text-[12px]",
                    shown ? "text-cyan" : "text-ink-soft",
                  )}
                >
                  {value}
                </code>
                {!isRevoked && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={onToggleReveal}
                          aria-label={shown ? `Hide secret for ${apiKey.label}` : `Reveal secret for ${apiKey.label}`}
                          className="h-6 w-6 shrink-0 text-ink-faint hover:text-cyan"
                        >
                          {shown ? <IconEyeOff className="h-3.5 w-3.5" /> : <IconEye className="h-3.5 w-3.5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{shown ? "Hide secret" : "Reveal secret (audited)"}</TooltipContent>
                    </Tooltip>
                    <CopyButton
                      value={fullKey(apiKey.prefix, apiKey.secret)}
                      label="API key"
                      className="h-6 w-6 shrink-0"
                    />
                  </>
                )}
              </div>
            </div>
          </TableCell>

          <TableCell className="hidden py-2.5 lg:table-cell">
            <ScopeList scopes={apiKey.scopes} />
          </TableCell>

          <TableCell className="tnum hidden py-2.5 text-right font-mono text-[12.5px] text-ink-soft md:table-cell">
            {apiKey.requests24h === 0 ? (
              <span className="text-ink-faint">—</span>
            ) : (
              compactNumber(apiKey.requests24h)
            )}
          </TableCell>

          <TableCell className="py-2.5 text-right">
            {apiKey.lastUsedAt === null ? (
              <span className="text-[12px] text-ink-faint">never</span>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default font-mono text-[12px] text-ink-soft">
                    {relativeTime(apiKey.lastUsedAt, SNAPSHOT_AT)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{absoluteTime(apiKey.lastUsedAt)}</TooltipContent>
              </Tooltip>
            )}
          </TableCell>

          <TableCell className="py-2.5 pr-12 text-right xl:pr-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${apiKey.label}`}
                  className="text-ink-faint hover:text-foreground"
                >
                  <IconMore className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate text-[11px] text-ink-faint">
                  {apiKey.label}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={isRevoked} onSelect={onToggleReveal}>
                  {shown ? "Hide secret" : "Reveal secret"}
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isRevoked} onSelect={onRotate}>
                  Rotate secret
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isRevoked}
                  onSelect={onRevoke}
                  className="text-signal-bad focus:text-signal-bad"
                >
                  Revoke key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>

      {/*
        The same actions on right-click. Not a duplicate for its own sake:
        the "…" button is a 32px target at the far right of a scrollable
        table, and on a wide screen right-clicking the row you are already
        reading is materially faster.
      */}
      <ContextMenuContent className="w-56">
        <ContextMenuLabel className="truncate text-[11px] text-ink-faint">
          {apiKey.label}
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={isRevoked} onSelect={onToggleReveal}>
          {shown ? "Hide secret" : "Reveal secret"}
          <ContextMenuShortcut>⌥R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled={isRevoked} onSelect={onRotate}>
          Rotate secret
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={isRevoked}
          onSelect={onRevoke}
          className="text-signal-bad focus:text-signal-bad"
        >
          Revoke key
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/** Shows two scopes inline and folds the rest into a tooltip — a key with
 *  seven scopes must not make its row three lines tall. */
function ScopeList({ scopes }: { scopes: string[] }) {
  const inline = scopes.slice(0, 2);
  const rest = scopes.slice(2);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {inline.map((scope) => (
        <Badge
          key={scope}
          variant="outline"
          className="rounded px-1.5 py-0 font-mono text-[10.5px] text-ink-soft"
        >
          {scope}
        </Badge>
      ))}
      {rest.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-default rounded border-dashed px-1.5 py-0 font-mono text-[10.5px] text-ink-faint"
            >
              +{rest.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <span className="font-mono text-[11px]">{rest.join(", ")}</span>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function ConfirmDialog({
  pending,
  onOpenChange,
  onConfirm,
}: {
  pending: PendingAction;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const isRevoke = pending?.kind === "revoke";
  return (
    <AlertDialog open={pending !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bezel">
        <AlertDialogHeader>
          <AlertDialogTitle className="display text-xl">
            {isRevoke ? "Revoke this key?" : "Rotate this secret?"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-[13px]">
              <p>
                {isRevoke
                  ? "Every request signed with this key starts failing with 401 within 30 seconds. This cannot be undone."
                  : "A new secret is issued immediately. The current one keeps working for 24 hours, then stops."}
              </p>
              {pending && (
                <div className="rounded-md border border-border/70 bg-[var(--void)]/50 p-3">
                  <p className="text-[13px] font-medium text-foreground">{pending.key.label}</p>
                  <p className="mt-1 font-mono text-[11.5px] text-ink-soft">
                    {maskedKey(pending.key.prefix)}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-ink-faint">
                    {pending.key.requests24h > 0
                      ? `${compactNumber(pending.key.requests24h)} requests in the last 24h`
                      : "No traffic in the last 24h"}
                    {" · "}
                    {pending.key.environment}
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isRevoke ? "Revoke key" : "Rotate secret"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function randomChunk(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function CreateKeyDialog({
  open,
  onOpenChange,
  environment,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environment: Environment;
  onCreate: (key: ApiKey) => void;
}) {
  const [label, setLabel] = React.useState("");
  const [env, setEnv] = React.useState<Environment>(environment);
  const [scopes, setScopes] = React.useState<string[]>(["sessions:read"]);

  /*
   * Staged in local state and written only on submit — a user backing out of
   * this dialog must not have half-created a key.
   *
   * The reset is React's documented "adjust state when a prop changes"
   * pattern (compare against the previous value during render), not an
   * effect. The effect version renders the *stale* form once before clearing
   * it, so reopening the dialog visibly flashes the last label you typed —
   * which, on a form whose whole point is that nothing carries over, is the
   * worst possible thing for it to do.
   */
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setLabel("");
      setEnv(environment);
      setScopes(["sessions:read"]);
    }
  }

  const labelInvalid = label.trim().length > 0 && label.trim().length < 3;
  const canSubmit = label.trim().length >= 3 && scopes.length > 0;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onCreate({
      id: `key_${Math.floor(Math.random() * 1e6).toString(16)}`,
      label: label.trim(),
      prefix: `vg_${env === "production" ? "live" : "test"}_${randomChunk(4)}`,
      secret: randomChunk(24),
      environment: env,
      scopes,
      createdAt: SNAPSHOT_AT,
      lastUsedAt: null,
      createdBy: "Marguerite Okonkwo",
      status: "active",
      requests24h: 0,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bezel max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="display text-xl">New API key</DialogTitle>
          <DialogDescription>
            The secret is displayed once, immediately after creation. Nothing here is written until
            you submit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="key-label" className="block text-[12.5px] font-medium text-foreground">
              Label
            </label>
            <Input
              id="key-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Matchmaking service"
              autoComplete="off"
              aria-describedby="key-label-help"
              aria-invalid={labelInvalid || undefined}
              className={cn("bg-[var(--void)]/40", labelInvalid && "border-signal-bad")}
            />
            <p
              id="key-label-help"
              className={cn("text-[11.5px]", labelInvalid ? "text-signal-bad" : "text-ink-faint")}
            >
              {labelInvalid
                ? "Use at least 3 characters — this is what appears in the audit log."
                : "Shown in the audit log and in request traces."}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="key-env" className="block text-[12.5px] font-medium text-foreground">
              Environment
            </label>
            <Select value={env} onValueChange={(value) => setEnv(value as Environment)}>
              <SelectTrigger id="key-env" className="bg-[var(--void)]/40 font-mono text-[12.5px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production — vg_live_…</SelectItem>
                <SelectItem value="staging">Staging — vg_test_…</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-[12.5px] font-medium text-foreground">Scopes</legend>
            <div className="grid gap-2 rounded-md border border-border/70 bg-[var(--void)]/40 p-3 sm:grid-cols-2">
              {AVAILABLE_SCOPES.map((scope) => {
                const checked = scopes.includes(scope.value);
                return (
                  <label
                    key={scope.value}
                    className="flex cursor-pointer items-start gap-2.5 rounded p-1 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        setScopes((current) =>
                          next === true
                            ? [...current, scope.value]
                            : current.filter((value) => value !== scope.value),
                        )
                      }
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-[11.5px] text-foreground">
                        {scope.label}
                      </span>
                      <span className="block text-[11px] text-ink-faint">{scope.detail}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {scopes.length === 0 && (
              <p className="text-[11.5px] text-signal-bad">Select at least one scope.</p>
            )}
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" size="sm" disabled={!canSubmit}>
              Create key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IssuedSecretDialog({
  issued,
  onOpenChange,
}: {
  issued: ApiKey | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={issued !== null} onOpenChange={onOpenChange}>
      <DialogContent className="bezel sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="display text-xl">Copy your secret</DialogTitle>
          <DialogDescription>
            This is the only time the full value is shown. Store it in your secret manager before
            closing this dialog.
          </DialogDescription>
        </DialogHeader>

        {issued && (
          <div className="space-y-4">
            <div>
              <FieldLabel>Secret</FieldLabel>
              <div className="mt-1.5 flex items-center gap-2 rounded-md border border-cyan/30 bg-cyan/[0.06] p-3 shadow-[0_0_30px_-16px_var(--cyan)]">
                <code className="min-w-0 flex-1 break-all font-mono text-[12px] text-cyan">
                  {fullKey(issued.prefix, issued.secret)}
                </code>
                <CopyButton value={fullKey(issued.prefix, issued.secret)} label="API key" />
              </div>
            </div>

            <div>
              <FieldLabel>Example request</FieldLabel>
              <CodeBlock className="mt-1.5">
                {`curl https://api.voltgate.dev/v1/sessions \\\n  -H "Authorization: Bearer ${issued.prefix}${issued.secret}" \\\n  -H "Voltgate-Project: helios-edge"`}
              </CodeBlock>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="accent" size="sm" onClick={() => onOpenChange(false)}>
            I&rsquo;ve stored it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
