import React from "react";

import PageHeader from "@components/modules/page-header";
import { ChartAreaInteractive } from "@features/dashboard/ChartAreaInteractive";
import { SectionCards } from "@features/dashboard/SectionCards";
import { DashboardTable } from "@features/dashboard/data-table";

const DashboardPage = () => {
  return (
    <>
      <PageHeader title="Dashboard" description="Welcome to your admin dashboard" />

      <div className="@container/main space-y-6">
        <SectionCards />
        <ChartAreaInteractive />
      </div>

      <div className="@container/main">
        <DashboardTable />
      </div>
    </>
  );
};

export default DashboardPage;
