"use client";

import Pagination from "@components/modules/pagination";
import { Button } from "@components/ui/button";
import { Spinner } from "@components/ui/spinner";
import { LOADING_STATUS } from "@constants/status";
import { Ticket } from "@interfaces/tickets";
import { WEB_TICKET_DETAIL_ENDPOINT } from "@routes/web";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { TicketItem } from "./TicketItem";

export type TicketListFetchDataParams = {
  page?: number;
  limit?: number;
  status?: string | undefined;
};

export interface TicketListProps {
  data: Ticket[];
  total: number;
  fetchData: (params: TicketListFetchDataParams) => void;
  params: TicketListFetchDataParams;
  status: string;
  showCustomer?: boolean;
  onTicketClick?: (ticket: Ticket) => void;
}

export default function TicketList({
  data,
  params,
  total,
  fetchData,
  status,
  showCustomer = true,
  onTicketClick,
}: TicketListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  if (status === LOADING_STATUS.ERROR) {
    return (
      <section className="text-center py-12" aria-live="polite">
        <p className="text-destructive">Failed to load tickets</p>
        <Button onClick={() => fetchData({})} className="mt-4">
          Retry
        </Button>
      </section>
    );
  }

  if (status === LOADING_STATUS.LOADING) {
    return (
      <div className="flex items-center justify-center py-16" aria-busy="true" aria-label="Loading tickets">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center py-16 rounded-lg border border-border bg-background"
        aria-label="No tickets found"
      >
        <p className="text-muted-foreground">No tickets found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0 rounded-lg border border-border bg-background overflow-hidden">
        <div ref={scrollRef} className="overflow-auto" role="list" aria-label="Ticket list">
          <div
            style={{
              height: virtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const ticket = data[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  onClick={() => router.push(WEB_TICKET_DETAIL_ENDPOINT(ticket.id))}
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  role="listitem"
                >
                  <TicketItem ticket={ticket} showAuthor={showCustomer} onTicketClick={onTicketClick} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-end gap-8">
        {total > 0 && (
          <Pagination
            pageSize={params.limit}
            pageIndex={params.page}
            total={total}
            pageSizeOptions={[10, 20, 30, 40, 50]}
            fetchData={({ pageIndex: nextIndex, pageSize }) => {
              if (nextIndex === 0) {
                fetchData({ page: 1, limit: pageSize });
                return;
              }
              fetchData({ page: nextIndex, limit: pageSize });
            }}
          />
        )}
      </div>
    </>
  );
}
