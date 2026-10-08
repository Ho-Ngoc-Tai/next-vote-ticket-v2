import React from "react";
import AuthProvider from "../AuthProvider";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProvider;
