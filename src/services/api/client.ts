import axios from "axios";
import { API_CONFIG } from "@/config/app";
import { setupRequestInterceptor, setupResponseInterceptor } from "./interceptors";
import { setupTokenRefresh } from "./token-refresh";

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

setupRequestInterceptor(apiClient);
setupResponseInterceptor(apiClient);
setupTokenRefresh(apiClient);

export { apiClient };
export default apiClient;
