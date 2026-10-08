import MainLayout from "@components/layouts/Main";
import React from "react";
import AppProvider from "../providers/AppProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      <MainLayout>{children}</MainLayout>
    </AppProvider>
  );
};

export default Layout;
