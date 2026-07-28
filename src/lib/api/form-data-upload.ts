import { API_CONFIG } from "@/config/app";
import { getAccessToken } from "@/lib/auth/token-storage";

function resolveApiUrl(path: string): string {
  const base = API_CONFIG.baseURL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (base.startsWith("http")) return `${base}${normalizedPath}`;
  if (typeof window === "undefined") return `${base}${normalizedPath}`;
  return `${window.location.origin}${base}${normalizedPath}`;
}

/** Upload multipart form data via native fetch (avoids axios JSON Content-Type issues). */
export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(resolveApiUrl(path), {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  const json = (await response.json().catch(() => ({}))) as {
    message?: string;
    data?: T;
  };

  if (!response.ok) {
    const message = json?.message || "Upload failed";
    const err = new Error(message) as Error & {
      response?: { status: number; data: unknown };
    };
    err.response = { status: response.status, data: json };
    throw err;
  }

  return json.data as T;
}
