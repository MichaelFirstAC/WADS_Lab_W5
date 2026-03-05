"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult = { success: true } | { success: false; error: string };

export async function createTodo(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "You must be signed in to create a todo." };
  }

  const title = formData.get("title")?.toString().trim();
  if (!title) {
    return { success: false, error: "Title is required." };
  }

  const description = formData.get("description")?.toString().trim() ?? null;

  try {
    await prisma.todo.create({
      data: {
        title,
        description: description || undefined,
        userId: session.id,
      },
    });
    revalidatePath("/dashboard/todos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("createTodo error:", err);
    return { success: false, error: "Failed to create todo. Please try again." };
  }
}

export async function updateTodo(
  todoId: string,
  data: { title?: string; description?: string | null; completed?: boolean }
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "You must be signed in to update a todo." };
  }

  if (data.title !== undefined && !data.title.trim()) {
    return { success: false, error: "Title cannot be empty." };
  }

  try {
    await prisma.todo.updateMany({
      where: { id: todoId, userId: session.id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    });
    revalidatePath("/dashboard/todos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("updateTodo error:", err);
    return { success: false, error: "Failed to update todo. Please try again." };
  }
}

export async function deleteTodo(todoId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "You must be signed in to delete a todo." };
  }

  try {
    await prisma.todo.deleteMany({
      where: { id: todoId, userId: session.id },
    });
    revalidatePath("/dashboard/todos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("deleteTodo error:", err);
    return { success: false, error: "Failed to delete todo. Please try again." };
  }
}