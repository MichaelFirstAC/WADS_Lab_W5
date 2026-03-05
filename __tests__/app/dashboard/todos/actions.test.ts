jest.mock("@/lib/auth", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    todo: {
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { createTodo, updateTodo, deleteTodo } from "@/app/dashboard/todos/actions";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockSession } from "@/__tests__/mocks/auth";

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe("createTodo", () => {
  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const formData = new FormData();
    formData.set("title", "Test");
    const result = await createTodo(formData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("signed in");
  });

  it("returns error when title is empty", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    const formData = new FormData();
    const result = await createTodo(formData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("Title");
  });

  it("returns success when title provided", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    (prisma.todo.create as jest.Mock).mockResolvedValue({});
    const formData = new FormData();
    formData.set("title", "New Todo");
    formData.set("description", "Desc");
    const result = await createTodo(formData);
    expect(result.success).toBe(true);
  });
});

describe("updateTodo", () => {
  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await updateTodo("todo-1", { title: "Updated" });
    expect(result.success).toBe(false);
  });

  it("returns error when title is empty string", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    const result = await updateTodo("todo-1", { title: "   " });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("empty");
  });

  it("returns success when payload valid", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    (prisma.todo.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const result = await updateTodo("todo-1", { completed: true });
    expect(result.success).toBe(true);
  });
});

describe("deleteTodo", () => {
  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await deleteTodo("todo-1");
    expect(result.success).toBe(false);
  });

  it("returns success when authenticated", async () => {
    mockGetSession.mockResolvedValue(mockSession);
    (prisma.todo.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    const result = await deleteTodo("todo-1");
    expect(result.success).toBe(true);
  });
});