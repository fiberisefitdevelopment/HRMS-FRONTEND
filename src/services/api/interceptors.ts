import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { getAccessToken } from "@/lib/auth/token-storage";
import { cancelDuplicateRequest, clearPendingRequest } from "./request-manager";

const AUTH_SKIP_PATHS = ["/auth/login", "/auth/refresh"];

/** Available on HTTPS/localhost; missing on HTTP LAN IPs (non-secure context). */
function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function setupRequestInterceptor(client: AxiosInstance) {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const url = config.url ?? "";
      const isAuthSkip = AUTH_SKIP_PATHS.some((path) => url.includes(path));

      if (!isAuthSkip) {
        const token = getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      if (config.headers) {
        config.headers["X-Request-ID"] = createRequestId();
      }

      // Let the browser set multipart/form-data with the correct boundary.
      if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
        const headers = config.headers;
        if (typeof headers.delete === "function") {
          headers.delete("Content-Type");
        } else {
          delete (headers as Record<string, unknown>)["Content-Type"];
        }
        config.transformRequest = [(data) => data];
      }

      if (config.method?.toUpperCase() === "GET") {
        const signal = cancelDuplicateRequest(config.method, url);
        config.signal = signal;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
}

export function setupResponseInterceptor(client: AxiosInstance) {
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const url = response.config.url ?? "";
      if (response.config.method?.toUpperCase() === "GET") {
        clearPendingRequest(response.config.method ?? "GET", url);
      }
      return response;
    },
    (error) => {
      const config = error.config as InternalAxiosRequestConfig | undefined;
      if (config?.method && config.url) {
        clearPendingRequest(config.method, config.url);
      }

      if (!error.response && error.code === "ERR_NETWORK") {
        if (typeof window !== "undefined" && !navigator.onLine) {
          window.location.href = "/offline";
        }
      }
      return Promise.reject(error);
    }
  );
}
