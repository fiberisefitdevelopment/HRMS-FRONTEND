import { NextRequest } from "next/server";
import { proxyMultipartToBackend } from "@/lib/api/backend-proxy";

export async function POST(req: NextRequest) {
  return proxyMultipartToBackend(req, "/api/v1/employees/import/preview");
}
