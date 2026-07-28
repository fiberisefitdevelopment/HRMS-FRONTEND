import { NextRequest } from "next/server";
import { proxyMultipartToBackend, proxyToBackend } from "@/lib/api/backend-proxy";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";
  const isMultipart =
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded");

  if (isMultipart) {
    return proxyMultipartToBackend(req, "/api/v1/leave");
  }

  return proxyToBackend(req, "/api/v1/leave", "POST");
}

// Needed by the approvals UI (GET /api/v1/leave?status=pending&...).
// Without this handler, Next returns 405 "Method Not Allowed".
export async function GET(req: NextRequest) {
  const search = req.nextUrl.search; // includes leading "?" when present
  return proxyToBackend(req, `/api/v1/leave${search}`);
}
