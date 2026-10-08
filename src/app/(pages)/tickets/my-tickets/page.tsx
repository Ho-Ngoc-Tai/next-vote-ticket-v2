import PageHeader from "@components/modules/page-header";
import MyTicketManagement from "@features/ticket/MyTickets";
import React from "react";

const MyTicketsPage = () => {
  return (
    <div className="max-w-7xl mx-auto w-full">
      <PageHeader title="My Tickets" description="View and track tickets created by you." />
      <MyTicketManagement />
    </div>
  );
};

export default MyTicketsPage;
