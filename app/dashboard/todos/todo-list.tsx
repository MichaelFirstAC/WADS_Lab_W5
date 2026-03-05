"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTodo, updateTodo, deleteTodo } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";

export type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type TodoListProps = {
  initialTodos: TodoItem[];
};

export function TodoList({ initialTodos }: TodoListProps) {
  const router = useRouter();
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [isAdding, setIsAdding] = useState(false);

  
  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title")?.toString().trim();
    if (!title) {
      toast.error("Title is required.");
      return;
    }
    setIsAdding(true);
    try {
      const result = await createTodo(formData);
      if (result.success) {
        toast.success("Todo added.");
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleComplete = async (todo: TodoItem) => {
    try {
      const result = await updateTodo(todo.id, { completed: !todo.completed });
      if (result.success) {
        setTodos((prev) =>
          prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
        );
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to update.");
    }
  };

  const handleEdit = async (todoId: string, title: string, description: string | null) => {
    if (!title.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }
    setEditingId(todoId);
    try {
      const result = await updateTodo(todoId, {
        title: title.trim(),
        description: description?.trim() || null,
      });
      if (result.success) {
        toast.success("Todo updated.");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to update.");
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (todoId: string) => {
    setDeletingId(todoId);
    try {
      const result = await deleteTodo(todoId);
      if (result.success) {
        setTodos((prev) => prev.filter((t) => t.id !== todoId));
        toast.success("Todo deleted.");
        setDeletingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
        setDeletingId(null);
      }
    } catch {
      toast.error("Failed to delete.");
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Todo List</h2>
        <p className="text-muted-foreground">
          Add, edit, and complete your tasks.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Add a new todo</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="What needs to be done?"
                required
                maxLength={500}
                disabled={isAdding}
                className="h-10"
              />
            </div>
            <div className="flex-1 space-y-2 sm:max-w-xs">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Add details…"
                maxLength={1000}
                disabled={isAdding}
                className="h-10"
              />
            </div>
            <Button type="submit" disabled={isAdding} className="h-10 shrink-0">
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Tasks</h3>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No todos yet. Add one above.
            </p>
          ) : (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Checkbox
                      id={`check-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo)}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`check-${todo.id}`}
                        className={`cursor-pointer font-medium ${
                          todo.completed ? "text-muted-foreground line-through" : ""
                        }`}
                      >
                        {todo.title}
                      </label>
                      {todo.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <EditTodoDialog
                      todo={todo}
                      onSave={handleEdit}
                      isEditing={editingId === todo.id}
                      onOpenChange={(open) => !open && setEditingId(null)}
                    />
                    <AlertDialog
                      open={deletingId === todo.id}
                      onOpenChange={(open) => !open && setDeletingId(null)}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete todo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{todo.title}&quot;? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(todo.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeletingId(todo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EditTodoDialog({
  todo,
  onSave,
  isEditing,
  onOpenChange,
}: {
  todo: TodoItem;
  onSave: (id: string, title: string, description: string | null) => Promise<void>;
  isEditing: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(todo.id, title, description || null).then(() => setOpen(false));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        onOpenChange(o);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0" disabled={isEditing}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit todo</DialogTitle>
          <DialogDescription>Change the title and description.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              maxLength={1000}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}