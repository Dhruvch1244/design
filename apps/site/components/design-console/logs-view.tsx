"use client";

import * as React from "react";
import { Button } from "@/components/dsgn/button";
import { EmptyState } from "@/components/dsgn/empty-state";
import { Input } from "@/components/dsgn/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/dsgn/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dsgn/select";
import { Skeleton } from "@/components/dsgn/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dsgn/table";
import { Toggle } from "@/components/dsgn/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dsgn/tooltip";
import { CodeBlock, FieldLabel, Panel } from "@/components/design-console/panel";
import { CopyButton } from "@/components/design-console/copy-button";
import { MethodLabel, StatusCodeChip } from "@/components/design-console/status-chip";
import {
  IconChevronRight,
  IconLive,
  IconSearch,
  IconTerminal,
} from "@/components/design-console/icons";
import { LIVE_TAIL_QUEUE, REQUEST_LOGS, type RequestLog } from "@/lib/design-console/console";
import { absoluteTime, clockTime, duration, statusClass } from "@/lib/design-console/format";
import { useTicker } from "@/lib/design-console/use-ticker";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

/**
 * Module-scoped, not component state, and deliberately so: the skeleton is a
 * *first-load* state, not a per-visit one. Radix Tabs unmounts inactive
 * content, so component state would re-run the fake fetch every time the user
 * came back to this tab — which is both dishonest (the data is already
 * cached) and actively annoying.
 */
let hasFetchedLogs = false;

type StatusFilter = "all" | "2xx" | "4xx" | "5xx";

