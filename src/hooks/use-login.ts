import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { authApi } from "@/lib/auth-api";
import type { ILoginResponse } from "@/lib/auth-schema";

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: { email: string; password: string }): Promise<ILoginResponse> => {
      const response = await api.post<ILoginResponse>(
        authApi.login.controllerName,
        {
          email: data.email,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const body = response.data as any;
      const tokens = (body.data ?? body) as ILoginResponse;
      return tokens;
    },
    onSuccess: (tokens) => {
      localStorage.setItem("access_token", tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem("refresh_token", tokens.refresh_token);
      }
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/dashboard", { replace: true });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err?.message || "Login failed. Please check your credentials.";
      toast.error(message);
    },
  });
};
