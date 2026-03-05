import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TodoList, type TodoItem } from "./todo-list";

export default async function TodosPage() {
  const session = await getSession();
  if (!session) return null;

  const todos = await prisma.todo.findMany({
    where: { userId: session.id },
    orderBy: [{ completed: "asc" }, { updatedAt: "desc" }],
  });

  const initialTodos: TodoItem[] = todos.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  return <TodoList initialTodos={initialTodos} />;
}