export function LogsView() {
  const [loading, setLoading] = React.useState(!hasFetchedLogs);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [live, setLive] = React.useState(false);
  const [tailCount, setTailCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (hasFetchedLogs) return;
    const timer = setTimeout(() => {
      hasFetchedLogs = true;
      setLoading(false);
    }, 620);
    return () => clearTimeout(timer);
  }, []);

  // Routed through the app's single scheduler rather than its own
  // setInterval — see lib/ticker.ts for why this app has exactly one timer.
  useTicker("log-live-tail", 1_800, live, () => {
    setTailCount((count) => (count >= LIVE_TAIL_QUEUE.length ? count : count + 1));
  });

  const rows = React.useMemo(() => {
    const tailed = live ? [...LIVE_TAIL_QUEUE.slice(0, tailCount).reverse(), ...REQUEST_LOGS] : REQUEST_LOGS;
    const needle = query.trim().toLowerCase();
    return tailed.filter((log) => {
      if (statusFilter !== "all") {
        const bucket = Math.floor(log.status / 100);
        if (statusFilter === "2xx" && bucket !== 2 && bucket !== 3) return false;
        if (statusFilter === "4xx" && bucket !== 4) return false;
        if (statusFilter === "5xx" && bucket !== 5) return false;
      }
      if (!needle) return true;
      return (
        log.path.toLowerCase().includes(needle) ||
        log.method.toLowerCase().includes(needle) ||
        log.region.includes(needle) ||
        log.keyPrefix.toLowerCase().includes(needle) ||
        String(log.status).includes(needle)
      );
    });
  }, [live, tailCount, query, statusFilter]);

  // Live tail always shows the head of the stream; paging through a list
  // that is prepending rows underneath you is a guaranteed misread.
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = live ? 1 : Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /*
   * Changing a filter resets to page 1 at the *event*, not in an effect
   * reacting to the filter having changed. The effect version renders page 4
   * of a 2-page result set first and corrects itself on the next commit —
   * a visible flash of an empty table, and the exact cascading-render shape
   * `react-hooks/set-state-in-effect` exists to catch.
   */
  function applyQuery(next: string) {
    setQuery(next);
    setPage(1);
  }

  function applyStatusFilter(next: StatusFilter) {
    setStatusFilter(next);
    setPage(1);
  }

  const errorCount = rows.filter((log) => log.status >= 400).length;

  return (
    <div className="space-y-4">
      <Panel
        kicker={`${rows.length} matching · ${errorCount} non-2xx`}
        title="Recent requests"
        description="Retained for 7 days. Select a row for headers, client details and the error the edge actually returned."
        padded={false}
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={live}
                onPressedChange={(next) => {
                  setLive(next);
                  if (!next) setTailCount(0);
                }}
                aria-label="Live tail"
                size="sm"
                variant="outline"
                className={cn(
                  "gap-1.5 font-mono text-[11px] uppercase tracking-wider",
                  live && "border-signal-ok/40 bg-signal-ok/10 text-signal-ok",
                )}
              >
                <IconLive className={cn("h-3.5 w-3.5", live && "animate-pulse")} />
                Live
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              {live ? "Streaming new requests — paging is disabled" : "Stream new requests as they arrive"}
            </TooltipContent>
          </Tooltip>
        }
      >
        <div className="flex flex-col gap-2 border-b border-border/70 p-3 sm:flex-row sm:items-center sm:px-5 sm:py-3">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <Input
              value={query}
              onChange={(event) => applyQuery(event.target.value)}
              placeholder="Filter by path, method, status, region or key…"
              aria-label="Filter request logs"
              className="h-9 bg-[var(--void)]/40 pl-9 font-mono text-[12.5px]"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => applyStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger
              aria-label="Filter by status class"
              className="h-9 w-full font-mono text-[12px] sm:w-[132px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="2xx">2xx / 3xx</SelectItem>
              <SelectItem value="4xx">4xx</SelectItem>
              <SelectItem value="5xx">5xx</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <LogSkeleton />
        ) : pageRows.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              icon={<IconTerminal className="h-7 w-7" />}
              title="No requests match this filter"
              description={`Nothing in the retained window matches ${query ? `“${query}”` : "this status class"}. The rows are still there — only the filter is hiding them.`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    applyQuery("");
                    applyStatusFilter("all");
                  }}
                >
                  Reset filters
                </Button>
              }
              className="border-border/70 bg-[var(--void)]/30"
            />
          </div>
        ) : (
          /*
           * min-width plus horizontal scroll rather than a card stack. A log
           * table is read by scanning one column down, which cards destroy.
           * Below 768px the region, key and user-agent columns drop out;
           * time / method / path / status / latency all survive, because
           * those five are what a "why is this 500ing" question needs.
           */
          <div className="scroll-hint relative">
            <Table className="min-w-[600px] text-[13px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[92px] pl-4 sm:pl-5">Time</TableHead>
                  <TableHead className="w-[64px]">Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead className="hidden lg:table-cell">Region</TableHead>
                  <TableHead className="hidden xl:table-cell">Key</TableHead>
                  <TableHead className="w-[72px] text-right">Status</TableHead>
                  <TableHead className="w-[76px] pr-12 text-right xl:pr-5">Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((log, index) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    isNew={live && index < tailCount && currentPage === 1}
                    expanded={expanded === log.id}
                    onToggle={() => setExpanded((current) => (current === log.id ? null : log.id))}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && pageRows.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="font-mono text-[11.5px] text-ink-faint">
              {live ? (
                <span className="text-signal-ok">streaming — newest first</span>
              ) : (
                <>
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, rows.length)} of {rows.length}
                </>
              )}
            </p>
            {!live && (
              <LogPagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

function LogRow({
  log,
  isNew,
  expanded,
  onToggle,
}: {
  log: RequestLog;
  isNew: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tone = statusClass(log.status);
  const slow = log.durationMs > 900;

  return (
    <>
      <TableRow
        {...(isNew ? { "data-arrive": "" } : {})}
        className={cn(
          "cursor-pointer border-border/50",
          expanded && "bg-muted/40",
          tone === "server" && "bg-signal-bad/[0.045]",
        )}
        onClick={onToggle}
      >
        <TableCell className="py-2 pl-4 sm:pl-5">
          {/*
            The expander is a real button inside the row, not just a
            click-handler on the <tr>. The row handler is a convenience for
            mouse users; this is what makes the same thing reachable by
            keyboard and announced with its state.
          */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} request ${log.id}`}
            className="inline-flex items-center gap-1.5 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconChevronRight
              className={cn(
                "h-3 w-3 shrink-0 text-ink-faint transition-transform duration-200 ease-fluid",
                expanded && "rotate-90 text-cyan",
              )}
            />
            <span className="tnum font-mono text-[12px] text-ink-soft">{clockTime(log.at)}</span>
          </button>
        </TableCell>
        <TableCell className="py-2">
          <MethodLabel method={log.method} />
        </TableCell>
        <TableCell className="min-w-0 py-2">
          <span className="block truncate font-mono text-[12.5px] text-foreground">{log.path}</span>
        </TableCell>
        <TableCell className="hidden py-2 font-mono text-[12px] text-ink-faint lg:table-cell">
          {log.region}
        </TableCell>
        <TableCell className="hidden py-2 font-mono text-[12px] text-ink-faint xl:table-cell">
          {log.keyPrefix}
        </TableCell>
        <TableCell className="py-2 text-right">
          <StatusCodeChip code={log.status} />
        </TableCell>
        <TableCell
          className={cn(
            "tnum py-2 pr-12 text-right font-mono text-[12px] xl:pr-5",
            slow ? "text-signal-warn" : "text-ink-soft",
          )}
        >
          {duration(log.durationMs)}
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="border-border/50 bg-[var(--void)]/50 hover:bg-[var(--void)]/50">
          <TableCell colSpan={7} className="p-0">
            <div data-arrive className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <div>
                  <FieldLabel>Request</FieldLabel>
                  <div className="mt-1.5 flex items-center gap-2">
                    <code className="min-w-0 flex-1 break-all font-mono text-[12px] text-foreground">
                      {log.method} {log.path}
                    </code>
                    <CopyButton value={`${log.method} ${log.path}`} label="request line" />
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11.5px]">
                  {[
                    ["Request ID", log.id],
                    ["Timestamp", absoluteTime(log.at)],
                    ["Region", log.region],
                    ["Key", log.keyPrefix],
                    ["Client IP", log.ip],
                    ["Latency", duration(log.durationMs)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-ink-faint">{label}</dt>
                      <dd className="mt-0.5 break-all font-mono text-ink-soft">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <FieldLabel>User agent</FieldLabel>
                  <p className="mt-1 break-all font-mono text-[11.5px] text-ink-soft">
                    {log.userAgent}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <FieldLabel>Response</FieldLabel>
                  <div className="mt-1.5 flex items-center gap-2">
                    <StatusCodeChip code={log.status} />
                    <span className="font-mono text-[11.5px] text-ink-faint">
                      served from {log.region}
                    </span>
                  </div>
                </div>

                {/*
                  The error string is the actual upstream reason, not a
                  generic "request failed". A console that paraphrases its own
                  errors makes the log useless for the one job it has.
                */}
                {log.error ? (
                  <div>
                    <FieldLabel>Error</FieldLabel>
                    <CodeBlock className="mt-1.5 border-signal-bad/30">
                      {`${log.status} ${log.error}`}
                    </CodeBlock>
                  </div>
                ) : (
                  <div>
                    <FieldLabel>Body</FieldLabel>
                    <CodeBlock className="mt-1.5">
                      {`{\n  "id": "${log.id}",\n  "object": "session",\n  "region": "${log.region}",\n  "livemode": ${log.keyPrefix.startsWith("vg_live")}\n}`}
                    </CodeBlock>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function LogSkeleton() {
  return (
    <div className="space-y-px p-4 sm:p-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading request logs</span>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 py-2.5">
          <Skeleton className="h-3 w-16 bg-muted" />
          <Skeleton className="h-3 w-10 bg-muted" />
          <Skeleton
            className="h-3 bg-muted"
            style={{ width: `${34 + ((index * 13) % 30)}%` }}
          />
          <Skeleton className="ml-auto h-3 w-10 bg-muted" />
          <Skeleton className="h-3 w-12 bg-muted" />
        </div>
      ))}
    </div>
  );
}

/** Windowed page list — 96 rows is 8 pages, but the same component has to not
 *  fall apart if the retention window grows. */
function LogPagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  const pages: Array<number | "gap"> = [];
  for (let n = 1; n <= pageCount; n++) {
    if (n === 1 || n === pageCount || Math.abs(n - page) <= 1) pages.push(n);
    else if (pages[pages.length - 1] !== "gap") pages.push("gap");
  }

  return (
    <Pagination className="mx-0 w-auto justify-start sm:justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={cn("text-[12px]", page === 1 && "pointer-events-none opacity-40")}
            onClick={(event) => {
              event.preventDefault();
              onChange(Math.max(1, page - 1));
            }}
          />
        </PaginationItem>

        {pages.map((entry, index) =>
          entry === "gap" ? (
            <PaginationItem key={`gap-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href="#"
                size="icon-sm"
                isActive={entry === page}
                className="font-mono text-[12px]"
                onClick={(event) => {
                  event.preventDefault();
                  onChange(entry);
                }}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === pageCount}
            className={cn("text-[12px]", page === pageCount && "pointer-events-none opacity-40")}
            onClick={(event) => {
              event.preventDefault();
              onChange(Math.min(pageCount, page + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
