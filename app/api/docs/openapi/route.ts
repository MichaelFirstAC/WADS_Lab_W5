import { NextRequest } from "next/server";
import { getOpenApiSpec } from "@/lib/docs/openapi/spec";

export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000";
  const spec = getOpenApiSpec(baseUrl);
  return Response.json(spec, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}