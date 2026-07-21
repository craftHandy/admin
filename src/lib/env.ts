interface Env {
  apiBaseUrl: string;
  tenantId: string;
  dev: boolean;
  prod: boolean;
}

export const env: Env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
  tenantId: import.meta.env.VITE_TENANT_ID || "",
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
};
