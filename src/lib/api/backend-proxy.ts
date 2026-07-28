import { NextRequest, NextResponse } from "next/server";

export const BACKEND_ORIGIN = process.env.API_PROXY_TARGET ?? "http://localhost:5001";

export function forwardRequestHeaders(req: NextRequest): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const auth = req.headers.get("authorization");
  if (auth) headers.Authorization = auth;
  const requestId = req.headers.get("x-request-id");
  if (requestId) headers["X-Request-ID"] = requestId;
  return headers;
}

/** Forward JSON / DELETE / etc. to Express backend. */
export async function proxyToBackend(
  req: NextRequest,
  backendPath: string,
  method?: string
): Promise<NextResponse> {
  const resolvedMethod = method ?? req.method;
  const headers = forwardRequestHeaders(req) as Record<string, string>;
  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const body =
    resolvedMethod === "GET" || resolvedMethod === "HEAD"
      ? undefined
      : await req.text();

  const res = await fetch(`${BACKEND_ORIGIN}${backendPath}`, {
    method: resolvedMethod,
    headers,
    body,
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

/** Rebuild multipart body and forward to Express (Next rewrites break file uploads). */
export async function proxyMultipartToBackend(
  req: NextRequest,
  backendPath: string
): Promise<NextResponse> {
  const formData = await req.formData();
  const out = new FormData();

  for (const [key, value] of formData.entries()) {
    if (value instanceof Blob) {
      const fileName = value instanceof File ? value.name : key;
      const mime = resolveUploadMime(value, fileName);
      const blob =
        mime && (!value.type || value.type === "application/octet-stream")
          ? new Blob([await value.arrayBuffer()], { type: mime })
          : value;
      out.append(key, blob, fileName);
    } else {
      out.append(key, String(value));
    }
  }

  const res = await fetch(`${BACKEND_ORIGIN}${backendPath}`, {
    method: "POST",
    headers: forwardRequestHeaders(req),
    body: out,
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

function resolveUploadMime(blob: Blob, fileName: string): string | undefined {
  if (blob.type && blob.type !== "application/octet-stream") return blob.type;
  const ext = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : undefined;
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    pdf: "application/pdf",
  };
  if (ext && map[ext]) return map[ext];
  // Mobile camera blobs often have no extension — default photos to JPEG.
  if (!ext || ext === fileName.toLowerCase()) return "image/jpeg";
  return undefined;
}
