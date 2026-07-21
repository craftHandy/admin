import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.dispatchEvent(new Event("auth:changed"));
    navigate("/login", { replace: true });
  }, [navigate]);

  return logout;
};
