import type { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/todos/route";

jest.mock("@/lib/auth", () => ({
  getSession: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    todo: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockSession } from "@/__tests__/mocks/auth";
import { mockTodo } from "@/__tests__/mocks/prisma";

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe("GET /api/todos", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain("signed in");
  });

  it("returns todos for authenticated user", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    (prisma.todo.findMany as jest.Mock).mockResolvedValue([
      { ...mockTodo, createdAt: mockTodo.createdAt, updatedAt: mockTodo.updatedAt },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toMatchObject({
      id: mockTodo.id,
      title: mockTodo.title,
      description: mockTodo.description,
      completed: mockTodo.completed,
    });
  });
});

describe("POST /api/todos", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("http://test/api/todos", {
      method: "POST",
      body: JSON.stringify({ title: "New" }),
      headers: { "Content-Type": "application/json" },
    }) as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when title is missing", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    const req = new Request("http://test/api/todos", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    }) as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Title");
  });

  it("creates todo and returns 201", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    (prisma.todo.create as jest.Mock).mockResolvedValue({
      ...mockTodo,
      title: "New Todo",
      description: "Desc",
    });
    const req = new Request("http://test/api/todos", {
      method: "POST",
      body: JSON.stringify({ title: "New Todo", description: "Desc" }),
      headers: { "Content-Type": "application/json" },
    }) as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.title).toBe("New Todo");
    expect(json.description).toBe("Desc");
  });
});