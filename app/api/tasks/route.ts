import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getUserTasks, createTask } from "@/lib/db-utils"
import { getUserIdFromSessionServer } from "@/lib/auth-utils"

// Schema for task creation
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : undefined),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  locations: z.array(
    z.object({
      name: z.string().min(1),
      latitude: z.number(),
      longitude: z.number(),
      radius: z.number().default(100),
      notifyOnArrival: z.boolean().default(false),
      notifyOnDeparture: z.boolean().default(false),
      reminderMessage: z.string().optional()
    })
  ).optional()
})

// GET /api/tasks - Get all tasks for the authenticated user
export async function GET() {
  const userId = await getUserIdFromSessionServer();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await getUserTasks(userId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromSessionServer();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json()
    const result = createTaskSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.format() },
        { status: 400 }
      )
    }

    const task = await createTask({
      ...result.data,
      userId: userId,
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
} 