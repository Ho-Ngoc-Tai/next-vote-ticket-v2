import React from "react";
import type { Metadata } from "next";
import { MainHeader } from "../../modules/headers";
import AppSidebar from "../../modules/sidebar";
import { SidebarInset, SidebarProvider } from "@components/ui/sidebar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Ticket System",
  description: "Ticket System",
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Suspense>
          <MainHeader />
        </Suspense>
        <div className="flex flex-1 flex-col gap-4 p-8 pt-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
