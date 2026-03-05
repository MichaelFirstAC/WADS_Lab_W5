import type { NextRequest } from "next/server";
import { PATCH, DELETE } from "@/app/api/todos/[id]/route";

jest.mock("@/lib/auth", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    todo: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockSession } from "@/__tests__/mocks/auth";
import { mockTodo } from "@/__tests__/mocks/prisma";

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

const mockParams = Promise.resolve({ id: "todo-1" });

describe("PATCH /api/todos/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("http://test/api/todos/todo-1", {
      method: "PATCH",
      body: JSON.stringify({ title: "Updated" }),
      headers: { "Content-Type": "application/json" },
    }) as NextRequest;
    const res = await PATCH(req, { params: mockParams });
    expect(res.status).toBe(401);
  });

  it("returns 404 when todo not found", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    (prisma.todo.findFirst as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://test/api/todos/todo-1", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
      headers: { "Content-Type": "application/json" },
    }) as NextRequest;
    const res = await PATCH(req, { params: mockParams });
    expect(res.status).toBe(404);
  });

  it("updates todo and returns 200", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    (prisma.todo.findFirst as jest.Mock).mockResolvedValue(mockTodo);
    (prisma.todo.update as jest.Mock).mockResolvedValue({
      ...mockTodo,
      completed: true,
    });
    const req = new Request("http://test/api/todos/todo-1", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
      headers: { "Content-Type": "application/json" },
    }) as NextRequest;
    const res = await PATCH(req, { params: mockParams });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.completed).toBe(true);
  });
});

describe("DELETE /api/todos/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("http://test/api/todos/todo-1", { method: "DELETE" }) as NextRequest;
    const res = await DELETE(req, { params: mockParams });
    expect(res.status).toBe(401);
  });

  it("returns 404 when todo not found", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    (prisma.todo.findFirst as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://test/api/todos/todo-1", { method: "DELETE" }) as NextRequest;
    const res = await DELETE(req, { params: mockParams });
    expect(res.status).toBe(404);
  });

  it("deletes todo and returns 204", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    (prisma.todo.findFirst as jest.Mock).mockResolvedValue(mockTodo);
    (prisma.todo.delete as jest.Mock).mockResolvedValue(undefined);
    const req = new Request("http://test/api/todos/todo-1", { method: "DELETE" }) as NextRequest;
    const res = await DELETE(req, { params: mockParams });
    expect(res.status).toBe(204);
  });
});