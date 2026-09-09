"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../table/table";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { cn } from "../../lib/utils";

// Pinned to @tanstack/react-table's 8.x line rather than its current 9.x
// major: v9 replaced the ColumnDef/useReactTable model this component is
// built on with a typed-hooks-per-table architecture (createTableHook),
// which is a fundamentally different integration shape, not a drop-in
// upgrade. v8's plain `columns`/`data` + ColumnDef API is what keeps this
// component genuinely generic and copy-paste-portable the way a registry
// item needs to be — a v9 rewrite would require generating a bespoke hook
// per consumer table, defeating that goal. v9 does ship a `useLegacyTable`
// compatibility shim with the same ColumnDef surface, but its row-model
// functions are documented as deprecated stubs; depending on a
// perpetually-deprecated code path for a component's core behavior is worse
// than pinning to the still-maintained 8.x major.
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Column id to filter on with the built-in search input. Omit to hide the filter input. */
  filterColumn?: string;
  filterPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filter...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  });

  return (
    <div className="space-y-4">
      {filterColumn && (
        <Input
          placeholder={filterPlaceholder}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      )}
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className={cn(
                              "h-3.5 w-3.5 transition-transform",
                              sortDirection === "desc" && "rotate-180",
                              !sortDirection && "opacity-40",
                            )}
                          >
                            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
