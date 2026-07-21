import { Navigate } from "react-router-dom";
import type { PropsWithChildren } from "react";

const PublicLayout = ({ children }: PropsWithChildren) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicLayout;
