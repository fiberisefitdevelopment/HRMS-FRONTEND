import { NextRequest } from "next/server";
import { proxyMultipartToBackend } from "@/lib/api/backend-proxy";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun");
  const suffix = dryRun ? `?dryRun=${encodeURIComponent(dryRun)}` : "";
  return proxyMultipartToBackend(req, `/api/v1/employees/import${suffix}`);
}
