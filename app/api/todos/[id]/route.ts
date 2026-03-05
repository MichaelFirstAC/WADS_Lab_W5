import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to update a todo." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Todo id is required." }, { status: 400 });
  }

  let body: { title?: string; description?: string | null; completed?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (body.title !== undefined && typeof body.title !== "string") {
    return NextResponse.json(
      { error: "title must be a string." },
      { status: 400 }
    );
  }
  if (body.title !== undefined && !body.title.trim()) {
    return NextResponse.json(
      { error: "Title cannot be empty." },
      { status: 400 }
    );
  }

  const updatePayload: { title?: string; description?: string | null; completed?: boolean } = {};
  if (body.title !== undefined) updatePayload.title = body.title.trim();
  if (body.description !== undefined) updatePayload.description = body.description?.trim() || null;
  if (typeof body.completed === "boolean") updatePayload.completed = body.completed;

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { error: "Provide at least one of: title, description, completed." },
      { status: 400 }
    );
  }

  const todo = await prisma.todo.findFirst({
    where: { id, userId: session.id },
  });

  if (!todo) {
    return NextResponse.json({ error: "Todo not found." }, { status: 404 });
  }

  const updated = await prisma.todo.update({
    where: { id },
    data: updatePayload,
  });

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    completed: updated.completed,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to delete a todo." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Todo id is required." }, { status: 400 });
  }

  const todo = await prisma.todo.findFirst({
    where: { id, userId: session.id },
  });

  if (!todo) {
    return NextResponse.json({ error: "Todo not found." }, { status: 404 });
  }

  await prisma.todo.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}