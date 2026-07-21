import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import Axios from "axios";

import { env } from "@/env";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      resolve(Axios(config));
    } else {
      reject(error);
    }
  });
  failedQueue = [];
}

let axiosInstance: typeof Axios = Axios;

export function attachResponseInterceptor(instance: typeof Axios): void {
  axiosInstance = instance;

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (
        originalRequest.url?.includes("/oauth/token") ||
        originalRequest.url?.includes("/oauth/refresh_token") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            config: originalRequest,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          processQueue(error, null);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await Axios.post(`${env.apiBaseUrl}/oauth/refresh_token`, {
          refreshToken,
        });
        
        const { access_token, refresh_token } = response.data?.data || response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}

export function attachRequestInterceptor(axiosInstance: typeof Axios): void {
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (config.headers?.["X-Request-Type"] === "NO_AUTH") {
        delete config.headers["X-Request-Type"];
        return config;
      }

      const token = localStorage.getItem("access_token");
      if (token && !config.headers?.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );
}

let interceptorsAttached = false;

export function setupInterceptors(instance: typeof Axios = Axios): void {
  if (interceptorsAttached) return;
  attachRequestInterceptor(instance);
  attachResponseInterceptor(instance);
  interceptorsAttached = true;
}

setupInterceptors();
