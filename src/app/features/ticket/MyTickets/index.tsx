"use client";
import { useAppDispatch, useAppSelector } from "@stores/index";
import {
  getMyTicketsAction,
  getTicketStatusCountAction,
  myTicketsSelector,
  ticketStatusCountSelector,
} from "@stores/reducers/tickets";
import { useEffect } from "react";
import TicketList from "../components/TicketList";
import { TicketToolBar } from "../components/TicketToolBar";

export default function MyTicketManagement() {
  const dispatch = useAppDispatch();
  const { items, status, params, total } = useAppSelector(myTicketsSelector);
  const { data: myStatusCount } = useAppSelector(ticketStatusCountSelector);
  const fetchData = ({
    page = 1,
    limit = 20,
    status = undefined,

    startDate = undefined,
    endDate = undefined,
    search = undefined,
    hashtag = undefined,
  }: {
    page?: number;
    limit?: number;
    status?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    search?: string | undefined;
    hashtag?: string | undefined;
  }) => {
    dispatch(getMyTicketsAction({ page, limit, status, startDate, endDate, search, hashtag }));
  };

  useEffect(() => {
    fetchData({});
    dispatch(getTicketStatusCountAction({ isGeneral: false }));
  }, []);

  const counts = myStatusCount
    ? {
        total: myStatusCount.total ?? 0,
        new: myStatusCount.NEW ?? 0,
        open: myStatusCount.OPEN ?? 0,
        pending: myStatusCount.PENDING ?? 0,
        resolved: myStatusCount.RESOLVED ?? 0,
        closed: myStatusCount.CLOSED ?? 0,
      }
    : null;

  return (
    <div className="space-y-4">
      {/* Filter Field Selector */}
      <TicketToolBar onCreateTicket={() => {}} fetchData={fetchData} counts={counts} />

      {/* Ticket List */}
      <TicketList data={items} params={params} total={total} fetchData={fetchData} status={status} />
    </div>
  );
}
