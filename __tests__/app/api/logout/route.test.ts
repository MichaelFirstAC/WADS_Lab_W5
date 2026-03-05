import { POST } from "@/app/api/logout/route";

describe("POST /api/logout", () => {
  it("returns 200 and clears session cookie", async () => {
    const res = await POST();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ message: "Logged out" });

    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toContain("session=");
    expect(setCookie.toLowerCase()).toContain("expires=");
    expect(setCookie.toLowerCase()).toContain("httponly");
  });
});
