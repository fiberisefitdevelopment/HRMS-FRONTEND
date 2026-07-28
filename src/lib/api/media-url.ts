import { API_CONFIG } from "@/config/app";

export function getMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const apiBase = API_CONFIG.baseURL.replace(/\/api\/v\d+\/?$/, "");
  return `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
}
