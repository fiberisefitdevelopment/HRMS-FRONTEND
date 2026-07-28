import { NextRequest } from "next/server";
import { proxyMultipartToBackend, proxyToBackend } from "@/lib/api/backend-proxy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyMultipartToBackend(req, `/api/v1/employees/${id}/photo`);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(req, `/api/v1/employees/${id}/photo`);
}
