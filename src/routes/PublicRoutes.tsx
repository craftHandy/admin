import { LoginPage } from "@/components/auth/login-page";
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page";

export const publicRoutes = [
  {
    path: "/",
    element: <>Public Home</>,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "forgot-password",
    element: <ForgotPasswordPage />,
  },
];
