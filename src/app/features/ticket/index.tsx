"use client";
import { WEB_TICKET_CREATE_ENDPOINT } from "@routes/web";
import { useAppDispatch, useAppSelector } from "@stores/index";
import {
  getTicketCategoriesAction,
  getTicketsAction,
  getTicketStatusCountAction,
  ticketCategoriesSelector,
  ticketsSelector,
  ticketStatusCountSelector,
} from "@stores/reducers/tickets";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TicketList from "./components/TicketList";
import { TicketToolBar } from "./components/TicketToolBar";

export default function TicketManagement() {
  const dispatch = useAppDispatch();
  const { items, status, params, total } = useAppSelector(ticketsSelector);
  const { data: statusCount } = useAppSelector(ticketStatusCountSelector);
  const { items: categories } = useAppSelector(ticketCategoriesSelector);
  const router = useRouter();

  const fetchData = ({
    page = 1,
    limit = 20,
    status = undefined,
    category = undefined,
    startDate = undefined,
    endDate = undefined,
    search = undefined,
    hashtag = undefined,
  }: {
    page?: number;
    limit?: number;
    status?: string | undefined;
    category?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    search?: string | undefined;
    hashtag?: string | undefined;
  }) => {
    dispatch(getTicketsAction({ page, limit, status, category, startDate, endDate, search, hashtag }));
  };

  useEffect(() => {
    fetchData({});
    dispatch(getTicketStatusCountAction({ isGeneral: true }));
    dispatch(getTicketCategoriesAction());
  }, []);

  const counts = statusCount
    ? {
        total: statusCount.total,
        new: statusCount.NEW,
        open: statusCount.OPEN,
        pending: statusCount.PENDING,
        resolved: statusCount.RESOLVED,
        closed: statusCount.CLOSED,
      }
    : null;

  return (
    <div className="space-y-4">
      {/* Filter Field Selector */}
      <TicketToolBar
        onCreateTicket={() => router.push(WEB_TICKET_CREATE_ENDPOINT)}
        fetchData={fetchData}
        counts={counts}
        categories={categories}
      />

      {/* Ticket List */}
      <TicketList data={items} params={params} total={total} fetchData={fetchData} status={status} />
    </div>
  );
}
