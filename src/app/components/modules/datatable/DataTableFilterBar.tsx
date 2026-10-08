"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import type { DataTableFetchDataParams, DataTableFilterConfig, FilterValues } from "./types";

export interface DataTableFilterBarProps<TData> {
  /** Filter configs (columnId, label, options) */
  filters: DataTableFilterConfig[];
  /** Gọi khi đổi filter. Truyền filterValues, pageIndex: 0, pageSize. */
  fetchData: (params: DataTableFetchDataParams) => void | Promise<void>;
  /** Page size hiện tại (để gọi fetchData khi đổi filter). */
  pageSize: number;
  /** Giá trị filter ban đầu */
  initialFilterValues?: FilterValues;
  /** Table instance (cho column visibility dropdown khi showColumnVisibility) */
  table?: Table<TData>;
  /** Hiện dropdown "Columns" */
  showColumnVisibility?: boolean;
  className?: string;
}

export function DataTableFilterBar<TData>({
  filters,
  fetchData,
  pageSize,
  initialFilterValues = {},
  table,
  showColumnVisibility = true,
  className = "grid gap-2 sm:grid-cols-4 sm:gap-4",
}: DataTableFilterBarProps<TData>) {
  const [filterValues, setFilterValues] = React.useState<FilterValues>(() => {
    const initial: FilterValues = {};
    filters.forEach((f) => {
      initial[f.columnId] = initialFilterValues[f.columnId] ?? "";
    });
    return initial;
  });

  const handleChange = React.useCallback(
    (columnId: string, value: string) => {
      const next = { ...filterValues, [columnId]: value === "all" || value === "" ? "" : value };
      setFilterValues(next);
      fetchData({ filterValues: next, pageIndex: 0, pageSize });
    },
    [filterValues, fetchData, pageSize]
  );

  return (
    <div className={className}>
      {filters.map(({ columnId, label, placeholder, options }) => (
        <div key={columnId} className="space-y-2">
          <Label htmlFor={`filter-${columnId}`} className="text-sm font-medium">
            {label}
          </Label>
          <Select value={filterValues[columnId] ?? ""} onValueChange={(v) => handleChange(columnId, v)}>
            <SelectTrigger className="w-full cursor-pointer" id={`filter-${columnId}`}>
              <SelectValue placeholder={placeholder ?? `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      {showColumnVisibility && table && (
        <div className="space-y-2">
          <Label htmlFor="column-visibility" className="text-sm font-medium">
            Column Visibility
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="column-visibility">
              <Button variant="outline" className="w-full cursor-pointer justify-between">
                Columns
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
