import { Button } from "@components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

export type PaginationProps = {
  pageSize?: number;
  pageIndex?: number;
  pageCount?: number;
  total?: number;
  pageSizeOptions?: number[];
  controlled?: boolean;
  // eslint-disable-next-line no-unused-vars
  setLocalPagination?: (pagination: { pageIndex: number; pageSize: number }) => void;
  // eslint-disable-next-line no-unused-vars
  fetchData?: (params: any) => void | Promise<void>;
  disabledPrevious?: boolean;
  disabledNext?: boolean;
};

function Pagination({
  pageSize,
  pageIndex,
  total,
  pageCount,
  pageSizeOptions = [10, 20, 30, 40, 50],
  controlled = false,
  setLocalPagination,
  fetchData,
  disabledPrevious,
  disabledNext,
}: PaginationProps) {
  const pageCountCalculated = useMemo(
    () => (pageCount ? pageCount : Math.ceil((total || 1) / (pageSize ?? 10))),
    [pageCount, total, pageSize]
  );
  const shouldDisablePrevious = useMemo(
    () => (disabledPrevious ? disabledPrevious : Number(pageIndex) <= 1),
    [disabledPrevious, pageIndex]
  );
  const shouldDisableNext = useMemo(
    () => (disabledNext ? disabledNext : Number(pageIndex) >= pageCountCalculated),
    [disabledNext, pageIndex, pageCountCalculated]
  );
  return (
    <>
      <div className="hidden items-center gap-2 lg:flex">
        <span className="text-sm font-medium">Rows per page</span>
        <select
          className="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 rounded-md border px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          value={pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            if (!controlled && setLocalPagination) setLocalPagination({ pageIndex: 0, pageSize: newSize });
            fetchData?.({ pageIndex: 0, pageSize: newSize });
          }}
        >
          {pageSizeOptions.map((size: number) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex w-fit items-center justify-center text-sm font-medium">
        Page {pageIndex ? pageIndex : 1} of {pageCountCalculated}
      </div>
      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <Button
          variant="outline"
          className="size-8 cursor-pointer"
          size="icon"
          onClick={() => {
            const nextIndex = pageIndex ? pageIndex - 1 : 0;
            if (!controlled && setLocalPagination)
              setLocalPagination({ pageIndex: nextIndex, pageSize: pageSize ?? 10 });
            fetchData?.({ pageIndex: nextIndex, pageSize });
          }}
          disabled={shouldDisablePrevious}
        >
          <span className="sr-only">Previous page</span>
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 cursor-pointer"
          size="icon"
          onClick={() => {
            const nextIndex = pageIndex ? pageIndex + 1 : 1;
            if (!controlled && setLocalPagination)
              setLocalPagination({ pageIndex: nextIndex, pageSize: pageSize ?? 10 });
            fetchData?.({ pageIndex: nextIndex, pageSize });
          }}
          disabled={shouldDisableNext}
        >
          <span className="sr-only">Next page</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </>
  );
}

export default Pagination;
