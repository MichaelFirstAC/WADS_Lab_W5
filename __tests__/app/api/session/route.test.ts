import type { NextRequest } from "next/server";
import { POST } from "@/app/api/session/route";

jest.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import { adminAuth } from "@/lib/firebase-admin";

describe("POST /api/session", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost:3000/api/session", {
      method: "POST",
    }) as NextRequest;

    const res = await POST(req);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("throws when verifyIdToken rejects", async () => {
    (adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error("invalid token"));

    const req = new Request("http://localhost:3000/api/session", {
      method: "POST",
      headers: { Authorization: "Bearer bad-token" },
    }) as NextRequest;

    await expect(POST(req)).rejects.toThrow("invalid token");
  });

  it("sets session cookie and returns success", async () => {
    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: "uid-1" });

    const req = new Request("http://localhost:3000/api/session", {
      method: "POST",
      headers: { Authorization: "Bearer good-token" },
    }) as NextRequest;

    const res = await POST(req);

    expect(adminAuth.verifyIdToken).toHaveBeenCalledWith("good-token", true);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: "success" });

    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toContain("session=good-token");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
  });
});
