export const authApi = {
  login: {
    controllerName: "/api/v1/auth/login",
    actionName: "LOGIN",
    method: "POST" as const,
  },
  refreshToken: {
    controllerName: "/oauth/refresh_token",
    actionName: "REFRESH_TOKEN",
    method: "POST" as const,
  },
  logout: {
    controllerName: "/api/auth-service/api/v1/auth/logout",
    actionName: "LOGOUT",
    method: "POST" as const,
  },
};
