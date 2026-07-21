interface Env {
  apiBaseUrl: string;
  reactEnv: string;
  dev: boolean;
  prod: boolean;
  tenantId: string;
}

export const env: Env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  reactEnv: import.meta.env.VITE_ENV,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  tenantId: import.meta.env.VITE_TENANT_ID || "mpb",
};
