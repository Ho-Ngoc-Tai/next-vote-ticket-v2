import type { ReactNode } from "react";
import type { ColumnDef, RowData } from "@tanstack/react-table";

export type { ColumnDef, RowData };

/** Filter values keyed by columnId (e.g. { role: "Admin", plan: "", status: "Active" }) */
export type FilterValues = Record<string, string>;

/** Config for a single column filter (Select) in DataTableFilterBar */
export interface DataTableFilterConfig {
  columnId: string;
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

/** Single button in the row actions bar */
export interface DataTableRowActionButton<TData> {
  label: string;
  onClick?: (row: TData) => void;
  icon?: ReactNode;
}

/** Item inside a "more" dropdown */
export interface DataTableRowActionMoreItem<TData> {
  label: string;
  onClick?: (row: TData) => void;
  icon?: ReactNode;
  destructive?: boolean;
}

/** "More" dropdown group */
export interface DataTableRowActionMore<TData> {
  type: "more";
  items: DataTableRowActionMoreItem<TData>[];
}

/** One entry in the actions array: either a button or a "more" dropdown */
export type DataTableRowActionItem<TData> = DataTableRowActionButton<TData> | DataTableRowActionMore<TData>;

/** Server-side pagination: parent controls page and fetches via fetchData. */
export interface DataTablePaginationState {
  pageIndex: number;
  pageSize: number;
}

/** Params for server-side fetch: filter + pagination. When filter/page/pageSize changes, call fetchData(params). */
export interface DataTableFetchDataParams {
  filterValues?: FilterValues;
  pageIndex?: number;
  pageSize?: number;
}

export interface DataTableProps<TData extends RowData> {
  /** Table data (current page when using server pagination) */
  data: TData[];
  /** Column definitions */
  columns: ColumnDef<TData, unknown>[];
  /** Unique row id getter (default: index) */
  getRowId?: (row: TData, index: number) => string;
  /** Show column visibility dropdown */
  showColumnVisibility?: boolean;
  /** Show pagination */
  showPagination?: boolean;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Default page size (used when pagination is not controlled) */
  defaultPageSize?: number;
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Pagination state (pageIndex, pageSize). When set with fetchData, table uses it; otherwise uses internal state. */
  pagination?: DataTablePaginationState;
  /** Tổng số phần tử (từ API). Dùng để tính số trang: pageCount = ceil(total / pageSize). Bắt buộc khi dùng pagination + fetchData. */
  total?: number;
  /** Số trang (tùy chọn). Nếu không truyền thì tính từ total. */
  pageCount?: number;
  /** Gọi khi đổi trang hoặc page size. Parent fetch và cập nhật data + pagination. */
  fetchData?: (params: DataTableFetchDataParams) => void | Promise<void>;
  /** Đang tải dữ liệu (hiển thị overlay + spinner). */
  loading?: boolean;
  /** Slot before toolbar (e.g. title) */
  toolbarStart?: ReactNode;
  /** Slot for right side of toolbar (e.g. search input, Export, Add button). Add search here if needed. */
  toolbarEnd?: ReactNode;
  /** Slot between toolbar and table (e.g. custom filters row). Receives table instance for column filters. */
  filterSlot?: (table: unknown) => ReactNode;
  /** Optional class for wrapper */
  className?: string;
}
