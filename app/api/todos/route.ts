import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to list todos." },
      { status: 401 }
    );
  }

  const todos = await prisma.todo.findMany({
    where: { userId: session.id },
    orderBy: [{ completed: "asc" }, { updatedAt: "desc" }],
  });

  const body = todos.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return NextResponse.json(body);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to create a todo." },
      { status: 401 }
    );
  }

  let body: { title?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json(
      { error: "Title is required." },
      { status: 400 }
    );
  }

  const description =
    typeof body.description === "string" ? body.description.trim() || null : null;

  const todo = await prisma.todo.create({
    data: {
      title,
      description: description ?? undefined,
      userId: session.id,
    },
  });

  return NextResponse.json(
    {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    },
    { status: 201 }
  );
}