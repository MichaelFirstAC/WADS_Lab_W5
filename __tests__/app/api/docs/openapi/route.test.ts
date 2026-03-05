import type { NextRequest } from "next/server";
import { GET } from "@/app/api/docs/openapi/route";

describe("GET /api/docs/openapi", () => {
  it("returns 200 and JSON with openapi field", async () => {
    const req = new Request("http://localhost:3000/api/docs") as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(body.openapi).toBe("3.0.3");
    expect(body.paths).toBeDefined();
  });
});