"use client";

import { Spinner } from "@components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import Pagination from "../pagination";
import { DataTableProps } from "./types";

function DataTableInner<TData extends RowData>({
  data,
  columns,
  getRowId,
  showPagination = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  defaultPageSize = 10,
  enableRowSelection = true,
  pagination: paginationFromProps,
  total,
  loading,
  pageCount: pageCountFromProps,
  fetchData,
  toolbarStart,
  toolbarEnd,
  filterSlot,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [localPagination, setLocalPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const controlled = paginationFromProps != null;
  const pagination = controlled ? paginationFromProps : localPagination;
  const pageCount =
    total !== undefined ? Math.max(1, Math.ceil(total / pagination.pageSize)) : (pageCountFromProps ?? 1);

  const table = useReactTable({
    data,
    columns,
    ...(getRowId && { getRowId }),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection,
    manualPagination: true,
    pageCount,
  });

  return (
    <div className={className ?? "w-full space-y-4"}>
      {/* Toolbar: start slot + end slot (add search in toolbarEnd if needed) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {toolbarStart}
        <div className="flex flex-1 items-center gap-2 sm:justify-end">{toolbarEnd}</div>
      </div>

      {/* Custom filter slot (e.g. column filters); receives table instance */}
      {filterSlot?.(table)}

      {/* Table */}
      <div className="relative rounded-md border">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-[1px]">
            <Spinner className="size-8 text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: selection + pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          {showPagination && (
            <Pagination
              pageSize={table.getState().pagination.pageSize}
              pageIndex={table.getState().pagination.pageIndex}
              pageCount={pageCount}
              pageSizeOptions={pageSizeOptions}
              controlled={controlled}
              setLocalPagination={setLocalPagination}
              fetchData={fetchData}
              disabledPrevious={!table.getCanPreviousPage()}
              disabledNext={!table.getCanNextPage()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Generic reusable DataTable built on @tanstack/react-table */
export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  return <DataTableInner {...props} />;
}
