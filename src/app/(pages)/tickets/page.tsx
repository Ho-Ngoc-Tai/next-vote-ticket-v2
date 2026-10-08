import PageHeader from "@components/modules/page-header";
import TicketManagement from "@features/ticket";
import React from "react";

const TicketsPage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="Tickets Support" description="Manage and track your support tickets." />
      <TicketManagement />
    </div>
  );
};

export default TicketsPage;
