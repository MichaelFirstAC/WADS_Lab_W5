import type { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/firebase/route";

jest.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  },
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
    },
  },
}));

import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

describe("POST /api/auth/firebase", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost:3000/api/auth/firebase", {
      method: "POST",
    }) as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when decoded token has no email", async () => {
    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: "uid-1" });

    const req = new Request("http://localhost:3000/api/auth/firebase", {
      method: "POST",
      headers: { Authorization: "Bearer token-no-email" },
    }) as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Email not found in token" });
  });

  it("returns 401 when Firebase verification fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    (adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error("bad token"));

    const req = new Request("http://localhost:3000/api/auth/firebase", {
      method: "POST",
      headers: { Authorization: "Bearer bad-token" },
    }) as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Authentication failed" });

    consoleSpy.mockRestore();
  });

  it("upserts user and sets session cookie on success", async () => {
    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: "uid-123",
      email: "user@example.com",
      name: "Token Name",
      email_verified: true,
      picture: "https://token.example/avatar.png",
    });

    (adminAuth.getUser as jest.Mock).mockResolvedValue({
      displayName: "Firebase Name",
      photoURL: "https://firebase.example/avatar.png",
    });

    (prisma.user.upsert as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "Firebase Name",
      image: "https://firebase.example/avatar.png",
      emailVerified: true,
    });

    const req = new Request("http://localhost:3000/api/auth/firebase", {
      method: "POST",
      headers: { Authorization: "Bearer good-token" },
    }) as NextRequest;

    const res = await POST(req);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: "success", userId: "user-1" });

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      update: {
        name: "Firebase Name",
        image: "https://firebase.example/avatar.png",
      },
      create: {
        email: "user@example.com",
        name: "Firebase Name",
        image: "https://firebase.example/avatar.png",
        emailVerified: true,
      },
    });

    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toContain("session=good-token");
    expect(setCookie.toLowerCase()).toContain("httponly");
  });
});
