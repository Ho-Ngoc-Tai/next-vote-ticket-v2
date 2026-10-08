import AuthLayout from "@components/layouts/Auth";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthLayout>{children}</AuthLayout>;
};

export default layout;
