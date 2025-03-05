import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getTaskById, updateTask, deleteTask } from "@/lib/db-utils"
import { getUserIdFromSession } from "@/lib/auth-utils"

// Schema for task update
const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  priority: z.enum(["low", "medium", "high"]).optional(),
})

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const task = await getTaskById(params.id, userId);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.format() },
        { status: 400 }
      );
    }

    const task = await updateTask(params.id, userId, result.data);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteTask(params.id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
} 