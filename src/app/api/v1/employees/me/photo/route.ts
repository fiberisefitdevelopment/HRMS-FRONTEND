import { NextRequest } from "next/server";
import { proxyMultipartToBackend, proxyToBackend } from "@/lib/api/backend-proxy";

export async function POST(req: NextRequest) {
  return proxyMultipartToBackend(req, "/api/v1/employees/me/photo");
}

export async function DELETE(req: NextRequest) {
  return proxyToBackend(req, "/api/v1/employees/me/photo");
}
